// === 数据结构 v3 ===

export interface InterpretationModel {
  name: string;
  dimension?: string;
  content?: string;
  explanation?: string;
  logic?: string;
  approach?: string;
  scope?: string;
  evidence_quote?: string;
  fact?: string;
  inference?: string;
  why?: string;
  validation?: string;
  falsification?: string;
  limitation?: string;
  score: number; // 1-5
  mechanism?: string;
  difference_from_others?: string;
}

export interface VariableItem {
  variable: string;
  impact: string;
}

export interface CategorizedVariables {
  temporal?: VariableItem[];
  environmental?: VariableItem[];
  interpersonal?: VariableItem[];
  historical?: VariableItem[];
  cognitive?: VariableItem[];
  external?: VariableItem[];
}

export interface ModelConflict {
  model_a: string;
  model_b: string;
  conflict_point: string;
  resolution_hint: string;
}

export interface ConflictAnalysis {
  conflicts: ModelConflict[];
  dependency_map: string;
}

export interface NextExperiment {
  target_variable: string;
  design: string;
  expected_change: string;
  judgment_criteria: string;
  model_update: string;
}

export interface AnalysisResult {
  video_first_frame?: string;
  phenomenon?: string;
  conflict?: string;
  core_question?: string;
  takeaway?: string;
  event_reconstruction?: string;
  event_summary?: string;
  event_type?: string;
  facts?: string[];
  models: InterpretationModel[];
  variables?: any;
  categorized_variables?: CategorizedVariables;
  key_variables?: string[];
  conflict_analysis?: ConflictAnalysis;
  experiment?: string;
  next_experiment?: NextExperiment | string;
  version: number;
  created_at: string;
  mode?: 'explore' | 'converge';
  conclusion?: string;
  rejected_reasons?: string;
}

export interface AnalyzeRequest {
  input: string;
  version?: number;
  profile?: {
    name?: string;
    lens?: string;
    tone?: string;
  };
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export interface StoredRecord extends AnalysisResult {
  id: string;
  input: string;
}