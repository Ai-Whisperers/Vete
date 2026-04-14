import { useTranslation } from 'next-i18next';

const useNumber = () => {
  const { i18n } = useTranslation();

  const formatNumber = (number: number) => {
    const locale = i18n.language;
    return new Intl.NumberFormat(locale).format(number);
  };

  return { formatNumber };
};

export default useNumber;