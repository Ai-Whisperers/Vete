import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSecret = process.env.SUPABASE_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export const getPets = async () => {
  const { data, error } = await supabase
    .from('pets')
    .select('id, name, species, owner_id');
  if (error) {
    logger.error('Error fetching pets:', error);
    throw error;
  }
  return data;
};

export const getAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, pet_id, date, time');
  if (error) {
    logger.error('Error fetching appointments:', error);
    throw error;
  }
  return data;
};

export const getPetAppointments = async (petId: number) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, date, time')
    .eq('pet_id', petId);
  if (error) {
    logger.error('Error fetching pet appointments:', error);
    throw error;
  }
  return data;
};