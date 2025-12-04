// Agent Demo Screen
// Split view: Left = input + timeline, Right = generated task preview
// Clean, Brilliant.com-inspired design

import React, { useState } from 'react';
import { MicrotaskRenderer } from '../microtasks/MicrotaskRenderer';
import { Microtask, TaskResult, RIASECAxis } from '../microtasks/types';
import { Sparkles, Loader2, Check, Search, Cpu, Shield, ChevronRight, Zap, Send } from 'lucide-react';

// API Configuration
const API_BASE = 'http://localhost:8000';

// Sample programs - mix of creative ones and VU programs (with context)
const SAMPLE_PROGRAMS = [
  'Quantum Physics',
  'Marine Biology',
  'Culinary Arts',
  'Space Engineering',
  'Game Design',
  'Mathematics',      // VU program with context
  'Philosophy',       // VU program with context
];

// Task format options (null = random)
const APTITUDE_FORMATS = ['classify', 'graph', 'puzzle', 'fillblank', 'codeorder'] as const;
const PERSONALITY_FORMATS = ['mcq', 'scenario', 'ranking'] as const;
type TaskFormat = typeof APTITUDE_FORMATS[number] | typeof PERSONALITY_FORMATS[number] | null;

// Timeline step status
type StepStatus = 'pending' | 'active' | 'complete' | 'error';

interface TimelineStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: StepStatus;
}

interface GeneratedTask {
  task: Microtask;
  meta: {
    program: string;
    taskType: string;
    signalType: string;
    generationTime: number;
  };
}

// Transform backend task format to frontend format
function transformTask(task: Record<string, unknown>): Microtask {
  const t = { ...task } as Record<string, unknown>;
  if (!t.type) t.type = 'mcq';
  if (!t.signalType) t.signalType = 'personality';
  if (!t.question_code) t.question_code = `task-${Date.now()}`;
  
  if (t.options && typeof t.options === 'object' && !Array.isArray(t.options)) {
    const opts = t.options as Record<string, { text: string; riasec: string }>;
    t.options = Object.entries(opts).map(([key, val]) => ({
      id: key,
      text: val.text,
      riasec: val.riasec as RIASECAxis,
    }));
  }
  return t as unknown as Microtask;
}

// Timeline Step Component with animations
function TimelineStepItem({ step, isLast, index }: { step: TimelineStep; isLast: boolean; index: number }) {
  const statusStyles = {
    pending: 'bg-gray-100 text-gray-400 border-gray-200',
    active: 'bg-amber-50 text-amber-600 border-amber-400',
    complete: 'bg-green-50 text-green-600 border-green-400',
    error: 'bg-red-50 text-red-600 border-red-400',
  };

  return (
    <div 
      className="flex items-start gap-3"
      style={{
        animation: step.status === 'complete' ? `fadeSlideIn 0.3s ease-out ${index * 0.1}s both` : undefined
      }}
    >
      {/* Icon circle */}
      <div className="flex flex-col items-center">
        <div 
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${statusStyles[step.status]}`}
          style={{
            transform: step.status === 'active' ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {step.status === 'complete' ? (
            <Check className="w-4 h-4" />
          ) : step.status === 'active' ? (
            <div className="w-4 h-4 animate-spin">{step.icon}</div>
          ) : (
            <div className="w-4 h-4">{step.icon}</div>
          )}
        </div>
        {!isLast && (
          <div 
            className={`w-0.5 h-5 transition-all duration-500 ${step.status === 'complete' ? 'bg-green-400' : 'bg-gray-200'}`}
          />
        )}
      </div>
      
      {/* Label */}
      <div className={`pt-1.5 text-sm transition-all duration-300 ${
        step.status === 'active' ? 'text-amber-700 font-medium' : 
        step.status === 'complete' ? 'text-green-700' : 'text-gray-500'
      }`}>
        {step.label}
      </div>
    </div>
  );
}

export function AgentDemo() {
  const [programInput, setProgramInput] = useState('');
  const [selectedSignalType, setSelectedSignalType] = useState<'aptitude' | 'personality'>('aptitude');
  const [selectedFormat, setSelectedFormat] = useState<TaskFormat>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTask, setGeneratedTask] = useState<GeneratedTask | null>(null);
  
  // Timeline state - 5 steps for a more detailed pipeline view
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([
    { id: 'search', label: 'Analyzing program context', icon: <Search className="w-4 h-4" />, status: 'pending' },
    { id: 'select', label: 'Selecting task type', icon: <Zap className="w-4 h-4" />, status: 'pending' },
    { id: 'generate', label: 'Generating content', icon: <Cpu className="w-4 h-4" />, status: 'pending' },
    { id: 'validate', label: 'Validating structure', icon: <Shield className="w-4 h-4" />, status: 'pending' },
    { id: 'deliver', label: 'Preparing task', icon: <Send className="w-4 h-4" />, status: 'pending' },
  ]);

  const updateStep = (stepId: string, status: StepStatus, label?: string) => {
    setTimelineSteps(prev => prev.map(s => s.id === stepId ? { ...s, status, ...(label && { label }) } : s));
  };

  const resetTimeline = () => {
    setTimelineSteps([
      { id: 'search', label: 'Analyzing program context', icon: <Search className="w-4 h-4" />, status: 'pending' },
      { id: 'select', label: 'Selecting task type', icon: <Zap className="w-4 h-4" />, status: 'pending' },
      { id: 'generate', label: 'Generating content', icon: <Cpu className="w-4 h-4" />, status: 'pending' },
      { id: 'validate', label: 'Validating structure', icon: <Shield className="w-4 h-4" />, status: 'pending' },
      { id: 'deliver', label: 'Preparing task', icon: <Send className="w-4 h-4" />, status: 'pending' },
    ]);
  };

  const handleGenerate = async (program?: string) => {
    const targetProgram = program || programInput.trim() || 'Quantum Physics';
    
    setLoading(true);
    setError(null);
    resetTimeline();
    const startTime = Date.now();
    
    try {
      // Step 1: Analyze program context
      updateStep('search', 'active');
      await new Promise(r => setTimeout(r, 300));
      updateStep('search', 'complete');
      
      // Step 2: Select task type
      updateStep('select', 'active');
      await new Promise(r => setTimeout(r, 250));
      updateStep('select', 'complete');
      
      // Step 3: Generate content (with retry detection)
      updateStep('generate', 'active');
      
      const endpoint = selectedSignalType === 'aptitude' 
        ? `${API_BASE}/agent/generate-aptitude`
        : `${API_BASE}/agent/generate-personality`;
      
      // Show "retrying" if generation takes longer than 3 seconds
      const retryTimer = setTimeout(() => {
        updateStep('generate', 'active', 'Generating content (retrying...)');
      }, 3000);
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          program: targetProgram,
          ...(selectedFormat && { task_type: selectedFormat })
        }),
      });
      
      clearTimeout(retryTimer);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Generation failed: ${res.status}`);
      }
      
      const data = await res.json();
      updateStep('generate', 'complete', 'Generating content');
      
      // Step 4: Validate structure
      updateStep('validate', 'active');
      await new Promise(r => setTimeout(r, 200));
      const task = transformTask(data.task || data);
      updateStep('validate', 'complete');
      
      // Step 5: Prepare task
      updateStep('deliver', 'active');
      await new Promise(r => setTimeout(r, 150));
      updateStep('deliver', 'complete');
      
      setGeneratedTask({
        task,
        meta: {
          program: targetProgram,
          taskType: task.type,
          signalType: task.signalType,
          generationTime: Date.now() - startTime,
        },
      });
      
    } catch (e) {
      const currentActive = timelineSteps.find(s => s.status === 'active');
      if (currentActive) updateStep(currentActive.id, 'error');
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = (result: TaskResult) => {
    console.log('Task completed:', result);
  };

  const handleTaskSkip = () => {
    console.log('Task skipped');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              {/* <h1 className="text-lg font-semibold text-slate-800">Agent Demo</h1>
              <p className="text-xs text-slate-500">AI-powered task generation</p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-10 h-[calc(100vh-100px)]">
        <div className="flex gap-0 h-full">
          
          {/* LEFT PANEL */}
          <div className="flex-1 flex flex-col h-full">
            
            {/* Program Input Card */}
            <div className="bg-white rounded-2xl p-6 mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Program Name
              </label>
              <input
                type="text"
                value={programInput}
                onChange={(e) => setProgramInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Quantum Physics"
                className="w-full px-4 py-3 bg-input-background border-2 border-vita-gold rounded-xl text-vita-near-black placeholder-muted-foreground focus:ring-2 focus:ring-vita-gold focus:bg-white outline-none transition-all"
              />
              
              {/* Quick picks */}
              <div className="mt-4 flex flex-wrap gap-2">
                {SAMPLE_PROGRAMS.map((prog) => (
                  <button
                    key={prog}
                    onClick={() => {
                      setProgramInput(prog);
                      handleGenerate(prog);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#666666] text-xs font-medium rounded-full transition-all disabled:opacity-50"
                  >
                    {prog}
                  </button>
                ))}
              </div>
            </div>

            {/* Signal Type Toggle */}
            <div className="bg-white rounded-2xl p-6 mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Task Type
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedSignalType('aptitude'); setSelectedFormat(null); }}
                  style={selectedSignalType === 'aptitude' ? { backgroundColor: '#e9d5ff', borderColor: '#c084fc' } : {}}
                  className={`flex-1 py-3 rounded-xl text-sm transition-all border-2 ${
                    selectedSignalType === 'aptitude'
                      ? 'text-purple-700'
                      : 'bg-muted border-gray-300 hover:border-purple-300 text-vita-near-black'
                  }`}
                >
                  Aptitude
                </button>
                <button
                  onClick={() => { setSelectedSignalType('personality'); setSelectedFormat(null); }}
                  style={selectedSignalType === 'personality' ? { backgroundColor: '#bfdbfe', borderColor: '#60a5fa' } : {}}
                  className={`flex-1 py-3 rounded-xl text-sm transition-all border-2 ${
                    selectedSignalType === 'personality'
                      ? 'text-blue-700'
                      : 'bg-muted border-gray-300 hover:border-blue-300 text-vita-near-black'
                  }`}
                >
                  Personality
                </button>
              </div>
              
              {/* Task Format Quick Picks */}
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedFormat(null)}
                  style={selectedFormat === null ? { 
                    backgroundColor: selectedSignalType === 'aptitude' ? '#e9d5ff' : '#bfdbfe'
                  } : {}}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selectedFormat === null
                      ? (selectedSignalType === 'aptitude' ? 'text-purple-700' : 'text-blue-700')
                      : 'bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#666666]'
                  }`}
                >
                  Random
                </button>
                {(selectedSignalType === 'aptitude' ? APTITUDE_FORMATS : PERSONALITY_FORMATS).map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    style={selectedFormat === format ? { 
                      backgroundColor: selectedSignalType === 'aptitude' ? '#e9d5ff' : '#bfdbfe'
                    } : {}}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedFormat === format
                        ? (selectedSignalType === 'aptitude' ? 'text-purple-700' : 'text-blue-700')
                        : 'bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#666666]'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="bg-white rounded-2xl p-6">
              <button
                onClick={() => handleGenerate()}
                disabled={loading}
                className="w-full py-3 bg-vita-gold hover:bg-[#C39215] text-vita-near-black font-medium rounded-xl border-2 border-vita-gold hover:border-[#C39215] transition-all disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Task
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
              </button>
            </div>

            {/* Timeline */}
            {(loading || generatedTask || error) && (
              <div className="mt-8 flex-1 bg-white rounded-2xl p-8 flex flex-col items-center justify-center">
                {/* <h3 className="text-sm font-medium text-slate-700 mb-4">Agent Pipeline</h3> */}
                <div className="space-y-0 inline-block">
                  {timelineSteps.map((step, idx) => (
                    <TimelineStepItem 
                      key={step.id} 
                      step={step} 
                      isLast={idx === timelineSteps.length - 1}
                      index={idx}
                    />
                  ))}
                </div>
                
                {generatedTask && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                    Completed in <span className="font-medium text-slate-700">{generatedTask.meta.generationTime}ms</span>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="w-px bg-[rgba(0,0,0,0.1)] mx-10 self-stretch" />

          {/* RIGHT PANEL */}
          <div className="flex-1 min-w-0">
            {generatedTask ? (
              <div className="p-6">
                {/* Task meta header */}
                <div className="mb-6 flex items-center gap-3">
                  <span 
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: generatedTask.meta.signalType === 'aptitude' ? '#e9d5ff' : '#bfdbfe',
                      color: generatedTask.meta.signalType === 'aptitude' ? '#7c3aed' : '#2563eb'
                    }}
                  >
                    {generatedTask.meta.signalType}
                  </span>
                  <span className="px-3 py-1.5 bg-white/60 text-slate-600 rounded-full text-sm font-medium">
                    {generatedTask.meta.taskType}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 text-sm">
                    {generatedTask.meta.program}
                  </span>
                </div>

                {/* Task card */}
                <div className="bg-white rounded-xl p-4">
                  <MicrotaskRenderer
                    task={generatedTask.task}
                    onComplete={handleTaskComplete}
                    onSkip={handleTaskSkip}
                  />
                </div>

                {/* Raw JSON toggle */}
                <details className="mt-6 bg-slate-900 rounded-2xl overflow-hidden">
                  <summary className="px-5 py-3 text-slate-400 text-sm cursor-pointer hover:text-slate-300 transition-colors">
                    View raw JSON
                  </summary>
                  <pre className="px-5 pb-5 text-xs text-green-400 overflow-x-auto leading-relaxed">
                    {JSON.stringify(generatedTask.task, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">No task generated yet</p>
                  <p className="text-slate-400 text-sm mt-1">Enter a program and click Generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
