import { useState } from 'react';

interface SettingsFormProps {
  onSubmit: (data: any) => void;
}

const SettingsForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="setting1" value={formData.setting1} onChange={handleChange} />
      <input type="text" name="setting2" value={formData.setting2} onChange={handleChange} />
      <button type="submit">Save</button>
    </form>
  );
};

export default SettingsForm;