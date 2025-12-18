
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { AddToCartButton } from '../cart/add-to-cart-button';

interface ServiceCardProps {
  readonly service: any;
  readonly config: any;
}

export const ServiceCard = ({ service, config }: ServiceCardProps) => {
  // Use useParams to safely get the current clinic slug from the URL context
  // This avoids passing 'clinic' prop deep down if not strictly necessary,
  // but if 'config.id' or similar has the slug, we can use that too.
  // Assuming the config object might NOT have the raw slug sometimes, but let's try to infer or pass it.
  // A safer way is ensuring the parent passes the slug or we grab it from context.
  
  // Since 'config' usually comes from getClinicData, let's assume we can get the ID from the URL using params in a client/server component.
  // However, this is a component that might be server rendered. 'useParams' works in Client Components. 
  // Let's rely on a prop or assume the parent passes correct context. 
  // Actually, 'Link' relative paths work well if we are already in [clinic].
  // But to be safe, let's construct the path if we can.
  // For now, let's use a relative link if possible or assume we are passing the clinic ID.
  // Wait, the 'service' object doesn't have the clinic ID. 
  // Let's update the layout to just use relative path `services/${id}` which appends to current.
  // If we are at `/adris/services`, `id` makes it `/adris/services/id`.

  if (!service.visible) return null;

  return (
    <div className="bg-white rounded-[var(--radius)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden flex flex-col h-full group relative">
      <Link href={`./services/${service.id}`} className="absolute inset-0 z-10" aria-label={`Ver detalles de ${service.title}`} />
      
      {/* Card Header */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-subtle)] text-[var(--primary)] grid place-items-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-300">
                <DynamicIcon name={service.icon} className="w-6 h-6" />
            </div>
            {service.booking?.online_enabled && (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                    Online
                </span>
            )}
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-2 leading-tight group-hover:text-[var(--primary)] transition-colors">
            {service.title}
        </h3>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3">
            {service.summary}
        </p>
      </div>

      {/* Card Body - Content */}
      <div className="px-6 py-2 flex-grow">
        
        {/* Includes List - Compact */}
        <div className="my-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-2 block">
                {config.ui_labels?.services.includes_label || 'Incluye'}
            </span>
            <ul className="space-y-1.5">
                {service.details.includes.slice(0, 3).map((item: string, i: number) => (
                    <li key={item} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                         <Check className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                         <span className="line-clamp-1">{item}</span>
                    </li>
                ))}
                {service.details.includes.length > 3 && (
                    <li className="text-xs text-[var(--primary)] font-medium pl-6">
                        + {service.details.includes.length - 3} más...
                    </li>
                )}
            </ul>
        </div>
      
      </div>

      {/* Card Footer - Price & Action */}
      <div className="p-6 pt-4 mt-auto border-t border-gray-50 bg-gray-50/30 relative z-20">
        <div className="flex items-end justify-between gap-2">
             <div className="flex flex-col">
                <span className="text-xs text-[var(--text-muted)] font-medium">Desde</span>
                <span className="text-xl font-black text-[var(--primary)]">
                    {service.variants?.[0]?.price_display || 'Consultar'}
                </span>
             </div>
             
             <div className="flex gap-2">
                 <AddToCartButton 
                    item={{
                        id: service.id,
                        name: service.title,
                        price: service.variants?.[0]?.price || 0,
                        type: 'service',
                        description: service.summary
                    }}
                    iconOnly
                    className="z-30 relative"
                 />
                 
                 <div 
                    className="rounded-xl bg-[var(--bg-subtle)] text-[var(--primary)] p-3 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors shadow-sm"
                 >
                     <ArrowRight className="w-5 h-5" />
                 </div>
             </div>
        </div>
      </div>
    
    </div>
  );
};
