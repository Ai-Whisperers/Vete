import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clinic } from '../types/Clinic';

interface ClinicBrandingProps {
  clinicId: number;
}

const ClinicBranding: React.FC<ClinicBrandingProps> = ({ clinicId }) => {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [colorScheme, setColorScheme] = useState<string | null>(null);
  const [theme, setTheme] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinic = async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId);
      if (data && data.length > 0) {
        setClinic(data[0]);
        setLogo(data[0].logo);
        setColorScheme(data[0].color_scheme);
        setTheme(data[0].theme);
        setFavicon(data[0].favicon);
      }
    };
    fetchClinic();
  }, [clinicId]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    const { data, error } = await supabase.storage
      .from('clinics')
      .upload(`logo/${clinicId}`, file, {
        upsert: true,
      });
    if (data) {
      setLogo(data.Key);
      await supabase
        .from('clinics')
        .update({ id: clinicId, logo: data.Key });
    }
  };

  const handleColorSchemeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const colorScheme = event.target.value;
    setColorScheme(colorScheme);
    await supabase
      .from('clinics')
      .update({ id: clinicId, color_scheme: colorScheme });
  };

  const handleThemeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const theme = event.target.value;
    setTheme(theme);
    await supabase
      .from('clinics')
      .update({ id: clinicId, theme: theme });
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    const { data, error } = await supabase.storage
      .from('clinics')
      .upload(`favicon/${clinicId}`, file, {
        upsert: true,
      });
    if (data) {
      setFavicon(data.Key);
      await supabase
        .from('clinics')
        .update({ id: clinicId, favicon: data.Key });
    }
  };

  return (
    <div>
      <h1>Clinic Branding</h1>
      {clinic && (
        <div>
          <label>Logo:</label>
          <input type="file" onChange={handleLogoUpload} />
          {logo && <img src={`https://your-supabase-bucket.s3.amazonaws.com/${logo}`} alt="Logo" />}
          <br />
          <label>Color Scheme:</label>
          <input type="text" value={colorScheme} onChange={handleColorSchemeChange} />
          <br />
          <label>Theme:</label>
          <input type="text" value={theme} onChange={handleThemeChange} />
          <br />
          <label>Favicon:</label>
          <input type="file" onChange={handleFaviconUpload} />
          {favicon && <img src={`https://your-supabase-bucket.s3.amazonaws.com/${favicon}`} alt="Favicon" />}
        </div>
      )}
    </div>
  );
};

export default ClinicBranding;