import React, { useState } from 'react';
import { useBookingStore } from '@/lib/store/booking-store';
import { GroomingService, Groomer } from '@/lib/domain/grooming-appointments/types';

interface GroomingAppointmentFormProps {
  services: GroomingService[];
  groomers: Groomer[];
}

const GroomingAppointmentForm: React.FC<GroomingAppointmentFormProps> = ({
  services,
  groomers,
}) => {
  const { updateSelection, submitBooking } = useBookingStore();
  const [selectedService, setSelectedService] = useState<GroomingService | null>(null);
  const [selectedGroomer, setSelectedGroomer] = useState<Groomer | null>(null);

  const handleServiceChange = (service: GroomingService) => {
    setSelectedService(service);
    updateSelection({ serviceId: service.id });
  };

  const handleGroomerChange = (groomer: Groomer) => {
    setSelectedGroomer(groomer);
    updateSelection({ groomerId: groomer.id });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitBooking();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Servicio:
        <select value={selectedService?.id} onChange={(event) => handleServiceChange(services.find((s) => s.id === event.target.value))}>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Peluquero:
        <select value={selectedGroomer?.id} onChange={(event) => handleGroomerChange(groomers.find((g) => g.id === event.target.value))}>
          {groomers.map((groomer) => (
            <option key={groomer.id} value={groomer.id}>
              {groomer.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Reservar</button>
    </form>
  );
};

export default GroomingAppointmentForm;

### Store