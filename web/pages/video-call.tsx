import { VideoCall } from '../components/VideoCall';

const VideoCallPage = () => {
  const patientId = 1;
  const veterinarianId = 1;

  return (
    <div>
      <VideoCall patientId={patientId} veterinarianId={veterinarianId} />
    </div>
  );
};

export default VideoCallPage;