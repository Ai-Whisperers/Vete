import { useState } from 'react';
import { formatDate } from '../utils/format';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  localeCode: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, localeCode }) => {
  const [date, setDate] = useState(value);

  const handleChange = (date: Date) => {
    setDate(date);
    onChange(date);
  };

  return (
    <input
      type="date"
      value={formatDate(date, localeCode, 'yyyy-MM-dd')}
      onChange={(e) => handleChange(new Date(e.target.value))}
    />
  );
};

export default DatePicker;