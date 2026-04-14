import { useState, useEffect } from 'react';

const PrivacyPolicy = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState('');

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      const response = await fetch('/api/privacy-policy');
      const data = await response.json();
      setPrivacyPolicy(data);
    };

    fetchPrivacyPolicy();
  }, []);

  return (
    <div>
      <h1>Privacy Policy</h1>
      <p>{privacyPolicy}</p>
    </div>
  );
};

export default PrivacyPolicy;