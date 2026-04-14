import { useState, useEffect } from 'react';

const TermsOfService = () => {
  const [termsOfService, setTermsOfService] = useState('');

  useEffect(() => {
    const fetchTermsOfService = async () => {
      const response = await fetch('/api/terms-of-service');
      const data = await response.json();
      setTermsOfService(data);
    };

    fetchTermsOfService();
  }, []);

  return (
    <div>
      <h1>Terms of Service</h1>
      <p>{termsOfService}</p>
    </div>
  );
};

export default TermsOfService;