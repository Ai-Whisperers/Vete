import { useState } from 'react';

interface PhotoUploadProps {
  onPhotoChange: (photo: File) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoChange }) => {
  const [photo, setPhoto] = useState(null);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoto(event.target.files[0]);
    onPhotoChange(event.target.files[0]);
  };

  return (
    <input type="file" onChange={handlePhotoChange} />
  );
};

export default PhotoUpload;