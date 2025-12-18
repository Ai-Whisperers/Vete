"use client";

import { useState } from 'react';
import { Award, Heart, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
  photo_url?: string; // Legacy support
  specialties?: string[];
  education?: string[];
}

interface TeamMemberCardProps {
  member: TeamMember;
  gradient: string;
  badgeClass: string;
  iconName: string;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Heart,
  Stethoscope,
};

export function TeamMemberCard({ member, gradient, badgeClass, iconName }: TeamMemberCardProps) {
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const IconComponent = ICONS[iconName] || Heart;

  // Support both 'image' and legacy 'photo_url' fields
  const photoUrl = member.image || member.photo_url;

  // Get initials from name
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="group bg-white rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden">
      {/* Photo area with gradient placeholder */}
      <div className={`h-48 bg-gradient-to-br ${gradient} w-full relative overflow-hidden`}>
        {/* If member has photo URL and no error, show it */}
        {photoUrl && !imageError ? (
          <img
            src={photoUrl}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Decorative placeholder with initials */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-4xl font-black text-white/80">
                {initials}
              </span>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Role badge - Show full role */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${badgeClass}`}>
          <IconComponent className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[180px]" title={member.role}>
            {member.role}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--primary)] transition-colors">
          {member.name}
        </h3>

        {/* Bio - With expand/collapse for mobile */}
        <div className="relative">
          <p className={`text-[var(--text-secondary)] text-sm leading-relaxed transition-all duration-300 ${
            expanded ? '' : 'line-clamp-3'
          }`}>
            {member.bio}
          </p>

          {/* Ver más button */}
          {member.bio.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-[var(--primary)] text-sm font-medium flex items-center gap-1 hover:underline"
            >
              {expanded ? (
                <>
                  Ver menos <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Ver más <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Specialties tags */}
        {expanded && member.specialties && member.specialties.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Especialidades
            </p>
            <div className="flex flex-wrap gap-1.5">
              {member.specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-[var(--bg-subtle)] text-[var(--text-secondary)] text-xs rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
