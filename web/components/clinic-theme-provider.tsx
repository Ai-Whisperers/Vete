
'use client';

import { ClinicTheme } from '@/lib/clinics';
import { useEffect } from 'react';

export function ClinicThemeProvider({ theme }: { theme: ClinicTheme }) {
  useEffect(() => {
    const root = document.documentElement;

    // Safely set a property if it exists
    const setProp = (name: string, value: string | undefined) => {
        if (value) root.style.setProperty(name, value);
    };

    // 1. Primitive Colors (Backwards compatibility + New System)
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
        // @ts-ignore
        setProp('--secondary-dark', theme.colors.secondary.dark);
        // @ts-ignore
        setProp('--secondary-contrast', theme.colors.secondary.contrast);
    }

    // 3. Backgrounds & Text
    // @ts-ignore
    setProp('--bg-default', theme.colors.background?.default || '#ffffff');
    // @ts-ignore
    setProp('--bg-paper', theme.colors.background?.paper || '#f9FAfb');
    // @ts-ignore
    setProp('--bg-subtle', theme.colors.background?.subtle || '#f3f4f6');
    // @ts-ignore
    setProp('--bg-dark', theme.colors.background?.dark || '#1a1a1a');

    // @ts-ignore
    setProp('--text-primary', theme.colors.text?.primary || '#111827');
    // @ts-ignore
    setProp('--text-main', theme.colors.text?.primary || '#111827');
    // @ts-ignore
    setProp('--text-secondary', theme.colors.text?.secondary || '#4B5563');
    // @ts-ignore
    setProp('--text-muted', theme.colors.text?.muted || '#9CA3AF');
    // @ts-ignore
    setProp('--text-invert', theme.colors.text?.invert || '#FFFFFF');

    // 4. Status colors
    // @ts-ignore
    if (theme.colors.status) {
      // @ts-ignore
      setProp('--success', theme.colors.status.success);
      // @ts-ignore
      setProp('--warning', theme.colors.status.warning);
      // @ts-ignore
      setProp('--error', theme.colors.status.error);
      // @ts-ignore
      setProp('--info', theme.colors.status.info);
    }

    // 5. Border colors
    // @ts-ignore
    if (theme.colors.border) {
      // @ts-ignore
      setProp('--border-light', theme.colors.border.light);
      // @ts-ignore
      setProp('--border-default', theme.colors.border.default);
      // @ts-ignore
      setProp('--border-dark', theme.colors.border.dark);
    }

    // 6. Gradients
    // @ts-ignore
    setProp('--gradient-hero', theme.gradients?.hero);
    // @ts-ignore
    setProp('--gradient-primary', theme.gradients?.primary);
    // @ts-ignore
    setProp('--gradient-accent', theme.gradients?.accent);
    // @ts-ignore
    setProp('--gradient-dark', theme.gradients?.dark);
    // @ts-ignore
    setProp('--gradient-card', theme.gradients?.card);

    // 7. UI
    setProp('--radius', theme.ui.border_radius);
    // @ts-ignore
    setProp('--radius-sm', theme.ui.border_radius_sm);
    // @ts-ignore
    setProp('--radius-lg', theme.ui.border_radius_lg);
    // @ts-ignore
    setProp('--radius-full', theme.ui.border_radius_full);
    // @ts-ignore
    setProp('--shadow-sm', theme.ui.shadow_sm);
    // @ts-ignore
    setProp('--shadow-md', theme.ui.shadow_md);
    // @ts-ignore
    setProp('--shadow-lg', theme.ui.shadow_lg);
    // @ts-ignore
    setProp('--shadow-xl', theme.ui.shadow_xl);

    // 8. Fonts
    setProp('--font-heading', theme.fonts.heading);
    setProp('--font-body', theme.fonts.body);

  }, [theme]);

  return null;
}
