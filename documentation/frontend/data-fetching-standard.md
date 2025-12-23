# Data Fetching Standard

This document outlines the official standards for fetching and mutating data in this project. Adhering to these patterns is crucial for maintaining a consistent, performant, and maintainable codebase.

## 1. Server-Side Data Fetching (The Default)

For fetching data that is required for the initial render of a page, **always** use `async` React Server Components (RSCs) with the native `fetch` API.

- **When to use:** Fetching data in `page.tsx` or any server-side layout/component.
- **Why:** This is the most performant method. Data is fetched on the server, and the component is rendered to HTML before being sent to the client, reducing client-side JavaScript and improving load times.

**Example:**
```tsx
// app/some-page/page.tsx

async function getData(id: string) {
  const res = await fetch(`https://api.example.com/items/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function Page({ params }: { params: { id: string } }) {
  const data = await getData(params.id);

  return <div>{data.name}</div>;
}
```

## 2. Client-Side Data Fetching

For data that is dynamic, needs to be re-fetched on the client based on user interaction, or is specific to the logged-in user and not needed for the initial SEO-critical render, use **`@tanstack/react-query`**.

- **When to use:**
  - Fetching data in response to user events (e.g., clicking a button).
  - Data that changes frequently (e.g., a real-time dashboard).
  - Managing complex cache invalidation.
- **Why:** It provides a robust solution for caching, revalidation, and managing the state of server data on the client, avoiding complex `useState` and `useEffect` logic.

**Example:**
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';

// This requires a <QueryClientProvider> wrapper further up the tree.

function MyComponent() {
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/TanStack/query').then((res) =>
        res.json(),
      ),
  });

  if (isPending) return 'Loading...';
  if (error) return 'An error has occurred: ' + error.message;

  return <div>{data.name}</div>;
}
```

## 3. Data Mutations (Creating, Updating, Deleting)

For all data mutations, **always** use **Server Actions**.

- **When to use:** Submitting forms, deleting items, updating settings.
- **Why:** Server Actions provide a direct and secure way to call server-side functions from client components without needing to create intermediate API endpoints. They are a core feature of the Next.js App Router and provide a great developer experience with progressive enhancement.

**Example:**
```ts
// app/actions.ts
'use server';

export async function createItem(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
  };
  // ... logic to validate and save to database
  // revalidatePath(...);
}
```
```tsx
// app/some-form-component.tsx
'use client';

import { createItem } from './actions';

export function ItemForm() {
  return (
    <form action={createItem}>
      <input type="text" name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}
```
