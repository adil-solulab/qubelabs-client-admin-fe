export type PersonaType = 'sales' | 'support' | 'custom';

export type ToneLevel = 'formal' | 'friendly' | 'casual' | 'empathetic' | 'persuasive';

export interface FewShotExample {
  id: string;
  userMessage: string;
  assistantResponse: string;
}

export interface Persona {
  id: string;
  name: string;
  type: PersonaType;
  description: string;
  systemPrompt: string;
  fewShotExamples: FewShotExample[];
  toneSettings: {
    primary: ToneLevel;
    adaptability: number; // 0-100
    voiceStyle: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTask {
  id: string;
  name: string;
  personaId: string;
  order: number;
  condition?: string;
  description: string;
}

export interface TaskSequence {
  id: string;
  name: string;
  description: string;
  tasks: AgentTask[];
  isActive: boolean;
}

export const PERSONA_TYPE_LABELS: Record<PersonaType, string> = {
  sales: 'Sales',
  support: 'Support',
  custom: 'Custom',
};

export const TONE_LABELS: Record<ToneLevel, string> = {
  formal: 'Formal',
  friendly: 'Friendly',
  casual: 'Casual',
  empathetic: 'Empathetic',
  persuasive: 'Persuasive',
};

export const DEFAULT_PERSONAS: Partial<Persona>[] = [
  {
    type: 'sales',
    name: 'Sales Agent',
    description: 'Polite and persuasive sales representative focused on conversions',
    toneSettings: {
      primary: 'persuasive',
      adaptability: 75,
      voiceStyle: 'Confident and engaging',
    },
  },
  {
    type: 'support',
    name: 'Support Agent',
    description: 'Empathetic customer support specialist focused on resolution',
    toneSettings: {
      primary: 'empathetic',
      adaptability: 85,
      voiceStyle: 'Warm and understanding',
    },
  },
];
