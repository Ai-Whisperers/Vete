import React from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { DownloadIcon, QrCodeIcon } from '@heroicons/react/outline';

interface VaccinationCertificateProps {
  petId: number;
}

const VaccinationCertificate: React.FC<VaccinationCertificateProps> = ({ petId }) => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vaccination_certificates')
        .select('*')
        .eq('pet_id', petId);
      if (error) {
        console.error(error);
      } else {
        setCertificate(data[0]);
      }
      setLoading(false);
    };
    fetchCertificate();
  }, [petId]);

  const handleDownload = async () => {
    if (certificate) {
      const { data, error } = await supabase.storage
        .from('vaccination_certificates')
        .download(certificate.file_name);
      if (error) {
        console.error(error);
      } else {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = certificate.file_name;
        a.click();
      }
    }
  };

  const handleQrCodeVerification = async () => {
    if (certificate) {
      // TO DO: implement QR code verification logic
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {certificate ? (
            <div>
              <h2>Vaccination Certificate</h2>
              <p>Pet Name: {certificate.pet_name}</p>
              <p>Vaccination Date: {certificate.vaccination_date}</p>
              <p>Vaccination Type: {certificate.vaccination_type}</p>
              <button onClick={handleDownload}>
                <DownloadIcon />
                Download Certificate
              </button>
              <button onClick={handleQrCodeVerification}>
                <QrCodeIcon />
                Verify QR Code
              </button>
            </div>
          ) : (
            <p>No vaccination certificate found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VaccinationCertificate;