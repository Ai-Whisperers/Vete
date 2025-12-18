"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface SuccessToastProps {
  message: string;
}

export function SuccessToast({ message }: SuccessToastProps): React.ReactElement | null {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      // Clean up URL param
      router.replace(pathname, { scroll: false });
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, pathname]);

  const handleDismiss = (): void => {
    setVisible(false);
    router.replace(pathname, { scroll: false });
  };

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 max-w-md">
        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
        <span className="font-medium text-sm">{message}</span>
        <button
          onClick={handleDismiss}
          className="ml-2 p-1 hover:bg-green-100 rounded-lg transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
