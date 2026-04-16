import { NextResponse } from 'next/server';
import { setCSPHeaders } from '@/lib/utils';

export function cspMiddleware(request: Request) {
  const response = NextResponse.next(request);
  setCSPHeaders(response);

  return response;
}

You can then apply this middleware function to your application using the `middleware` function provided by Next.js. 

Remember to adjust the CSP policy to fit your specific needs and ensure that it is not too restrictive, as this can cause issues with your application's functionality.