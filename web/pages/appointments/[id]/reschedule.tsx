import RescheduleForm from '../../components/appointments/RescheduleForm';

const ReschedulePage = () => {
  const id = '123'; // Get id from params

  return (
    <div>
      <h1>Reschedule Appointment {id}</h1>
      <RescheduleForm appointmentId={parseInt(id)} />
    </div>
  );
};

export default ReschedulePage;