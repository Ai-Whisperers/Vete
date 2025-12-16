"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ToxicFoodItem {
  name: string;
  toxicity: "Alta" | "Media" | "Baja";
  symptoms: string;
  notes?: string;
}

interface ToxicFoodSearchProps {
  items: ToxicFoodItem[];
}

export function ToxicFoodSearch({ items }: ToxicFoodSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getToxicityColor = (level: string) => {
    switch (level) {
      case "Alta": return "bg-red-100 text-red-700 border-red-200";
      case "Media": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Baja": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="max-w-xl mx-auto relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Escribe un alimento (ej: Chocolate, Uvas...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-lg"
        />
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getToxicityColor(item.toxicity)}`}>
                {item.toxicity}
              </span>
            </div>
            <div className="space-y-3">
                <div className="flex gap-2 items-start text-sm text-gray-600">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p><span className="font-semibold">Síntomas:</span> {item.symptoms}</p>
                </div>
                {item.notes && (
                    <div className="flex gap-2 items-start text-sm text-gray-500">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <p>{item.notes}</p>
                    </div>
                )}
            </div>
          </div>
        ))}
        
        {filteredItems.length === 0 && (
             <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed">
                <p className="text-gray-500">
                    No encontramos "{searchTerm}" en nuestra base de datos. 
                    <br/>
                    <span className="text-sm">Ante la duda, ¡siempre consulta al veterinario!</span>
                </p>
             </div>
        )}
      </div>
    </div>
  );
}
