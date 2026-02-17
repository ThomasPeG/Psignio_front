export interface QuizOption {
  value: number;
  label: string;
}

export interface Question {
  id: number;
  text: string;
  domain: string;
  options: QuizOption[];
}

// Sub-interfaces for specific sections
export interface WorkInfo {
  roles: string[];
  ambiente: string;
  evita: string;
}

export interface SocialInfo {
  descripcion: string;
  limiteSano: string;
}

export interface MoneyInfo {
  talento: string;
  riesgo: string;
  regla: string;
}

export interface EnergyInfo {
  descripcion: string;
  color: string;
  piedra: string;
  fraseLuz: string;
  fraseSombra: string;
  habitoLuz: string;
  habitoSombra: string;
  talentoHumano: string;
  retoEvolutivo: string;
  necesitaAprender: string;
}

export interface VictimizationInfo {
  frase: string;
  comoSeVe: string[];
  heridaRaiz: string;
  fraseSombra: string;
  salidaALuz: string;
}

// Archetype Interfaces
export interface DominantArchetype {
  _id: string;
  id: number;
  codigo: string;
  titulo: string;
  name: string; // From example: "name": "string"
  description_preview: string;
  description_full: string;
  esencia: string;
  enLuz: string[];
  enSombra: string[];
  parejaPerfecta: string[];
  trabajoIdeal: WorkInfo;
  social: SocialInfo;
  dinero: MoneyInfo;
  mantra: string;
  energia: EnergyInfo;
  victimizacion: VictimizationInfo;
  __v?: number;
}

export interface SecondaryArchetype {
  id: number;
  titulo: string;
  descripcion: string;
  trabajo: WorkInfo;
}

export interface ShadowArchetype {
  id: number;
  titulo: string;
  descripcion: string;
  enSombra: string[];
}

export interface WorkArchetype {
  id: number;
  titulo: string;
  descripcion: string;
  trabajo: WorkInfo;
}

export interface SocialArchetype {
  id: number;
  titulo: string;
  descripcion: string;
  social: SocialInfo;
}

export interface MoneyArchetype {
  id: number;
  titulo: string;
  descripcion: string;
  dinero: MoneyInfo;
}

export interface QuizResultData {
  dominant: DominantArchetype;
  secondary: SecondaryArchetype;
  shadow: ShadowArchetype;
  work: WorkArchetype;
  social: SocialArchetype;
  money: MoneyArchetype;
}

export interface QuizResultResponse {
  is_paid?: boolean;
  result?: QuizResultData;
  _id?: string;

  // Compatibilidad: Campos planos que pueden venir del backend
  typeName?: string;
  snippet?: string;

  preview?: {
    typeName: string;
    snippet: string;
    imageUrl?: string;
  };
}

export interface QuizHistoryItem {
  _id: string;
  date: string;
  resultTypeName: string;
  imageUrl?: string; // Keep for compatibility if used in lists
  snippet?: string; // Keep for compatibility
  is_paid?: boolean;
  payment_id?: string;
}
