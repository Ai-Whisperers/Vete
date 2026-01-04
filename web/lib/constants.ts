export const ERROR_MESSAGES = {
  REQUIRED_PET_SELECTION: 'Debes seleccionar una mascota.',
  INVALID_PET_ID: 'El ID de la mascota es inválido.',
  REQUIRED_DATETIME: 'La fecha y hora son obligatorias.',
  INVALID_DATETIME: 'La fecha y hora proporcionadas no son válidas.',
  APPOINTMENT_TOO_SOON:
    'La cita debe ser al menos 15 minutos en el futuro y no puede ser en el pasado.',
  REQUIRED_REASON: 'El motivo de la consulta es obligatorio.',
  SHORT_REASON: 'Describe brevemente el motivo (mínimo 3 caracteres).',
  LONG_REASON: 'El motivo no puede exceder los 200 caracteres.',
  LONG_NOTES: 'Las notas no pueden exceder los 1000 caracteres.',
  CLINIC_IDENTIFICATION_FAILED: 'No se pudo identificar la clínica. Por favor, recarga la página.',
  PET_NOT_FOUND:
    'Mascota no encontrada. La mascota seleccionada no existe o fue eliminada. Selecciona otra mascota.',
  UNAUTHORIZED_PET_ACCESS:
    'No tienes permiso para agendar citas para esta mascota. Solo puedes agendar citas para tus propias mascotas.',
  SLOT_ALREADY_TAKEN: 'Este horario ya está ocupado. Por favor, elige otro.',
  APPOINTMENT_ON_SAME_DAY: (petName: string, existingTime: string) =>
    `${petName} ya tiene una cita para este día. Ya existe una cita a las ${existingTime}.`,
  GENERIC_APPOINTMENT_ERROR:
    'No se pudo agendar la cita. Por favor, intenta de nuevo en unos minutos.',
  LOGIN_REQUIRED:
    'Debes iniciar sesión para agendar una cita. Por favor, inicia sesión y vuelve a intentarlo.',
  REVIEW_FIELDS: 'Por favor, revisa los campos marcados en rojo.',
}
