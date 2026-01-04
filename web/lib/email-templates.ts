export function generateAppointmentConfirmationEmail({
  userName,
  petName,
  reason,
  dateTime,
  clinicName,
}: {
  userName: string
  petName: string
  reason: string
  dateTime: string
  clinicName: string
}) {
  return `
    Hola ${userName},

    Tu cita ha sido agendada con éxito:

    Mascota: ${petName}
    Motivo: ${reason}
    Fecha y Hora: ${dateTime}
    Clínica: ${clinicName}

    ¡Gracias por confiar en nosotros!

    Saludos,
    El equipo de la Clínica Veterinaria
  `
}
