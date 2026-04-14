import { NextApiRequest, NextApiResponse } from 'next';

const getPrivacyPolicy = async (req: NextApiRequest, res: NextApiResponse) => {
  const response = await fetch('https://example.com/privacy-policy');
  const data = await response.json();
  res.json(data);
};

const getTermsOfService = async (req: NextApiRequest, res: NextApiResponse) => {
  const response = await fetch('https://example.com/terms-of-service');
  const data = await response.json();
  res.json(data);
};

export { getPrivacyPolicy, getTermsOfService };