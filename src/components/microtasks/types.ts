// Microtask Type System
// 8 task types: mcq, ranking, classify, scenario, graph, puzzle, fillblank, codeorder

export type TaskType = 'mcq' | 'ranking' | 'classify' | 'scenario' | 'graph' | 'puzzle' | 'fillblank' | 'codeorder';
export type RIASECAxis = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
// personality = reveals RIASEC profile (choices map to axes)
// aptitude = tests ability/knowledge (no RIASEC mapping)
export type SignalType = 'personality' | 'aptitude';

// Task metadata from backend (analytics/debugging info)
export interface TaskMeta {
  generated?: boolean;      // true if AI-generated, false/undefined if from bank
  policy?: string;          // "broad_exploration" | "disambiguate_top2" | "aptitude_generated" | etc.
  entropy?: number;         // Current profile uncertainty
  top2_gap?: number;        // Gap between top-1 and top-2 axes
  apt_prob?: number;        // Probability of serving aptitude task
  target_axes?: string[];   // Which RIASEC axes this task targets
}

// Base interface for all tasks
// Note: `program` is NOT stored inside each task - it comes from the parent context
// (the API passes program separately, we use it from there)
export interface MicrotaskBase {
  question_code: string;  // Unique task identifier (e.g., "math-puzzle-balance-001")
  type: TaskType;
  question: string;
  hint?: string;
  riasec?: RIASECAxis[]; // Optional - only required for personality tasks
  signalType: SignalType;
  meta?: TaskMeta;        // Backend metadata (includes generated flag)
}

// Helper to get task ID (uses question_code)
export function getTaskId(task: MicrotaskBase): string {
  return task.question_code;
}

// ============================================================
// TASK 1: MCQ (Multiple Choice)
// ============================================================
export interface MCQOption {
  id: string;
  text: string;
  riasec: RIASECAxis;
  isCorrect?: boolean; // For performance-type MCQs
}

export interface MCQTask extends MicrotaskBase {
  type: 'mcq';
  stimulus?: { title: string; body: string };
  options: MCQOption[];
  learnBullets?: string[];
}

// ============================================================
// TASK 2: Ranking (Drag to Reorder)
// ============================================================
export interface RankingItem {
  id: string;
  text: string;
  riasec: RIASECAxis;
}

export interface RankingTask extends MicrotaskBase {
  type: 'ranking';
  items: RankingItem[];
}

// ============================================================
// TASK 3: Classify (Drag to Buckets)
// ============================================================
export interface ClassifyItem {
  id: string;
  text: string;
  correctCategory: string;
  riasec?: RIASECAxis; // Optional - only for personality-type classify tasks
}

export interface ClassifyTask extends MicrotaskBase {
  type: 'classify';
  categories: string[];
  items: ClassifyItem[];
}

// ============================================================
// TASK 4: Scenario (Story + Response Choice)
// ============================================================
export interface ScenarioTask extends MicrotaskBase {
  type: 'scenario';
  scenario: string;
  character?: { name: string; emoji: string };
  options: MCQOption[];
}

// ============================================================
// TASK 5: Graph (Interactive Chart)
// ============================================================
export interface GraphRegion {
  id: string;
  label: string;
  riasec?: RIASECAxis; // Optional - only for personality-type graph tasks
  dataIndex: number;
}

export interface GraphTask extends MicrotaskBase {
  type: 'graph';
  graphData: {
    type: 'bar' | 'line';
    title: string;
    labels: string[];
    values: number[];
    xAxisLabel?: string;
    yAxisLabel?: string;
  };
  clickableRegions: GraphRegion[];
  correctRegion: string;
}

// ============================================================
// TASK 6: Puzzle (Visual Logic - Balance/Pattern)
// ============================================================
export type PuzzleVariant = 'balance' | 'pattern';

export interface BalancePuzzle {
  variant: 'balance';
  left: { shape: string; count: number }[];
  right: { shape: string; count: number }[];
  unknownSide: 'left' | 'right';
  unknownShape: string;
}

export interface PatternPuzzle {
  variant: 'pattern';
  sequence: string[];
}

export interface PuzzleOption {
  id: string;
  value: string | number;
  riasec?: RIASECAxis; // Optional - puzzles are typically aptitude tasks
}

export interface PuzzleTask extends MicrotaskBase {
  type: 'puzzle';
  puzzle: BalancePuzzle | PatternPuzzle;
  options: PuzzleOption[];
  correctAnswer: string;
}

// ============================================================
// TASK 7: FillBlank (Drag words into blanks)
// ============================================================
export interface BlankSlot {
  id: string;
  correctWordId: string;
}

export interface DraggableWord {
  id: string;
  text: string;
}

export interface FillBlankTask extends MicrotaskBase {
  type: 'fillblank';
  // Text with {{0}}, {{1}} placeholders for blanks
  textWithBlanks: string;
  blanks: BlankSlot[];
  words: DraggableWord[];  // Word bank (includes distractors)
}

// ============================================================
// TASK 8: CodeOrder (Drag code lines into correct order)
// ============================================================
export interface CodeLine {
  id: string;
  code: string;
  correctPosition: number;  // 0-indexed
}

export interface CodeOrderTask extends MicrotaskBase {
  type: 'codeorder';
  language: string;  // e.g., 'python', 'javascript'
  description: string;  // What the code should do
  lines: CodeLine[];
  expectedOutput?: string;  // What it prints when correct
}

// ============================================================
// Union Type & Result
// ============================================================
export type Microtask =
  | MCQTask
  | RankingTask
  | ClassifyTask
  | ScenarioTask
  | GraphTask
  | PuzzleTask
  | FillBlankTask
  | CodeOrderTask;

export interface TaskResult {
  taskId: string;
  taskType: TaskType;
  signalType: SignalType;
  selectedRiasec: RIASECAxis | null;
  isCorrect: boolean | null;
  timeSpent: number;
  hintsUsed: boolean;
}

// Props interface for all task components
export interface TaskComponentProps<T extends Microtask = Microtask> {
  task: T;
  onComplete: (result: TaskResult) => void;
  onSkip: () => void;
}
