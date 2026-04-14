import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';

const useDate = () => {
  const { i18n } = useTranslation();

  const formatDate = (date: Date) => {
    const locale = i18n.language;
    return format(date, 'yyyy-MM-dd', { locale });
  };

  return { formatDate };
};

export default useDate;