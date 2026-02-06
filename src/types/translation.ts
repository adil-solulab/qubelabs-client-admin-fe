// Real-Time Translation Types

export type LanguageCode = 
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | 'ru' | 'hi';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export interface TranslatedMessage {
  originalText: string;
  translatedText: string;
  originalLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  confidence: number;
  isAutoDetected: boolean;
}

export interface ConversationTranslation {
  conversationId: string;
  customerLanguage: LanguageCode;
  agentLanguage: LanguageCode;
  isAutoDetected: boolean;
  translationEnabled: boolean;
}

export interface VoiceTranslationState {
  isListening: boolean;
  isTranslating: boolean;
  isSpeaking: boolean;
  liveTranscript: string;
  translatedTranscript: string;
}

export interface TranslationSettings {
  agentPreferredLanguage: LanguageCode;
  autoDetectCustomerLanguage: boolean;
  showOriginalWithTranslation: boolean;
  voiceTranslationEnabled: boolean;
}

export const DEFAULT_TRANSLATION_SETTINGS: TranslationSettings = {
  agentPreferredLanguage: 'en',
  autoDetectCustomerLanguage: true,
  showOriginalWithTranslation: true,
  voiceTranslationEnabled: true,
};

export const getLanguageByCode = (code: LanguageCode): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

// Simulated translations for demo purposes - bidirectional
export const SIMULATED_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  // Spanish → English translations (customer messages)
  'Hola, tengo una pregunta sobre mi factura reciente.': {
    en: 'Hi, I have a question about my recent bill.',
    es: 'Hola, tengo una pregunta sobre mi factura reciente.',
    fr: 'Bonjour, j\'ai une question concernant ma facture récente.',
    de: 'Hallo, ich habe eine Frage zu meiner letzten Rechnung.',
    it: 'Ciao, ho una domanda sulla mia fattura recente.',
    pt: 'Olá, tenho uma pergunta sobre minha fatura recente.',
    zh: '你好，我有一个关于最近账单的问题。',
    ja: 'こんにちは、最近の請求書について質問があります。',
    ko: '안녕하세요, 최근 청구서에 대해 질문이 있습니다.',
    ar: 'مرحبا، لدي سؤال حول فاتورتي الأخيرة.',
    ru: 'Привет, у меня вопрос о моём последнем счёте.',
    hi: 'नमस्ते, मेरे हाल के बिल के बारे में एक सवाल है।',
  },
  'Claro, es 12345678.': {
    en: 'Sure, it\'s 12345678.',
    es: 'Claro, es 12345678.',
    fr: 'Bien sûr, c\'est 12345678.',
    de: 'Klar, es ist 12345678.',
    it: 'Certo, è 12345678.',
    pt: 'Claro, é 12345678.',
    zh: '当然，是12345678。',
    ja: 'もちろん、12345678です。',
    ko: '네, 12345678입니다.',
    ar: 'بالتأكيد، إنه 12345678.',
    ru: 'Конечно, это 12345678.',
    hi: 'ज़रूर, यह 12345678 है।',
  },
  'Sí, exactamente. No reconozco ese cargo.': {
    en: 'Yes, exactly. I don\'t recognize that charge.',
    es: 'Sí, exactamente. No reconozco ese cargo.',
    fr: 'Oui, exactement. Je ne reconnais pas ce frais.',
    de: 'Ja, genau. Ich erkenne diese Gebühr nicht.',
    it: 'Sì, esattamente. Non riconosco quell\'addebito.',
    pt: 'Sim, exatamente. Não reconheço essa cobrança.',
    zh: '是的，正是。我不认识这笔费用。',
    ja: 'はい、その通りです。その請求に覚えがありません。',
    ko: '네, 맞아요. 그 청구 내역을 모르겠어요.',
    ar: 'نعم، بالضبط. لا أتعرف على هذه الرسوم.',
    ru: 'Да, именно так. Я не узнаю эту оплату.',
    hi: 'हाँ, बिल्कुल। मुझे वह शुल्क नहीं पता।',
  },
  // English → Spanish translations (agent responses for customer view)
  'Hello María! I\'d be happy to help you with your billing inquiry. Could you please provide your account number?': {
    en: 'Hello María! I\'d be happy to help you with your billing inquiry. Could you please provide your account number?',
    es: '¡Hola María! Estaré encantado de ayudarte con tu consulta de facturación. ¿Podrías proporcionarme tu número de cuenta?',
    fr: 'Bonjour María! Je serais ravi de vous aider avec votre demande de facturation. Pourriez-vous me fournir votre numéro de compte?',
    de: 'Hallo María! Ich helfe Ihnen gerne bei Ihrer Rechnungsanfrage. Können Sie mir Ihre Kontonummer geben?',
    it: 'Ciao María! Sarò felice di aiutarti con la tua richiesta di fatturazione. Potresti fornirmi il tuo numero di conto?',
    pt: 'Olá María! Ficarei feliz em ajudá-la com sua consulta de faturamento. Você poderia fornecer seu número de conta?',
    zh: '你好María！我很乐意帮助您解决账单问题。您能提供您的账号吗？',
    ja: 'こんにちはMaría！請求に関するお問い合わせをお手伝いします。アカウント番号を教えていただけますか？',
    ko: '안녕하세요 María! 청구 문의를 도와드리겠습니다. 계좌 번호를 알려주시겠어요?',
    ar: 'مرحباً María! يسعدني مساعدتك في استفسارك عن الفواتير. هل يمكنك تزويدي برقم حسابك؟',
    ru: 'Привет María! Буду рад помочь вам с вопросом по счету. Не могли бы вы предоставить номер вашего счета?',
    hi: 'नमस्ते María! मुझे आपकी बिलिंग पूछताछ में मदद करने में खुशी होगी। क्या आप अपना खाता नंबर बता सकते हैं?',
  },
  'Thank you. I can see your account. I notice there\'s a $50 charge from last week. Is that what you\'re asking about?': {
    en: 'Thank you. I can see your account. I notice there\'s a $50 charge from last week. Is that what you\'re asking about?',
    es: 'Gracias. Puedo ver tu cuenta. Noto que hay un cargo de $50 de la semana pasada. ¿Es sobre eso que preguntas?',
    fr: 'Merci. Je peux voir votre compte. Je remarque qu\'il y a un frais de 50$ de la semaine dernière. Est-ce ce dont vous parlez?',
    de: 'Danke. Ich kann Ihr Konto sehen. Mir fällt eine Gebühr von 50$ von letzter Woche auf. Fragen Sie danach?',
    it: 'Grazie. Posso vedere il tuo account. Noto che c\'è un addebito di $50 della settimana scorsa. È di questo che chiedi?',
    pt: 'Obrigado. Posso ver sua conta. Noto que há uma cobrança de $50 da semana passada. É sobre isso que você está perguntando?',
    zh: '谢谢。我可以看到您的账户。我注意到上周有一笔50美元的费用。这是您询问的吗？',
    ja: 'ありがとうございます。アカウントを確認できます。先週の50ドルの請求がありますね。それについてお尋ねですか？',
    ko: '감사합니다. 계정을 확인할 수 있습니다. 지난 주에 $50 청구가 있네요. 그것에 대해 문의하시는 건가요?',
    ar: 'شكراً. يمكنني رؤية حسابك. ألاحظ أن هناك رسوم بقيمة 50 دولار من الأسبوع الماضي. هل هذا ما تسأل عنه؟',
    ru: 'Спасибо. Я вижу ваш счет. Замечаю, что есть платеж на $50 за прошлую неделю. Это то, о чем вы спрашиваете?',
    hi: 'धन्यवाद। मैं आपका खाता देख सकता हूं। मुझे पिछले हफ्ते का $50 का चार्ज दिख रहा है। क्या आप इसी के बारे में पूछ रहे हैं?',
  },
  // Common phrases
  'I see, thank you.': {
    en: 'I see, thank you.',
    es: 'Entiendo, gracias.',
    fr: 'Je vois, merci.',
    de: 'Ich verstehe, danke.',
    it: 'Capisco, grazie.',
    pt: 'Entendi, obrigado.',
    zh: '明白了，谢谢。',
    ja: 'わかりました、ありがとうございます。',
    ko: '알겠습니다, 감사합니다.',
    ar: 'فهمت، شكرا لك.',
    ru: 'Понятно, спасибо.',
    hi: 'समझ गया, धन्यवाद।',
  },
  'Entiendo, gracias.': {
    en: 'I see, thank you.',
    es: 'Entiendo, gracias.',
    fr: 'Je vois, merci.',
    de: 'Ich verstehe, danke.',
    it: 'Capisco, grazie.',
    pt: 'Entendi, obrigado.',
    zh: '明白了，谢谢。',
    ja: 'わかりました、ありがとうございます。',
    ko: '알겠습니다, 감사합니다.',
    ar: 'فهمت، شكرا لك.',
    ru: 'Понятно, спасибо.',
    hi: 'समझ गया, धन्यवाद।',
  },
  'That makes sense.': {
    en: 'That makes sense.',
    es: 'Eso tiene sentido.',
    fr: 'Cela a du sens.',
    de: 'Das macht Sinn.',
    it: 'Ha senso.',
    pt: 'Faz sentido.',
    zh: '这有道理。',
    ja: 'なるほど。',
    ko: '이해가 됩니다.',
    ar: 'هذا منطقي.',
    ru: 'Это имеет смысл.',
    hi: 'समझ में आता है।',
  },
  'Can you explain more?': {
    en: 'Can you explain more?',
    es: '¿Puedes explicar más?',
    fr: 'Pouvez-vous expliquer davantage?',
    de: 'Können Sie mehr erklären?',
    it: 'Puoi spiegare di più?',
    pt: 'Pode explicar mais?',
    zh: '你能解释更多吗？',
    ja: 'もっと説明してもらえますか？',
    ko: '더 설명해 주실 수 있나요?',
    ar: 'هل يمكنك شرح المزيد؟',
    ru: 'Можете объяснить подробнее?',
    hi: 'क्या आप और समझा सकते हैं?',
  },
  'Got it!': {
    en: 'Got it!',
    es: '¡Entendido!',
    fr: 'Compris!',
    de: 'Verstanden!',
    it: 'Capito!',
    pt: 'Entendi!',
    zh: '明白了！',
    ja: 'わかりました！',
    ko: '알겠어요!',
    ar: 'فهمت!',
    ru: 'Понял!',
    hi: 'समझ गया!',
  },
  '¡Entendido!': {
    en: 'Got it!',
    es: '¡Entendido!',
    fr: 'Compris!',
    de: 'Verstanden!',
    it: 'Capito!',
    pt: 'Entendi!',
    zh: '明白了！',
    ja: 'わかりました！',
    ko: '알겠어요!',
    ar: 'فهمت!',
    ru: 'Понял!',
    hi: 'समझ गया!',
  },
};
