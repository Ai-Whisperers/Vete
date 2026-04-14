import type { NextPage } from 'next';
import { useState } from 'react';
import { BrandingService } from '@/lib/domain/clinic/branding/service';
import { createClient } from '@/lib/supabase/client';

const BrandingPage: NextPage = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [theme, setTheme] = useState('light');
  const [faviconUrl, setFaviconUrl] = useState('');

  const supabase = createClient();
  const brandingService = new BrandingService(supabase);

  const handleSave = async () => {
    const data = {
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      theme,
      favicon_url: faviconUrl,
    };

    try {
      await brandingService.createBranding(data);
      console.log('Branding created successfully');
    } catch (error) {
      console.error('Error creating branding:', error);
    }
  };

  return (
    <div>
      <h1>Branding</h1>
      <form>
        <label>
          Logo URL:
          <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
        </label>
        <br />
        <label>
          Primary Color:
          <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
        </label>
        <br />
        <label>
          Secondary Color:
          <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
        </label>
        <br />
        <label>
          Theme:
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <br />
        <label>
          Favicon URL:
          <input type="text" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} />
        </label>
        <br />
        <button type="button" onClick={handleSave}>
          Save
        </button>
      </form>
    </div>
  );
};

export default BrandingPage;