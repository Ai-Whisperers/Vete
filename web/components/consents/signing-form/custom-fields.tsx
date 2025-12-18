"use client";

import type { JSX } from 'react';
import type { TemplateField } from './types';

interface CustomFieldsProps {
  fields: TemplateField[];
  values: Record<string, any>;
  onChange: (fieldName: string, value: string | number | boolean | null) => void;
}

export default function CustomFields({ fields, values, onChange }: CustomFieldsProps): JSX.Element {
  if (!fields || fields.length === 0) {
    return <></>;
  }

  return (
    <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Información adicional
      </h3>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {field.field_label}
              {field.is_required && <span className="text-red-600 ml-1">*</span>}
            </label>

            {field.field_type === 'text' && (
              <input
                type="text"
                value={values[field.field_name] || ''}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
                className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
              />
            )}

            {field.field_type === 'textarea' && (
              <textarea
                value={values[field.field_name] || ''}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
                rows={4}
                className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
              />
            )}

            {field.field_type === 'select' && field.field_options && (
              <select
                value={values[field.field_name] || ''}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
                className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
              >
                <option value="">Seleccionar...</option>
                {field.field_options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.field_type === 'date' && (
              <input
                type="date"
                value={values[field.field_name] || ''}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
                className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
              />
            )}

            {field.field_type === 'number' && (
              <input
                type="number"
                value={values[field.field_name] || ''}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
                className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
