import { VideoConsultationBooking } from '../components/VideoConsultationBooking';

const VideoConsultationBookingPage = () => {
  const patientId = 1;
  const veterinarianId = 1;

  return (
    <div>
      <VideoConsultationBooking patientId={patientId} veterinarianId={veterinarianId} />
    </div>
  );
};

export default VideoConsultationBookingPage;