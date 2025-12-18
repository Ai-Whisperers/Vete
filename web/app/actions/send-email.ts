"use server";

export async function sendEmail(prevState: any, formData: FormData) {
  const rawFormData = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    petName: formData.get("petName"),
    reason: formData.get("reason"),
  };

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log("📧 EMULATED EMAIL SEND:", rawFormData);

  // In a real app, use Resend or Nodemailer here
  // await resend.emails.send({ ... })

  return { 
    success: true, 
    message: "¡Solicitud recibida! Te contactaremos por WhatsApp en breve." 
  };
}
