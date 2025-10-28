export interface Topic {
  title: string;
  explanation: string;
}

export interface Chapter {
  chapterTitle: string;
  topics: Topic[];
}

export interface AnalysisResult {
    chapters: Chapter[];
}

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface ChatSession {
  timestamp: number;
  messages: ChatMessage[];
}

export interface AnalysisSession {
  timestamp: number;
  contentText: string;
  analysisResult: AnalysisResult;
}