/**
 * Comprehensive toxic foods database for various pet species
 * Sources: ASPCA Poison Control, Pet Poison Helpline, FDA, veterinary literature
 *
 * Toxicity Levels:
 * - Alta (High): Can be fatal or cause severe organ damage
 * - Media (Medium): Can cause significant illness requiring treatment
 * - Baja (Low): May cause mild to moderate symptoms
 */

export interface ToxicFoodItem {
  id: string;
  name: string;
  nameEn: string;
  toxicity: 'Alta' | 'Media' | 'Baja';
  species: ('perro' | 'gato' | 'ave' | 'conejo' | 'tortuga' | 'hamster' | 'cobayo')[];
  toxicComponent: string;
  symptoms: string;
  treatmentUrgency: 'Inmediata' | 'Urgente' | 'Pronto';
  notes?: string;
  lethalDose?: string;
  category: 'fruta' | 'verdura' | 'dulce' | 'bebida' | 'condimento' | 'lacteo' | 'carne' | 'nuez' | 'planta' | 'otro';
}

export const TOXIC_FOODS: ToxicFoodItem[] = [
  // ===== HIGH TOXICITY =====
  {
    id: 'chocolate',
    name: 'Chocolate',
    nameEn: 'Chocolate',
    toxicity: 'Alta',
    species: ['perro', 'gato', 'ave', 'conejo', 'hamster', 'cobayo'],
    toxicComponent: 'Teobromina y cafeína (metilxantinas)',
    symptoms: 'Vómitos, diarrea, jadeo excesivo, sed aumentada, hiperactividad, ritmo cardíaco anormal, temblores, convulsiones',
    treatmentUrgency: 'Inmediata',
    notes: 'El chocolate negro y de repostería son los más peligrosos. El chocolate con leche es menos tóxico pero aún peligroso.',
    lethalDose: 'Perros: 100-200mg teobromina/kg. Chocolate negro: ~15g/kg peso corporal',
    category: 'dulce',
  },
  {
    id: 'xilitol',
    name: 'Xilitol',
    nameEn: 'Xylitol',
    toxicity: 'Alta',
    species: ['perro', 'conejo', 'cobayo'],
    toxicComponent: 'Xilitol (alcohol de azúcar)',
    symptoms: 'Vómitos, debilidad, pérdida de coordinación, convulsiones, insuficiencia hepática, hipoglucemia severa',
    treatmentUrgency: 'Inmediata',
    notes: 'Presente en chicles, caramelos sin azúcar, pasta de dientes, productos horneados. Extremadamente tóxico para perros.',
    lethalDose: 'Perros: 0.1g/kg puede causar hipoglucemia, >0.5g/kg puede causar fallo hepático',
    category: 'dulce',
  },
  {
    id: 'uvas',
    name: 'Uvas y Pasas',
    nameEn: 'Grapes and Raisins',
    toxicity: 'Alta',
    species: ['perro', 'gato'],
    toxicComponent: 'Sustancia desconocida (posiblemente ácido tartárico)',
    symptoms: 'Vómitos, letargo, pérdida de apetito, dolor abdominal, disminución de orina, insuficiencia renal aguda',
    treatmentUrgency: 'Inmediata',
    notes: 'Incluso pequeñas cantidades pueden ser fatales. Las pasas son más concentradas y peligrosas.',
    lethalDose: 'Variable - algunos perros toleran grandes cantidades, otros enferman con pocas uvas',
    category: 'fruta',
  },
  {
    id: 'cebolla',
    name: 'Cebolla',
    nameEn: 'Onion',
    toxicity: 'Alta',
    species: ['perro', 'gato', 'ave', 'conejo', 'cobayo'],
    toxicComponent: 'Tiosulfato y organosulfóxidos',
    symptoms: 'Debilidad, letargo, encías pálidas, orina oscura, vómitos, diarrea, anemia hemolítica',
    treatmentUrgency: 'Urgente',
    notes: 'Tóxico en todas sus formas: cruda, cocida, en polvo, deshidratada. Los gatos son especialmente sensibles.',
    lethalDose: 'Perros: >15-30g/kg. Gatos: >5g/kg',
    category: 'verdura',
  },
  {
    id: 'ajo',
    name: 'Ajo',
    nameEn: 'Garlic',
    toxicity: 'Alta',
    species: ['perro', 'gato', 'ave', 'conejo', 'hamster', 'cobayo'],
    toxicComponent: 'Tiosulfato (5x más concentrado que la cebolla)',
    symptoms: 'Debilidad, letargo, encías pálidas, ritmo cardíaco elevado, colapso, anemia hemolítica',
    treatmentUrgency: 'Urgente',
    notes: 'Más tóxico que la cebolla. El ajo en polvo es especialmente concentrado y peligroso.',
    lethalDose: 'Perros: >15-30g/kg. Gatos: mucho más sensibles',
    category: 'condimento',
  },
  {
    id: 'aguacate',
    name: 'Aguacate (Palta)',
    nameEn: 'Avocado',
    toxicity: 'Alta',
    species: ['ave', 'conejo', 'cobayo', 'hamster'],
    toxicComponent: 'Persina',
    symptoms: 'Dificultad respiratoria, congestión, acumulación de líquido alrededor del corazón, muerte súbita (aves)',
    treatmentUrgency: 'Inmediata',
    notes: 'Extremadamente tóxico para aves, conejos y roedores. Menos tóxico para perros y gatos (causa principalmente malestar GI).',
    category: 'fruta',
  },
  {
    id: 'macadamia',
    name: 'Nueces de Macadamia',
    nameEn: 'Macadamia Nuts',
    toxicity: 'Alta',
    species: ['perro'],
    toxicComponent: 'Toxina desconocida',
    symptoms: 'Debilidad en patas traseras, vómitos, temblores, hipertermia, incapacidad para caminar',
    treatmentUrgency: 'Urgente',
    notes: 'Síntomas aparecen 12 horas después de la ingestión. Generalmente no fatal pero muy incómodo.',
    lethalDose: 'Síntomas con tan solo 2.4g/kg de peso corporal',
    category: 'nuez',
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    nameEn: 'Alcohol',
    toxicity: 'Alta',
    species: ['perro', 'gato', 'ave', 'conejo', 'tortuga', 'hamster', 'cobayo'],
    toxicComponent: 'Etanol',
    symptoms: 'Vómitos, diarrea, dificultad respiratoria, coma, disminución de coordinación, depresión del sistema nervioso central, muerte',
    treatmentUrgency: 'Inmediata',
    notes: 'Incluso pequeñas cantidades son peligrosas. Incluye cerveza, vino, licores y alimentos con alcohol.',
    category: 'bebida',
  },
  {
    id: 'cafeina',
    name: 'Cafeína',
    nameEn: 'Caffeine',
    toxicity: 'Alta',
    species: ['perro', 'gato', 'ave', 'conejo', 'hamster', 'cobayo'],
    toxicComponent: 'Cafeína (metilxantina)',
    symptoms: 'Hiperactividad, jadeo, vómitos, ritmo cardíaco anormal, presión arterial elevada, temblores, convulsiones',
    treatmentUrgency: 'Inmediata',
    notes: 'Presente en café, té, bebidas energéticas, refrescos de cola, medicamentos.',
    lethalDose: 'Perros: 140mg/kg. Una taza de café contiene ~100mg de cafeína',
    category: 'bebida',
  },

  // ===== MEDIUM TOXICITY =====
  {
    id: 'huesos-cocidos',
    name: 'Huesos Cocidos',
    nameEn: 'Cooked Bones',
    toxicity: 'Media',
    species: ['perro', 'gato'],
    toxicComponent: 'Fragmentos óseos astillados',
    symptoms: 'Obstrucción intestinal, perforación del tracto digestivo, estreñimiento severo, sangrado interno',
    treatmentUrgency: 'Urgente',
    notes: 'Los huesos cocidos se astillan fácilmente. Los huesos de pollo son especialmente peligrosos.',
    category: 'carne',
  },
  {
    id: 'leche',
    name: 'Leche y Lácteos',
    nameEn: 'Milk and Dairy',
    toxicity: 'Media',
    species: ['perro', 'gato', 'conejo', 'hamster', 'cobayo'],
    toxicComponent: 'Lactosa',
    symptoms: 'Diarrea, vómitos, malestar estomacal, gases, dolor abdominal',
    treatmentUrgency: 'Pronto',
    notes: 'La mayoría de mascotas adultas son intolerantes a la lactosa. Los gatos son especialmente sensibles.',
    category: 'lacteo',
  },
  {
    id: 'sal',
    name: 'Sal (en exceso)',
    nameEn: 'Salt (excess)',
    toxicity: 'Media',
    species: ['perro', 'gato', 'ave', 'conejo', 'hamster', 'cobayo'],
    toxicComponent: 'Sodio',
    symptoms: 'Sed excesiva, micción frecuente, vómitos, diarrea, temblores, convulsiones, intoxicación por sodio',
    treatmentUrgency: 'Urgente',
    notes: 'Snacks salados, agua de mar, sal de mesa en exceso. Puede causar problemas renales.',
    lethalDose: 'Perros: >4g/kg de peso corporal',
    category: 'condimento',
  },
  {
    id: 'nuez-moscada',
    name: 'Nuez Moscada',
    nameEn: 'Nutmeg',
    toxicity: 'Media',
    species: ['perro', 'gato'],
    toxicComponent: 'Miristicina',
    symptoms: 'Alucinaciones, desorientación, aumento del ritmo cardíaco, dolor abdominal, convulsiones',
    treatmentUrgency: 'Urgente',
    notes: 'Común en productos horneados y bebidas navideñas.',
    category: 'condimento',
  },
  {
    id: 'masa-cruda',
    name: 'Masa con Levadura (cruda)',
    nameEn: 'Raw Yeast Dough',
    toxicity: 'Media',
    species: ['perro', 'gato'],
    toxicComponent: 'Levadura activa y etanol',
    symptoms: 'Distensión abdominal severa, dolor, vómitos, desorientación, depresión, intoxicación alcohólica',
    treatmentUrgency: 'Urgente',
    notes: 'La masa se expande en el estómago y la fermentación produce alcohol.',
    category: 'otro',
  },
  {
    id: 'puerro',
    name: 'Puerro',
    nameEn: 'Leek',
    toxicity: 'Media',
    species: ['perro', 'gato', 'ave', 'conejo'],
    toxicComponent: 'Tiosulfato (familia Allium)',
    symptoms: 'Debilidad, letargo, encías pálidas, vómitos, anemia',
    treatmentUrgency: 'Urgente',
    notes: 'Menos tóxico que la cebolla y el ajo pero aún peligroso.',
    category: 'verdura',
  },
  {
    id: 'cebollino',
    name: 'Cebollino/Ciboulette',
    nameEn: 'Chives',
    toxicity: 'Media',
    species: ['perro', 'gato'],
    toxicComponent: 'Tiosulfato (familia Allium)',
    symptoms: 'Irritación gastrointestinal, anemia, debilidad',
    treatmentUrgency: 'Urgente',
    notes: 'Común en ensaladas y como condimento. Los gatos son más sensibles.',
    category: 'condimento',
  },
  {
    id: 'semillas-manzana',
    name: 'Semillas de Manzana',
    nameEn: 'Apple Seeds',
    toxicity: 'Media',
    species: ['perro', 'gato', 'ave', 'conejo', 'hamster', 'cobayo'],
    toxicComponent: 'Amigdalina (libera cianuro)',
    symptoms: 'Dificultad respiratoria, jadeo, pupilas dilatadas, encías rojas, shock',
    treatmentUrgency: 'Urgente',
    notes: 'También aplica a semillas de cereza, durazno, ciruela y albaricoque.',
    category: 'fruta',
  },
  {
    id: 'tomate-verde',
    name: 'Tomate Verde (planta)',
    nameEn: 'Green Tomato (plant)',
    toxicity: 'Media',
    species: ['perro', 'gato', 'conejo', 'cobayo'],
    toxicComponent: 'Solanina y tomatina',
    symptoms: 'Babeo excesivo, malestar GI, letargo, debilidad, confusión',
    treatmentUrgency: 'Pronto',
    notes: 'El tomate maduro es seguro. Las hojas, tallos y tomates verdes son tóxicos.',
    category: 'verdura',
  },
  {
    id: 'papa-cruda',
    name: 'Papa Cruda/Verde',
    nameEn: 'Raw/Green Potato',
    toxicity: 'Media',
    species: ['perro', 'gato', 'conejo', 'cobayo'],
    toxicComponent: 'Solanina',
    symptoms: 'Vómitos, diarrea, letargo, debilidad, confusión',
    treatmentUrgency: 'Pronto',
    notes: 'Las papas cocidas son seguras. Las verdes o con brotes son tóxicas.',
    category: 'verdura',
  },
  {
    id: 'ruibarbo',
    name: 'Ruibarbo',
    nameEn: 'Rhubarb',
    toxicity: 'Media',
    species: ['perro', 'gato', 'conejo', 'cobayo'],
    toxicComponent: 'Ácido oxálico',
    symptoms: 'Babeo, vómitos, diarrea, letargo, temblores, insuficiencia renal',
    treatmentUrgency: 'Urgente',
    notes: 'Las hojas son más tóxicas que los tallos.',
    category: 'verdura',
  },
  {
    id: 'champinones-silvestres',
    name: 'Champiñones Silvestres',
    nameEn: 'Wild Mushrooms',
    toxicity: 'Media',
    species: ['perro', 'gato', 'conejo'],
    toxicComponent: 'Varias toxinas según especie',
    symptoms: 'Vómitos, diarrea, dolor abdominal, letargo, ictericia, convulsiones, fallo hepático',
    treatmentUrgency: 'Inmediata',
    notes: 'Algunos hongos silvestres son extremadamente tóxicos. Ante la duda, asumir toxicidad.',
    category: 'verdura',
  },

  // ===== LOW TOXICITY =====
  {
    id: 'limon',
    name: 'Limón y Cítricos',
    nameEn: 'Lemon and Citrus',
    toxicity: 'Baja',
    species: ['perro', 'gato'],
    toxicComponent: 'Aceites esenciales y psoralenos',
    symptoms: 'Irritación gástrica, vómitos, diarrea, sensibilidad a la luz (en grandes cantidades)',
    treatmentUrgency: 'Pronto',
    notes: 'Las cáscaras y semillas son más problemáticas que la pulpa.',
    category: 'fruta',
  },
  {
    id: 'coco',
    name: 'Coco',
    nameEn: 'Coconut',
    toxicity: 'Baja',
    species: ['perro', 'gato'],
    toxicComponent: 'Alto contenido graso',
    symptoms: 'Malestar estomacal, diarrea, posible pancreatitis en grandes cantidades',
    treatmentUrgency: 'Pronto',
    notes: 'Pequeñas cantidades son generalmente seguras. El agua de coco tiene mucho potasio.',
    category: 'fruta',
  },
  {
    id: 'cerezas',
    name: 'Cerezas (con hueso)',
    nameEn: 'Cherries (with pit)',
    toxicity: 'Baja',
    species: ['perro', 'gato', 'ave'],
    toxicComponent: 'Cianuro (en hueso, tallos, hojas)',
    symptoms: 'Dificultad respiratoria, encías rojas brillantes, dilatación pupilar',
    treatmentUrgency: 'Urgente',
    notes: 'La pulpa es segura. El peligro está en huesos, tallos y hojas.',
    category: 'fruta',
  },
  {
    id: 'granada',
    name: 'Granada',
    nameEn: 'Pomegranate',
    toxicity: 'Baja',
    species: ['perro', 'gato'],
    toxicComponent: 'Taninos y semillas',
    symptoms: 'Vómitos, malestar estomacal',
    treatmentUrgency: 'Pronto',
    notes: 'No es tóxica pero puede causar malestar digestivo.',
    category: 'fruta',
  },
  {
    id: 'espinaca',
    name: 'Espinaca (en exceso)',
    nameEn: 'Spinach (excess)',
    toxicity: 'Baja',
    species: ['perro', 'gato', 'conejo', 'cobayo'],
    toxicComponent: 'Ácido oxálico',
    symptoms: 'Problemas renales a largo plazo, bloqueo de absorción de calcio',
    treatmentUrgency: 'Pronto',
    notes: 'Pequeñas cantidades son nutritivas. Evitar en mascotas con problemas renales.',
    category: 'verdura',
  },
  {
    id: 'lechuga-iceberg',
    name: 'Lechuga Iceberg',
    nameEn: 'Iceberg Lettuce',
    toxicity: 'Baja',
    species: ['conejo', 'cobayo', 'tortuga'],
    toxicComponent: 'Lactucarium (efecto sedante leve)',
    symptoms: 'Diarrea, deshidratación (por alto contenido de agua y bajo valor nutricional)',
    treatmentUrgency: 'Pronto',
    notes: 'Mejor ofrecer lechugas de hojas oscuras con más nutrientes.',
    category: 'verdura',
  },
  {
    id: 'platano',
    name: 'Plátano (en exceso)',
    nameEn: 'Banana (excess)',
    toxicity: 'Baja',
    species: ['perro', 'gato', 'conejo', 'hamster'],
    toxicComponent: 'Alto contenido de azúcar',
    symptoms: 'Estreñimiento, aumento de peso, problemas digestivos',
    treatmentUrgency: 'Pronto',
    notes: 'Seguro en pequeñas cantidades como premio ocasional.',
    category: 'fruta',
  },

  // ===== SPECIES-SPECIFIC ADDITIONS =====
  {
    id: 'semillas-girasol-saladas',
    name: 'Semillas de Girasol Saladas',
    nameEn: 'Salted Sunflower Seeds',
    toxicity: 'Media',
    species: ['ave', 'hamster'],
    toxicComponent: 'Exceso de sodio',
    symptoms: 'Deshidratación, problemas renales, sed excesiva',
    treatmentUrgency: 'Pronto',
    notes: 'Las semillas sin sal son seguras y nutritivas para aves.',
    category: 'nuez',
  },
  {
    id: 'pan',
    name: 'Pan (para aves)',
    nameEn: 'Bread (for birds)',
    toxicity: 'Baja',
    species: ['ave'],
    toxicComponent: 'Bajo valor nutricional, fermentación',
    symptoms: 'Desnutrición, problemas digestivos, "angel wing" en patos',
    treatmentUrgency: 'Pronto',
    notes: 'No es tóxico pero llena sin nutrir. Evitar como alimento regular.',
    category: 'otro',
  },
  {
    id: 'frijoles-crudos',
    name: 'Frijoles/Judías Crudas',
    nameEn: 'Raw Beans',
    toxicity: 'Alta',
    species: ['perro', 'gato', 'ave', 'conejo'],
    toxicComponent: 'Fitohemaglutinina (lectina)',
    symptoms: 'Vómitos severos, diarrea sanguinolenta, dolor abdominal',
    treatmentUrgency: 'Urgente',
    notes: 'Los frijoles cocidos son seguros. Los crudos son muy tóxicos.',
    category: 'verdura',
  },
  {
    id: 'almendras-amargas',
    name: 'Almendras Amargas',
    nameEn: 'Bitter Almonds',
    toxicity: 'Alta',
    species: ['perro', 'gato', 'ave', 'conejo', 'hamster', 'cobayo'],
    toxicComponent: 'Amigdalina (libera cianuro)',
    symptoms: 'Dificultad respiratoria, convulsiones, colapso',
    treatmentUrgency: 'Inmediata',
    notes: 'Las almendras dulces son seguras en pequeñas cantidades.',
    category: 'nuez',
  },
  {
    id: 'helado',
    name: 'Helado',
    nameEn: 'Ice Cream',
    toxicity: 'Media',
    species: ['perro', 'gato'],
    toxicComponent: 'Lactosa, azúcar, posible xilitol',
    symptoms: 'Diarrea, vómitos, malestar estomacal, posible toxicidad por xilitol',
    treatmentUrgency: 'Pronto',
    notes: 'Verificar ingredientes. Algunos helados "sin azúcar" contienen xilitol.',
    category: 'lacteo',
  },
  {
    id: 'dulces',
    name: 'Dulces/Golosinas',
    nameEn: 'Candy/Sweets',
    toxicity: 'Media',
    species: ['perro', 'gato', 'ave', 'conejo', 'hamster', 'cobayo'],
    toxicComponent: 'Azúcar, posible xilitol, colorantes',
    symptoms: 'Obesidad, problemas dentales, posible toxicidad por xilitol',
    treatmentUrgency: 'Pronto',
    notes: 'Los dulces "sin azúcar" son especialmente peligrosos por el xilitol.',
    category: 'dulce',
  },
  {
    id: 'comida-humana-condimentada',
    name: 'Comida Condimentada',
    nameEn: 'Spicy Food',
    toxicity: 'Baja',
    species: ['perro', 'gato', 'conejo', 'hamster', 'cobayo'],
    toxicComponent: 'Capsaicina y otros irritantes',
    symptoms: 'Irritación gástrica, vómitos, diarrea, dolor abdominal',
    treatmentUrgency: 'Pronto',
    notes: 'Los animales no procesan especias como los humanos.',
    category: 'condimento',
  },
];

// Species labels in Spanish
export const SPECIES_LABELS: Record<string, string> = {
  perro: 'Perro',
  gato: 'Gato',
  ave: 'Ave',
  conejo: 'Conejo',
  tortuga: 'Tortuga',
  hamster: 'Hámster',
  cobayo: 'Cobayo/Cuy',
};

// Category labels in Spanish
export const CATEGORY_LABELS: Record<string, string> = {
  fruta: 'Frutas',
  verdura: 'Verduras',
  dulce: 'Dulces',
  bebida: 'Bebidas',
  condimento: 'Condimentos',
  lacteo: 'Lácteos',
  carne: 'Carnes',
  nuez: 'Nueces/Semillas',
  planta: 'Plantas',
  otro: 'Otros',
};

// Get foods toxic to a specific species
export function getFoodsForSpecies(species: string): ToxicFoodItem[] {
  return TOXIC_FOODS.filter(food =>
    food.species.includes(species as ToxicFoodItem['species'][number])
  );
}

// Get foods by toxicity level
export function getFoodsByToxicity(toxicity: 'Alta' | 'Media' | 'Baja'): ToxicFoodItem[] {
  return TOXIC_FOODS.filter(food => food.toxicity === toxicity);
}

// Get foods by category
export function getFoodsByCategory(category: string): ToxicFoodItem[] {
  return TOXIC_FOODS.filter(food => food.category === category);
}

// Search foods by name
export function searchFoods(query: string, species?: string): ToxicFoodItem[] {
  const normalizedQuery = query.toLowerCase().trim();

  return TOXIC_FOODS.filter(food => {
    const matchesName = food.name.toLowerCase().includes(normalizedQuery) ||
                        food.nameEn.toLowerCase().includes(normalizedQuery);

    if (!species) return matchesName;

    return matchesName && food.species.includes(species as ToxicFoodItem['species'][number]);
  });
}
