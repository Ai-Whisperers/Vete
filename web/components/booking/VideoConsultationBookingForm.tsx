import { useState } from 'react'
import { useBookingStore } from '@/lib/store/booking-store'

export function VideoConsultationBookingForm() {
  const [consultationType, setConsultationType] = useState('video')
  const [serviceId, setServiceId] = useState(null)
  const [petId, setPetId] = useState(null)
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [notes, setNotes] = useState('')

  const { updateSelection } = useBookingStore()

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationType,
          serviceId,
          petId,
          date,
          timeSlot,
          notes,
        }),
      })

      if (response.ok) {
        updateSelection({
          consultationType,
          serviceId,
          petId,
          date,
          timeSlot,
          notes,
        })
      } else {
        console.error('Failed to book video consultation')
      }
    } catch (error) {
      console.error('Error booking video consultation:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Consultation Type:
        <select value={consultationType} onChange={(event) => setConsultationType(event.target.value)}>
          <option value="video">Video</option>
        </select>
      </label>
      <label>
        Service:
        <select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
          <option value="">Select a service</option>
          {/* List of services */}
        </select>
      </label>
      <label>
        Pet:
        <select value={petId} onChange={(event) => setPetId(event.target.value)}>
          <option value="">Select a pet</option>
          {/* List of pets */}
        </select>
      </label>
      <label>
        Date:
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <label>
        Time Slot:
        <input type="time" value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)} />
      </label>
      <label>
        Notes:
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      <button type="submit">Book Video Consultation</button>
    </form>
  )
}

### Store