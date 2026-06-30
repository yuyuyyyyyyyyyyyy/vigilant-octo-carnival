// === 数据结构 v2 ===

export interface InterpretationModel {
  name: string;
  dimension?: string;
  content?: string;
  explanation?: string;   // 旧格式兼容
  logic?: string;
  approach?: string;       // 旧格式兼容
  scope?: string;
  score: number; // 1-5
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
  event_reconstruction?: string;
  event_summary?: string;
  event_type?: string;
  facts?: string[];
  models: InterpretationModel[];
  variables?: any;          // backward compat
  categorized_variables?: CategorizedVariables;
  key_variables?: string[]; // backward compat
  conflict_analysis?: ConflictAnalysis;
  experiment?: string;       // backward compat
  next_experiment?: NextExperiment | string;
  version: number;
  created_at: string;
}

export interface AnalyzeRequest {
  input: string;
  version?: number;
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
