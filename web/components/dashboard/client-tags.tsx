"use client";

import { useState } from "react";
import {
  Tag,
  X,
  Plus,
  Crown,
  Heart,
  Building2,
  AlertTriangle,
  Star,
  Sparkles,
  Check,
} from "lucide-react";
import { useDashboardLabels } from "@/lib/hooks/use-dashboard-labels";

interface ClientTag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface ClientTagsProps {
  clientId: string;
  clinic: string;
  initialTags?: ClientTag[];
  editable?: boolean;
  onTagsChange?: (tags: ClientTag[]) => void;
}

interface PresetTagConfig {
  id: keyof typeof TAG_COLORS;
  icon: string;
}

const TAG_COLORS = {
  vip: "bg-amber-100 text-amber-800 border-amber-300",
  criadero: "bg-purple-100 text-purple-800 border-purple-300",
  rescate: "bg-pink-100 text-pink-800 border-pink-300",
  nuevo: "bg-green-100 text-green-800 border-green-300",
  frecuente: "bg-blue-100 text-blue-800 border-blue-300",
  moroso: "bg-red-100 text-red-800 border-red-300",
  empleado: "bg-gray-100 text-gray-800 border-gray-300",
  referido: "bg-cyan-100 text-cyan-800 border-cyan-300",
} as const;

const PRESET_TAG_CONFIGS: PresetTagConfig[] = [
  { id: "vip", icon: "crown" },
  { id: "criadero", icon: "building" },
  { id: "rescate", icon: "heart" },
  { id: "nuevo", icon: "sparkles" },
  { id: "frecuente", icon: "star" },
  { id: "moroso", icon: "alert" },
  { id: "empleado", icon: "tag" },
  { id: "referido", icon: "star" },
];

const getTagIcon = (iconName?: string): React.ReactElement => {
  switch (iconName) {
    case "crown":
      return <Crown className="w-3 h-3" />;
    case "building":
      return <Building2 className="w-3 h-3" />;
    case "heart":
      return <Heart className="w-3 h-3" />;
    case "sparkles":
      return <Sparkles className="w-3 h-3" />;
    case "star":
      return <Star className="w-3 h-3" />;
    case "alert":
      return <AlertTriangle className="w-3 h-3" />;
    default:
      return <Tag className="w-3 h-3" />;
  }
};

export function ClientTags({
  clientId,
  clinic,
  initialTags = [],
  editable = true,
  onTagsChange,
}: ClientTagsProps): React.ReactElement {
  const [tags, setTags] = useState<ClientTag[]>(initialTags);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const labels = useDashboardLabels();

  // Build preset tags with localized names
  const presetTags: ClientTag[] = PRESET_TAG_CONFIGS.map((config) => ({
    id: config.id,
    name: labels.tags[config.id as keyof typeof labels.tags] as string,
    color: TAG_COLORS[config.id],
    icon: config.icon,
  }));

  const handleAddTag = async (tag: ClientTag): Promise<void> => {
    if (tags.some((t) => t.id === tag.id)) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic, tagId: tag.id }),
      });

      if (response.ok) {
        const newTags = [...tags, tag];
        setTags(newTags);
        onTagsChange?.(newTags);
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    } finally {
      setIsSaving(false);
      setIsAdding(false);
    }
  };

  const handleRemoveTag = async (tagId: string): Promise<void> => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic, tagId }),
      });

      if (response.ok) {
        const newTags = tags.filter((t) => t.id !== tagId);
        setTags(newTags);
        onTagsChange?.(newTags);
      }
    } catch (error) {
      console.error("Error removing tag:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const availableTags = presetTags.filter((pt) => !tags.some((t) => t.id === pt.id));

  return (
    <div className="space-y-2">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${tag.color} transition-all`}
          >
            {getTagIcon(tag.icon)}
            {tag.name}
            {editable && (
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                disabled={isSaving}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {editable && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-gray-500 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <Plus className="w-3 h-3" />
            {labels.tags.add}
          </button>
        )}
      </div>

      {/* Tag Picker */}
      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">{labels.tags.select_tag}</p>
            <button
              onClick={() => setIsAdding(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag)}
                  disabled={isSaving}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border ${tag.color} hover:opacity-80 transition-all disabled:opacity-50`}
                >
                  {getTagIcon(tag.icon)}
                  {tag.name}
                  <Check className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-2">
              {labels.tags.all_assigned}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Display-only version for lists
export function ClientTagBadges({ tags }: { tags: ClientTag[] }): React.ReactElement {
  if (tags.length === 0) return <></>;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <span
          key={tag.id}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${tag.color}`}
        >
          {getTagIcon(tag.icon)}
          {tag.name}
        </span>
      ))}
      {tags.length > 3 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{tags.length - 3}
        </span>
      )}
    </div>
  );
}
