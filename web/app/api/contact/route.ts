import { NextResponse } from 'next/server';
import { setCSPHeaders } from '@/lib/utils';

export async function POST() {
  const response = NextResponse.json({ message: 'Contact form submitted successfully' });
  setCSPHeaders(response);

  return response;
}

Note: The above code snippets demonstrate how to set CSP headers in different parts of the application. You should adapt these examples to fit your specific use case and ensure that the CSP headers are set consistently throughout your application. 

Additionally, you may want to consider setting the CSP headers at a higher level, such as in a middleware function, to ensure that they are applied to all responses. 

For example, you could create a middleware function like this: