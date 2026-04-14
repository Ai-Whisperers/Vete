// lib/deploy.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSecret = process.env.SUPABASE_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export async function createPreviewDeployment(prId: string) {
  try {
    // Create a new preview deployment
    const { data, error } = await supabase
      .from('deployments')
      .insert([{ id: prId, status: 'pending' }]);

    if (error) {
      throw error;
    }

    // Create a new preview URL
    const previewUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/${prId}`;

    // Update the deployment with the preview URL
    await supabase
      .from('deployments')
      .update({ id: prId, preview_url: previewUrl, status: 'ready' });

    return previewUrl;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function cleanupPreviewDeployment(prId: string) {
  try {
    // Update the deployment status to 'cleaning up'
    await supabase
      .from('deployments')
      .update({ id: prId, status: 'cleaning up' });

    // Delete the preview deployment
    await supabase
      .from('deployments')
      .delete({ id: prId });

    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}