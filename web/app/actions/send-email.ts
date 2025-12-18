"use server";

// TICKET-TYPE-002: Define proper state interface for server actions
interface ActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function sendEmail(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const rawFormData = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    petName: formData.get("petName"),
    reason: formData.get("reason"),
  };

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In a real app, use Resend or Nodemailer here
  // await resend.emails.send({ ... })

  return { 
    success: true, 
    message: "¡Solicitud recibida! Te contactaremos por WhatsApp en breve." 
  };
}
