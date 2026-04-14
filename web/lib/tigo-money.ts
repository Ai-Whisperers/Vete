import axios from 'axios';

const tigoMoneyApiKey = process.env.TIGO_MONEY_API_KEY;
const tigoMoneyApiSecret = process.env.TIGO_MONEY_API_SECRET;

const tigoMoneyApi = axios.create({
  baseURL: 'https://api.tigo.money',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': tigoMoneyApiKey,
    'X-Api-Secret': tigoMoneyApiSecret,
  },
});

const getPaymentStatus = async (paymentId: string) => {
  try {
    const response = await tigoMoneyApi.get(`/payment/${paymentId}`);
    return response.data.status;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const refundPayment = async (paymentId: string) => {
  try {
    const response = await tigoMoneyApi.post(`/payment/${paymentId}/refund`);
    return response.data.success;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export { getPaymentStatus, refundPayment };