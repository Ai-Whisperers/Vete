# Data Fetching Standard

This document outlines the standard patterns for data fetching to be used across the application. Following these patterns will ensure consistency, performance, and a good developer experience.

## 1. Server-Side Fetching (Initial Data Loads)

For initial data loads on a page, use **React Server Components** with the native `fetch()` API. This is the most performant way to get data to the user quickly, as it runs on the server and streams the result to the client.

**When to use:**
*   Fetching data that is essential for the initial render of a page.
*   Fetching data in components that do not require interactivity.

**Example:**
```tsx
// app/dashboard/page.tsx (Server Component)

async function getDashboardData() {
  const res = await fetch('https://api.example.com/dashboard', {
    next: { revalidate: 3600 }, // Revalidate every hour
  });
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return res.json();
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

## 2. Data Mutations (Create, Update, Delete)

For all data mutations, use **Server Actions**. Server Actions allow client components to securely call server-side code, making it easy to perform mutations without having to create separate API endpoints.

**When to use:**
*   Submitting forms (e.g., creating a new appointment).
*   Performing any action that modifies data on the server.

**Example:**
```tsx
// app/actions/create-item.ts (Server Action)
'use server';

import { revalidatePath } from 'next/cache';

export async function createItem(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
  };

  // Here you would typically validate the data and insert it into the database
  console.log('Creating item:', rawData);

  revalidatePath('/items'); // Revalidate the items page to show the new item
}
```
```tsx
// app/items/page.tsx (Client Component)
'use client';

import { createItem } from '@/app/actions/create-item';

export default function ItemsPage() {
  return (
    <form action={createItem}>
      <input type="text" name="name" />
      <button type="submit">Create Item</button>
    </form>
  );
}
```

## 3. Client-Side Fetching (Dynamic/Interactive Data)

For dynamic, interactive, or real-time data needs on the client, use **TanStack Query**. It provides excellent caching, revalidation, and other features that make it ideal for managing server state in client components.

**When to use:**
*   Fetching data in response to user interaction (e.g., filtering a list).
*   Fetching data that changes frequently (e.g., a real-time dashboard).
*   Fetching data in components that are used in multiple places and can benefit from a shared cache.

**Example:**
```tsx
// app/components/items-list.tsx (Client Component)
'use client';

import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const fetchItems = async () => {
  const res = await fetch('/api/items');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

function ItemsList() {
  const { data, error, isPending } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map((item: any) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

export default function ItemsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ItemsList />
    </QueryClientProvider>
  );
}
```
