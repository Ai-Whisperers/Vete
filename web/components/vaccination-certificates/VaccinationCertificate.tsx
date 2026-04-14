import React from 'react';

interface VaccinationCertificateProps {
  vaccinationCertificate: VaccinationCertificate;
}

const VaccinationCertificate: React.FC<VaccinationCertificateProps> = ({ vaccinationCertificate }) => {
  return (
    <div>
      <h2>Vaccination Certificate</h2>
      <p>Certificate Number: {vaccinationCertificate.certificateNumber}</p>
      <p>Issued At: {vaccinationCertificate.issuedAt.toISOString()}</p>
      <p>Expires At: {vaccinationCertificate.expiresAt?.toISOString()}</p>
      <p>QR Code: {vaccinationCertificate.qrCode}</p>
    </div>
  );
};

export default VaccinationCertificate;

### Database Schema

You need to add the following table to your database schema:

CREATE TABLE vaccination_certificates (
  id UUID PRIMARY KEY,
  pet_id UUID NOT NULL,
  vaccine_id UUID NOT NULL,
  issued_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  certificate_number VARCHAR(255) NOT NULL,
  qr_code VARCHAR(255) NOT NULL,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

Remember to run the migration to apply the changes to your database.

This implementation provides a basic structure for managing vaccination certificates. You can extend it as needed to fit your specific requirements.