"use client";

import type { JSX } from 'react';
import DOMPurify from 'dompurify';
import type { ConsentTemplate, Pet, Owner } from './types';

interface ConsentPreviewProps {
  template: ConsentTemplate;
  pet: Pet;
  owner: Owner;
  fieldValues: Record<string, any>;
}

export default function ConsentPreview({
  template,
  pet,
  owner,
  fieldValues,
}: ConsentPreviewProps): JSX.Element {
  const renderContent = (): string => {
    let content = template.content;

    // Replace pet placeholders
    content = content.replace(/{{pet_name}}/g, pet.name);
    content = content.replace(/{{pet_species}}/g, pet.species);
    content = content.replace(/{{pet_breed}}/g, pet.breed);

    // Replace owner placeholders
    content = content.replace(/{{owner_name}}/g, owner.full_name);
    content = content.replace(/{{owner_email}}/g, owner.email);
    content = content.replace(/{{owner_phone}}/g, owner.phone || '');

    // Replace custom field placeholders
    Object.keys(fieldValues).forEach((key) => {
      const value = fieldValues[key];
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });

    // Replace date placeholder
    content = content.replace(/{{date}}/g, new Date().toLocaleDateString('es-PY'));

    return content;
  };

  return (
    <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Documento de consentimiento
      </h3>
      <div
        className="prose max-w-none text-[var(--text-primary)]"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderContent()) }}
      />
    </div>
  );
}
