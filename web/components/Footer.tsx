import Link from 'next/link';
import { useState, useEffect } from 'react';

const Footer = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsOfService, setTermsOfService] = useState('');

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      const response = await fetch('/api/privacy-policy');
      const data = await response.json();
      setPrivacyPolicy(data);
    };

    const fetchTermsOfService = async () => {
      const response = await fetch('/api/terms-of-service');
      const data = await response.json();
      setTermsOfService(data);
    };

    fetchPrivacyPolicy();
    fetchTermsOfService();
  }, []);

  return (
    <footer>
      <div>
        <Link href="/privacy-policy">
          <a>{privacyPolicy}</a>
        </Link>
      </div>
      <div>
        <Link href="/terms-of-service">
          <a>{termsOfService}</a>
        </Link>
      </div>
      <div>
        &copy; {new Date().getFullYear()} Vete (Paragu-AI)
      </div>
    </footer>
  );
};

export default Footer;