// pages/index.tsx
import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the app is installed
    if ('BeforeInstallPrompt' in window) {
      const beforeInstallPrompt = (window as any).beforeInstallPrompt;
      beforeInstallPrompt.prompt().then((result: any) => {
        if (result === 'user-dismissed') {
          console.log('User dismissed the install prompt');
        } else {
          console.log('User installed the app');
        }
      });
    }
  }, [router]);

  return (
    <div>
      <h1>Welcome to Vete</h1>
    </div>
  );
};

export default Home;