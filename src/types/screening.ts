// Core module output types for the 5 screening modules

export interface EyeContactResult {
  eye_contact_score: 0 | 1 | 2;
  eye_contact_percent?: number;
  duration_seconds: number;
}

export interface NameResponseResult {
  response_to_name_score: 0 | 1 | 2;
  response_latency_ms?: number | null;
}

export interface VocalizationResult {
  vocalization_score: 0 | 1 | 2;
  vocalization_activity_index?: number;
}

export interface GesturesResult {
  gesture_joint_attention_score: 0 | 1 | 2;
}

export interface RepetitiveBehaviorResult {
  repetitive_behavior_score: 0 | 1 | 2;
  behaviors_observed: string[];
}

// Combined screening data sent to API
export interface ScreeningPayload {
  age_months: number;
  eye_contact_score: 0 | 1 | 2;
  response_to_name_score: 0 | 1 | 2;
  response_latency_ms?: number | null;
  vocalization_score: 0 | 1 | 2;
  gesture_joint_attention_score: 0 | 1 | 2;
  repetitive_behavior_score: 0 | 1 | 2;
}

// Domain scores breakdown
export interface DomainScores {
  social: number;
  response: number;
  vocal: number;
  repetitive: number;
  gestures: number;
}

// API response from /api/screen
export interface ScreeningResponse {
  risk_score: number;
  risk_band: 'Low' | 'Moderate' | 'High';
  flags: string[];
  domain_scores: DomainScores;
}

// Module props interfaces
export interface ModuleProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

export interface ScreeningState {
  ageMonths?: number;
  eyeContactResult?: EyeContactResult;
  nameResponseResult?: NameResponseResult;
  vocalizationResult?: VocalizationResult;
  gesturesResult?: GesturesResult;
  repetitiveBehaviorResult?: RepetitiveBehaviorResult;
  finalResult?: ScreeningResponse;
}
