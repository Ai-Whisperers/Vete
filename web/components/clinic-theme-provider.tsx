
'use client';

import { ClinicTheme } from '@/lib/clinics';
import { useEffect } from 'react';

export function ClinicThemeProvider({ theme }: { theme: ClinicTheme }) {
  useEffect(() => {
    const root = document.documentElement;
    
    // Safely set a property if it exists
    const setProp = (name: string, value: string) => {
        if (value) root.style.setProperty(name, value);
    };

    // 1. Primitive Colors (Backwards compatibility + New System)
    // We map the new "main" colors to the old simple variables for safety
    // @ts-ignore
    setProp('--primary', theme.colors.primary.main || theme.colors.primary);
    // @ts-ignore
    setProp('--accent', theme.colors.secondary?.main || theme.colors.accent);
    
    // 2. Rich Color System
    // @ts-ignore
    setProp('--primary-light', theme.colors.primary.light);
    // @ts-ignore
    setProp('--primary-dark', theme.colors.primary.dark);
    // @ts-ignore
    setProp('--primary-contrast', theme.colors.primary.contrast);

    // @ts-ignore
    if (theme.colors.secondary) {
        // @ts-ignore
        setProp('--secondary', theme.colors.secondary.main);
        // @ts-ignore
        setProp('--secondary-light', theme.colors.secondary.light);
    }

    // 3. Backgrounds & Text
    // @ts-ignore
    setProp('--bg-default', theme.colors.background?.default || '#ffffff');
    // @ts-ignore
    setProp('--bg-paper', theme.colors.background?.paper || '#f9FAfb');
    // @ts-ignore
    setProp('--bg-subtle', theme.colors.background?.subtle || '#f3f4f6');
    
    // @ts-ignore
    setProp('--text-main', theme.colors.text?.primary || '#111827');
    // @ts-ignore
    setProp('--text-secondary', theme.colors.text?.secondary || '#4B5563');
    // @ts-ignore
    setProp('--text-muted', theme.colors.text?.muted || '#9CA3AF');
    // @ts-ignore
    setProp('--text-invert', theme.colors.text?.invert || '#FFFFFF');

    // 4. Gradients
    // @ts-ignore
    setProp('--gradient-hero', theme.gradients?.hero);
    // @ts-ignore
    setProp('--gradient-primary', theme.gradients?.primary);

    // 5. UI
    setProp('--radius', theme.ui.border_radius);
    // @ts-ignore
    setProp('--shadow-sm', theme.ui.shadow_sm);
    // @ts-ignore
    setProp('--shadow-md', theme.ui.shadow_md);
    
    // 6. Fonts
    setProp('--font-heading', theme.fonts.heading);
    setProp('--font-body', theme.fonts.body);

  }, [theme]);

  return null;
}
