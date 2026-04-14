import { NextRequest } from 'next/server';
import { getLoyaltyPoints } from './actions';
import { createLoyaltyPoints } from './actions';
import { updateLoyaltyPoints } from './actions';
import { getLoyaltyTransactions } from './actions';
import { createLoyaltyTransaction } from './actions';

export async function GET(request: NextRequest) {
  return getLoyaltyPoints(request);
}

export async function POST(request: NextRequest) {
  return createLoyaltyPoints(request);
}

export async function PATCH(request: NextRequest) {
  return updateLoyaltyPoints(request);
}

export async function GET_transactions(request: NextRequest) {
  return getLoyaltyTransactions(request);
}

export async function POST_transactions(request: NextRequest) {
  return createLoyaltyTransaction(request);
}

This implementation provides a basic structure for the loyalty points engine. You can extend and modify it according to your specific requirements.