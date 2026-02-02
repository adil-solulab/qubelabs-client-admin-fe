import { useState, useCallback } from 'react';
import type { Persona, TaskSequence, AgentTask, FewShotExample } from '@/types/aiAgents';

const generateMockPersonas = (): Persona[] => [
  {
    id: '1',
    name: 'Sales Pro',
    type: 'sales',
    description: 'Polite and persuasive sales representative focused on conversions and upselling opportunities.',
    systemPrompt: `You are a professional sales representative for our company. Your goal is to help customers find the right products and services while being persuasive but never pushy.

Key behaviors:
- Always greet customers warmly
- Ask qualifying questions to understand needs
- Highlight value propositions clearly
- Handle objections gracefully
- Create urgency when appropriate
- Always aim to close or schedule follow-up`,
    fewShotExamples: [
      {
        id: '1',
        userMessage: "I'm interested in your enterprise plan but it seems expensive.",
        assistantResponse: "I completely understand budget considerations are important. Let me share how our enterprise customers typically see 3x ROI within the first quarter. Would you like me to walk you through a quick cost-benefit analysis tailored to your team size?",
      },
      {
        id: '2',
        userMessage: "What makes you different from competitors?",
        assistantResponse: "Great question! While others focus on features, we focus on outcomes. Our customers report 40% faster resolution times and 95% satisfaction rates. Plus, we offer dedicated onboarding that competitors charge extra for. Shall I arrange a demo to show you firsthand?",
      },
    ],
    toneSettings: {
      primary: 'persuasive',
      adaptability: 75,
      voiceStyle: 'Confident and engaging',
    },
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-05-20',
  },
  {
    id: '2',
    name: 'Support Hero',
    type: 'support',
    description: 'Empathetic customer support specialist focused on quick resolution and customer satisfaction.',
    systemPrompt: `You are a compassionate customer support specialist. Your primary goal is to help customers resolve their issues quickly while ensuring they feel heard and valued.

Key behaviors:
- Acknowledge emotions first
- Apologize sincerely when appropriate
- Provide clear step-by-step solutions
- Offer alternatives when primary solution isn't viable
- Follow up to ensure satisfaction
- Escalate appropriately when needed`,
    fewShotExamples: [
      {
        id: '1',
        userMessage: "I've been waiting 3 days for a response and I'm really frustrated!",
        assistantResponse: "I'm truly sorry for the delay and completely understand your frustration. That's not the experience we want for you. Let me personally look into your case right now and make sure we get this resolved today. Can you share your ticket number so I can prioritize this?",
      },
      {
        id: '2',
        userMessage: "Your app crashed and I lost all my work!",
        assistantResponse: "Oh no, I'm so sorry to hear that happened! Losing your work is incredibly frustrating. Let me help you recover it - we have auto-save backups that might have captured your progress. While I pull that up, can you tell me roughly when the crash occurred?",
      },
    ],
    toneSettings: {
      primary: 'empathetic',
      adaptability: 85,
      voiceStyle: 'Warm and understanding',
    },
    isActive: true,
    createdAt: '2024-02-10',
    updatedAt: '2024-05-18',
  },
  {
    id: '3',
    name: 'Tech Advisor',
    type: 'custom',
    description: 'Technical advisor for product consultations and implementation guidance.',
    systemPrompt: `You are a knowledgeable technical advisor who helps customers with implementation questions and best practices. Balance technical accuracy with accessibility.

Key behaviors:
- Explain complex concepts simply
- Provide code examples when helpful
- Recommend best practices
- Link to relevant documentation
- Suggest optimal configurations`,
    fewShotExamples: [
      {
        id: '1',
        userMessage: "How do I set up webhooks for real-time notifications?",
        assistantResponse: "Great choice using webhooks! Here's a quick setup guide:\n\n1. Go to Settings → Integrations → Webhooks\n2. Add your endpoint URL (must be HTTPS)\n3. Select events you want to receive\n4. Copy the signing secret for verification\n\nWould you like me to share a code snippet for handling webhook verification in your preferred language?",
      },
    ],
    toneSettings: {
      primary: 'friendly',
      adaptability: 60,
      voiceStyle: 'Clear and knowledgeable',
    },
    isActive: true,
    createdAt: '2024-03-05',
    updatedAt: '2024-05-15',
  },
];

const generateMockSequences = (): TaskSequence[] => [
  {
    id: '1',
    name: 'Sales Qualification Flow',
    description: 'Multi-step flow for qualifying and converting leads',
    tasks: [
      { id: '1', name: 'Initial Greeting', personaId: '1', order: 1, description: 'Warm welcome and introduction' },
      { id: '2', name: 'Needs Discovery', personaId: '1', order: 2, description: 'Ask qualifying questions' },
      { id: '3', name: 'Product Match', personaId: '1', order: 3, description: 'Recommend suitable products' },
      { id: '4', name: 'Handle Objections', personaId: '1', order: 4, condition: 'If customer has concerns', description: 'Address concerns empathetically' },
      { id: '5', name: 'Close or Handoff', personaId: '1', order: 5, description: 'Complete sale or schedule demo' },
    ],
    isActive: true,
  },
  {
    id: '2',
    name: 'Support Escalation Path',
    description: 'Tiered support with escalation capabilities',
    tasks: [
      { id: '1', name: 'Issue Identification', personaId: '2', order: 1, description: 'Understand the problem' },
      { id: '2', name: 'Self-Service Check', personaId: '2', order: 2, description: 'Offer quick solutions' },
      { id: '3', name: 'Technical Diagnosis', personaId: '3', order: 3, condition: 'If technical issue', description: 'Deep technical analysis' },
      { id: '4', name: 'Resolution', personaId: '2', order: 4, description: 'Apply fix and confirm' },
    ],
    isActive: true,
  },
];

export function useAIAgentsData() {
  const [personas, setPersonas] = useState<Persona[]>(generateMockPersonas());
  const [sequences, setSequences] = useState<TaskSequence[]>(generateMockSequences());
  const [isLoading, setIsLoading] = useState(false);

  const addPersona = useCallback(async (personaData: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newPersona: Persona = {
      ...personaData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    setPersonas(prev => [...prev, newPersona]);
    setIsLoading(false);
    return newPersona;
  }, []);

  const updatePersona = useCallback(async (personaId: string, personaData: Partial<Persona>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setPersonas(prev =>
      prev.map(persona =>
        persona.id === personaId
          ? { ...persona, ...personaData, updatedAt: new Date().toISOString().split('T')[0] }
          : persona
      )
    );
    setIsLoading(false);
  }, []);

  const deletePersona = useCallback(async (personaId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setPersonas(prev => prev.filter(persona => persona.id !== personaId));
    setIsLoading(false);
  }, []);

  const togglePersonaActive = useCallback((personaId: string) => {
    setPersonas(prev =>
      prev.map(persona =>
        persona.id === personaId
          ? { ...persona, isActive: !persona.isActive }
          : persona
      )
    );
  }, []);

  const getPersonaById = useCallback((id: string) => {
    return personas.find(p => p.id === id);
  }, [personas]);

  return {
    personas,
    sequences,
    isLoading,
    addPersona,
    updatePersona,
    deletePersona,
    togglePersonaActive,
    getPersonaById,
  };
}
