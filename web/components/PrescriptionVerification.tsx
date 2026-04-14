import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Prescription } from '../types';

const PrescriptionVerification = () => {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  const handleUploadPrescription = async (file: File) => {
    const { data, error } = await supabase.storage.from('prescriptions').upload(file.name, file);
    if (error) {
      console.error(error);
    } else {
      setPrescription({ id: data.id, file: data.file });
    }
  };

  const handleStaffApproval = async () => {
    const { data, error } = await supabase.from('prescriptions').update(prescription.id, { status: 'approved' });
    if (error) {
      console.error(error);
    } else {
      setVerificationStatus('approved');
    }
  };

  const handleExpiryTracking = async () => {
    const { data, error } = await supabase.from('prescriptions').update(prescription.id, { expiryDate: new Date() });
    if (error) {
      console.error(error);
    } else {
      setExpiryDate(new Date());
    }
  };

  useEffect(() => {
    const fetchPrescription = async () => {
      const { data, error } = await supabase.from('prescriptions').select('*');
      if (error) {
        console.error(error);
      } else {
        setPrescription(data[0]);
      }
    };
    fetchPrescription();
  }, []);

  return (
    <div>
      <h1>Prescription Verification</h1>
      {prescription && (
        <div>
          <p>Prescription ID: {prescription.id}</p>
          <p>File: {prescription.file}</p>
          <button onClick={handleStaffApproval}>Approve</button>
          <button onClick={handleExpiryTracking}>Track Expiry</button>
          {verificationStatus && <p>Verification Status: {verificationStatus}</p>}
          {expiryDate && <p>Expiry Date: {expiryDate.toISOString()}</p>}
        </div>
      )}
      <input type="file" onChange={(e) => handleUploadPrescription(e.target.files[0])} />
    </div>
  );
};

export default PrescriptionVerification;