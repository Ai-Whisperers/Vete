'use client';

interface CopyrightProps {
  companyName: string;
  rightsText?: string;
}

export function Copyright({ companyName, rightsText = 'Todos los derechos reservados.' }: CopyrightProps) {
  const currentYear = new Date().getFullYear();

  return (
    <p className="text-gray-500 text-sm text-center md:text-left">
      © {currentYear} {companyName}. {rightsText}
    </p>
  );
}
