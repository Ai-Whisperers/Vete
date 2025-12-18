
import { createClient } from '@/lib/supabase/server';

export async function logAudit(
    action: string,
    resource: string,
    details: any = {}
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return; // Can't log if no user? Or log as 'system'?

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();
    
    if (!profile) return;

    await supabase.from('audit_logs').insert({
        tenant_id: profile.tenant_id,
        user_id: user.id,
        action,
        resource,
        details,
        ip_address: '0.0.0.0', // Need headers() to get real IP, maybe pass req
        user_agent: 'server-action'
    });
}
