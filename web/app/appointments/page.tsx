import { AppointmentService } from '@/lib/domain/appointments/service'

export default function AppointmentsPage() {
  const appointmentService = new AppointmentService(createClient())

  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const fetchAppointments = async () => {
      const appointments = await appointmentService.getAppointments({}, 'tenant-id')
      setAppointments(appointments)
    }

    fetchAppointments()
  }, [])

  return (
    <div>
      <h1>Appointments</h1>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            {appointment.pet_id} - {appointment.start_time}
          </li>
        ))}
      </ul>
    </div>
  )
}