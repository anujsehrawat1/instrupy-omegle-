export type AppView = 'HOME' | 'CHAT_TEXT' | 'CHAT_VIDEO' | 'TERMS' | 'PRIVACY' | 'GUIDELINES';

export interface Message {
  id: string;
  sender: 'you' | 'stranger' | 'system' | 'country';
  text: string;
  countryCode?: string;
  timestamp: Date;
}

export interface StrangerPersona {
  id: string;
  name: string;
  avatarUrl: string;
  avatarColor: string;
  interests: string[];
  greetings: string[];
  messages: { trigger?: string; response: string; delay?: number }[];
  fallbackResponses: string[];
  typingSpeed: number; // ms per character
  countryName: string;
  countryFlag: string;
  countryCode: string;
}

export interface SimulationConfig {
  autoReply: boolean;
  strangerDisconnectProbability: number; // 0 to 1
  selectedPersonaId: string;
}
