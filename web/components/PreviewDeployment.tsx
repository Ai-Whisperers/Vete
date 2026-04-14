// components/PreviewDeployment.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

interface PreviewDeploymentProps {
  prId: string;
}

const PreviewDeployment: React.FC<PreviewDeploymentProps> = ({ prId }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPreviewUrl = async () => {
      try {
        const response = await axios.post('/api/preview', { prId });
        setPreviewUrl(response.data.previewUrl);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPreviewUrl();
  }, [prId]);

  const handleCleanup = async () => {
    try {
      await axios.delete('/api/preview', { data: { prId } });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>
          Preview URL: {previewUrl}
          <button onClick={handleCleanup}>Cleanup</button>
        </p>
      )}
    </div>
  );
};

export default PreviewDeployment;
Note: The above code is just a starting point and may require modifications to fit your specific use case. Additionally, you will need to set up a GitHub Actions workflow to automate the creation and cleanup of preview deployments.