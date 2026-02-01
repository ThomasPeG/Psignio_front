export interface QuizOption {
  value: number;  // 1 to 7 (Map internally to A, B, C...)
  label: string;
}

export interface Question {
  id: number;       // 1 to 50
  text: string;
  domain: string;   // 'identity' | 'work' | 'social' | ...
  options: QuizOption[];
}

export interface PersonalityType {
  id: number;
  name: string;
  image_url: string;
  description_preview: string;
  description_full: string;
  mantra?: string;
  lightBullets: string[];
  shadowBullets: string[];
  pareja: string[]; // Array of compatible strings
  // Contextual details
  trabajo: { roles: string; ambiente: string; evita: string };
  social: { vibra: string; limite: string };
  dinero: { talento: string; riesgo: string; regla: string };
}

export interface QuizResultResponse {
  is_paid: boolean;
  // If Free (Preview only)
  preview?: {
    typeName: string;
    snippet: string;
    imageUrl?: string; // Optional, backend might not send it
  };
  // If Paid (Premium) - Full result, no preview object
  result?: {
    dominant: PersonalityType;
    secondary: PersonalityType;
    shadow: PersonalityType;
    work: PersonalityType;
    social: PersonalityType;
    money: PersonalityType;
  };
}

export interface QuizHistoryItem {
  _id: string;
  date: string; // ISO Date string
  resultTypeName: string;
  imageUrl?: string;
  snippet?: string;
}
