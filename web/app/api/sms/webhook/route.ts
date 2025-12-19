import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/sms/webhook
 * Twilio SMS delivery status webhook
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const {
      MessageSid,
      MessageStatus,
      To,
      From,
      ErrorCode,
      ErrorMessage
    } = data;

    console.log('SMS Webhook received:', { MessageSid, MessageStatus, To });

    if (!MessageSid) {
      return new NextResponse('Missing MessageSid', { status: 400 });
    }

    const supabase = await createClient();

    // Update the message status in whatsapp_messages (unified messaging table)
    const statusMap: Record<string, string> = {
      'queued': 'pending',
      'sending': 'sending',
      'sent': 'sent',
      'delivered': 'delivered',
      'undelivered': 'failed',
      'failed': 'failed'
    };

    const newStatus = statusMap[MessageStatus] || MessageStatus;

    const { error: updateError } = await supabase
      .from('whatsapp_messages')
      .update({
        status: newStatus,
        delivered_at: MessageStatus === 'delivered' ? new Date().toISOString() : null,
        error_code: ErrorCode || null,
        error_message: ErrorMessage || null
      })
      .eq('external_id', MessageSid);

    if (updateError) {
      console.error('Error updating message status:', updateError);
    }

    // Also update notification_queue if there's a matching entry
    await supabase
      .from('notification_queue')
      .update({
        status: newStatus === 'delivered' ? 'sent' : newStatus === 'failed' ? 'failed' : 'sent',
        delivered_at: MessageStatus === 'delivered' ? new Date().toISOString() : null,
        error_message: ErrorMessage || null
      })
      .eq('external_id', MessageSid);

    // Log the status update
    console.log(`SMS ${MessageSid} status updated to ${newStatus}`);

    return new NextResponse('OK', { status: 200 });
  } catch (e) {
    console.error('Error processing SMS webhook:', e);
    return new NextResponse('Error', { status: 500 });
  }
}

// Also handle GET for Twilio validation
export async function GET(): Promise<NextResponse> {
  return new NextResponse('SMS Webhook Active', { status: 200 });
}
