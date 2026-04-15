import { NextResponse } from 'next/server';
import { getKennels, createKennel, updateKennel } from './actions';

export async function GET(request: Request) {
  return NextResponse.json(await getKennels(request));
}

export async function POST(request: Request) {
  return NextResponse.json(await createKennel(request));
}

export async function PATCH(request: Request) {
  return NextResponse.json(await updateKennel(request));
}