import { useState, useCallback, useEffect } from 'react';
import {
  LanguageCode,
  TranslationSettings,
  TranslatedMessage,
  ConversationTranslation,
  VoiceTranslationState,
  DEFAULT_TRANSLATION_SETTINGS,
  SIMULATED_TRANSLATIONS,
  getLanguageByCode,
} from '@/types/translation';

const STORAGE_KEY = 'agent_translation_settings';

// Simulate translation with artificial delay
const simulateTranslation = async (
  text: string,
  fromLang: LanguageCode,
  toLang: LanguageCode
): Promise<TranslatedMessage> => {
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  
  // Check if we have a pre-defined translation
  const translations = SIMULATED_TRANSLATIONS[text];
  let translatedText = text;
  
  if (translations && translations[toLang]) {
    translatedText = translations[toLang];
  } else if (fromLang !== toLang) {
    // Generate a simulated translation by adding language marker
    const langInfo = getLanguageByCode(toLang);
    translatedText = `[${langInfo?.name || toLang}] ${text}`;
  }
  
  return {
    originalText: text,
    translatedText,
    originalLanguage: fromLang,
    targetLanguage: toLang,
    confidence: 0.92 + Math.random() * 0.08,
    isAutoDetected: true,
  };
};

// Simulate language detection
const detectLanguage = async (text: string): Promise<LanguageCode> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simple heuristic for demo - check for Spanish characters/patterns
  if (/[áéíóúñ¿¡]/i.test(text)) return 'es';
  if (/[àâäçéèêëîïôùûü]/i.test(text)) return 'fr';
  if (/[äöüß]/i.test(text)) return 'de';
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  if (/[\u3040-\u30ff]/.test(text)) return 'ja';
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';
  if (/[\u0400-\u04ff]/.test(text)) return 'ru';
  if (/[\u0900-\u097f]/.test(text)) return 'hi';
  
  return 'en';
};

export function useTranslation() {
  const [settings, setSettings] = useState<TranslationSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_TRANSLATION_SETTINGS;
  });
  
  const [conversationTranslations, setConversationTranslations] = useState<
    Map<string, ConversationTranslation>
  >(new Map());
  
  const [messageTranslations, setMessageTranslations] = useState<
    Map<string, TranslatedMessage>
  >(new Map());
  
  const [voiceState, setVoiceState] = useState<VoiceTranslationState>({
    isListening: false,
    isTranslating: false,
    isSpeaking: false,
    liveTranscript: '',
    translatedTranscript: '',
  });
  
  const [isTranslating, setIsTranslating] = useState(false);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<TranslationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const initializeConversationTranslation = useCallback(async (
    conversationId: string,
    customerMessage?: string
  ): Promise<ConversationTranslation> => {
    const existingTranslation = conversationTranslations.get(conversationId);
    if (existingTranslation) return existingTranslation;
    
    let detectedLanguage: LanguageCode = 'en';
    let isAutoDetected = false;
    
    if (settings.autoDetectCustomerLanguage && customerMessage) {
      detectedLanguage = await detectLanguage(customerMessage);
      isAutoDetected = true;
    }
    
    const newTranslation: ConversationTranslation = {
      conversationId,
      customerLanguage: detectedLanguage,
      agentLanguage: settings.agentPreferredLanguage,
      isAutoDetected,
      translationEnabled: detectedLanguage !== settings.agentPreferredLanguage,
    };
    
    setConversationTranslations(prev => {
      const updated = new Map(prev);
      updated.set(conversationId, newTranslation);
      return updated;
    });
    
    return newTranslation;
  }, [conversationTranslations, settings.agentPreferredLanguage, settings.autoDetectCustomerLanguage]);

  const translateMessage = useCallback(async (
    messageId: string,
    text: string,
    conversationId: string,
    isFromCustomer: boolean
  ): Promise<TranslatedMessage | null> => {
    const existingTranslation = messageTranslations.get(messageId);
    if (existingTranslation) return existingTranslation;
    
    const convTranslation = conversationTranslations.get(conversationId);
    if (!convTranslation?.translationEnabled) return null;
    
    setIsTranslating(true);
    
    try {
      const fromLang = isFromCustomer 
        ? convTranslation.customerLanguage 
        : convTranslation.agentLanguage;
      const toLang = isFromCustomer 
        ? convTranslation.agentLanguage 
        : convTranslation.customerLanguage;
      
      const translation = await simulateTranslation(text, fromLang, toLang);
      
      setMessageTranslations(prev => {
        const updated = new Map(prev);
        updated.set(messageId, translation);
        return updated;
      });
      
      return translation;
    } finally {
      setIsTranslating(false);
    }
  }, [conversationTranslations, messageTranslations]);

  const setCustomerLanguage = useCallback((
    conversationId: string,
    language: LanguageCode
  ) => {
    setConversationTranslations(prev => {
      const updated = new Map(prev);
      const existing = updated.get(conversationId);
      if (existing) {
        updated.set(conversationId, {
          ...existing,
          customerLanguage: language,
          isAutoDetected: false,
          translationEnabled: language !== settings.agentPreferredLanguage,
        });
      }
      return updated;
    });
    // Clear existing translations for this conversation
    setMessageTranslations(prev => {
      const updated = new Map(prev);
      for (const [key] of updated) {
        if (key.startsWith(conversationId)) {
          updated.delete(key);
        }
      }
      return updated;
    });
  }, [settings.agentPreferredLanguage]);

  const toggleTranslation = useCallback((conversationId: string, enabled: boolean) => {
    setConversationTranslations(prev => {
      const updated = new Map(prev);
      const existing = updated.get(conversationId);
      if (existing) {
        updated.set(conversationId, {
          ...existing,
          translationEnabled: enabled,
        });
      }
      return updated;
    });
  }, []);

  const getConversationTranslation = useCallback((
    conversationId: string
  ): ConversationTranslation | undefined => {
    return conversationTranslations.get(conversationId);
  }, [conversationTranslations]);

  const getMessageTranslation = useCallback((
    messageId: string
  ): TranslatedMessage | undefined => {
    return messageTranslations.get(messageId);
  }, [messageTranslations]);

  // Voice translation simulation
  const startVoiceTranslation = useCallback(() => {
    setVoiceState(prev => ({
      ...prev,
      isListening: true,
      liveTranscript: '',
      translatedTranscript: '',
    }));
    
    // Simulate live transcript updates
    const phrases = [
      'Hello, I am calling about...',
      'my order that was placed...',
      'last week...',
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < phrases.length) {
        setVoiceState(prev => ({
          ...prev,
          liveTranscript: prev.liveTranscript + phrases[index] + ' ',
          isTranslating: true,
        }));
        
        // Simulate translation delay
        setTimeout(() => {
          setVoiceState(prev => ({
            ...prev,
            translatedTranscript: prev.liveTranscript,
            isTranslating: false,
          }));
        }, 200);
        
        index++;
      } else {
        clearInterval(interval);
        setVoiceState(prev => ({ ...prev, isListening: false }));
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  const stopVoiceTranslation = useCallback(() => {
    setVoiceState({
      isListening: false,
      isTranslating: false,
      isSpeaking: false,
      liveTranscript: '',
      translatedTranscript: '',
    });
  }, []);

  return {
    settings,
    updateSettings,
    conversationTranslations,
    isTranslating,
    voiceState,
    initializeConversationTranslation,
    translateMessage,
    setCustomerLanguage,
    toggleTranslation,
    getConversationTranslation,
    getMessageTranslation,
    startVoiceTranslation,
    stopVoiceTranslation,
  };
}
