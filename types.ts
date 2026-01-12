
export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface CompetitorConversion {
  currentlyUsing: string;
  tatiEquivalent: string;
  switchingAngle: string;
}

export interface LeadScore {
  score: number;
  rating: 'HOT' | 'WARM' | 'COLD';
  signals: string[];
  recommendedAction: string;
}

export interface QuoteTemplate {
  company: string;
  contact: string;
  contactInfo: string;
  location: string;
  lineItems: Array<{
    product: string;
    quantity: string;
  }>;
  notes: string;
}

export interface AnalysisResult {
  analysis: {
    customerNeed: string;
    application: string;
    keyFactors: string;
    urgency: string;
  };
  competitorConversion?: CompetitorConversion;
  recommendations: {
    primary: string;
    primaryReasoning: string;
    alternative?: string;
    alternativeReasoning?: string;
  };
  quoteTemplate?: QuoteTemplate;
  draft: string;
  leadScore: LeadScore;
  internalNotes: string;
  language: 'en' | 'es';
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
