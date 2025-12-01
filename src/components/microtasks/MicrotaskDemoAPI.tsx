'use client';

import { useState } from 'react';
import { MicrotaskRenderer } from './MicrotaskRenderer';
import { Microtask, TaskResult, RIASECAxis } from './types';
import { VitaButton } from '../vita-ui/VitaButton';

// API Configuration
const API_BASE = 'http://localhost:8000';
const DEMO_PROGRAM = 'Mathematics';
const AXES: RIASECAxis[] = ['R', 'I', 'A', 'S', 'E', 'C'];

type RIASECVector = [number, number, number, number, number, number];

interface Session {
  studentVector: RIASECVector;
  programVectors: Record<string, unknown>;
  usedTaskIds: string[];
}

// Transform backend task format to frontend format
function transformTask(task: Record<string, unknown>): Microtask {
  const t = { ...task } as Record<string, unknown>;
  if (!t.type) t.type = 'mcq';
  if (!t.signalType) t.signalType = 'personality';
  if (!t.question_code) t.question_code = `task-${Date.now()}`;
  
  // Transform options from object {A: {text, riasec}} to array [{id, text, riasec}]
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

function l1Normalize(v: RIASECVector): RIASECVector {
  const sum = v.reduce((a, b) => a + b, 0);
  if (sum === 0) return [1/6, 1/6, 1/6, 1/6, 1/6, 1/6];
  return v.map(x => x / sum) as RIASECVector;
}

function getTopAxis(v: RIASECVector): RIASECAxis {
  const normalized = l1Normalize(v);
  let maxIdx = 0;
  for (let i = 1; i < 6; i++) {
    if (normalized[i] > normalized[maxIdx]) maxIdx = i;
  }
  return AXES[maxIdx];
}

export function MicrotaskDemoAPI() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentTask, setCurrentTask] = useState<Microtask | null>(null);
  const [currentProgram, setCurrentProgram] = useState<string>(DEMO_PROGRAM);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [pendingResult, setPendingResult] = useState<TaskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{ entropy: number; policy: string; apt_prob: number; program: string } | null>(null);

  const initSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/student/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar_chosen: 'demo_avatar',
          hs_profile: 'N&T',
          demo: { name: 'Demo', age: 17, hs_profile: 'N&T' },
        }),
      });
      if (!res.ok) throw new Error(`Init failed: ${res.status}`);
      const data = await res.json();
      const newSession: Session = {
        studentVector: data.student_vector as RIASECVector,
        programVectors: data.program_vectors,
        usedTaskIds: [],
      };
      setSession(newSession);
      return newSession;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Init failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchTask = async (sess: Session) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/student/fetch-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_vector: sess.studentVector,
          program: DEMO_PROGRAM,
          used_task_ids: sess.usedTaskIds,
          avatar_chosen: 'demo_avatar',
          demo: { name: 'Demo', age: 17, hs_profile: 'N&T' },
        }),
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      const task = transformTask(data.task);
      setCurrentTask(task);
      setCurrentProgram(data.task.program || DEMO_PROGRAM);
      setDebugInfo({
        entropy: data.task.meta?.entropy ?? 0,
        policy: data.task.meta?.policy ?? 'unknown',
        apt_prob: data.task.meta?.apt_prob ?? 0,
        program: data.task.program ?? DEMO_PROGRAM,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const updateVector = async (sess: Session, result: TaskResult, liked: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/student/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_vector: sess.studentVector,
          program: currentProgram,
          program_vectors: sess.programVectors,
          task_answer: result.signalType === 'personality' ? result.selectedRiasec : null,
          task_preference: liked ? 'positive' : 'negative',
          is_correct: result.isCorrect,
          signal_type: result.signalType,
          used_task_ids: sess.usedTaskIds,
          avatar_chosen: 'demo_avatar',
          demo: { name: 'Demo', age: 17, hs_profile: 'N&T' },
        }),
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      const data = await res.json();
      
      const newSession: Session = {
        studentVector: data.student_vector as RIASECVector,
        programVectors: data.program_vectors,
        usedTaskIds: [...sess.usedTaskIds, currentTask?.question_code || ''].filter(Boolean),
      };
      setSession(newSession);

      if (data.should_stop) {
        setCurrentTask(null);
      } else if (data.next_task) {
        const task = transformTask(data.next_task);
        setCurrentTask(task);
        setCurrentProgram(data.next_task.program || DEMO_PROGRAM);
        setDebugInfo({
          entropy: data.next_task.meta?.entropy ?? 0,
          policy: data.next_task.meta?.policy ?? 'unknown',
          apt_prob: data.next_task.meta?.apt_prob ?? 0,
          program: data.next_task.program ?? DEMO_PROGRAM,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    const sess = await initSession();
    if (sess) await fetchTask(sess);
  };

  const handleComplete = (result: TaskResult) => {
    setPendingResult(result);
  };

  const handlePreference = async (liked: boolean) => {
    if (!pendingResult || !session || !currentTask) return;
    const resultWithMeta = { 
      ...pendingResult, 
      preference: liked ? 1 : 0,
      program: debugInfo?.program ?? currentProgram,
      entropy: debugInfo?.entropy,
      apt_prob: debugInfo?.apt_prob,
    };
    setResults(prev => [...prev, resultWithMeta as TaskResult & { program: string; entropy?: number; apt_prob?: number }]);
    await updateVector(session, pendingResult, liked);
    setPendingResult(null);
  };

  const handleSkip = async () => {
    if (!session || !currentTask) return;
    const newSession = {
      ...session,
      usedTaskIds: [...session.usedTaskIds, currentTask.question_code],
    };
    setSession(newSession);
    await fetchTask(newSession);
  };

  const handleReset = () => {
    setSession(null);
    setCurrentTask(null);
    setResults([]);
    setPendingResult(null);
    setError(null);
    setDebugInfo(null);
  };

  const studentVector = session?.studentVector ?? [1/6, 1/6, 1/6, 1/6, 1/6, 1/6] as RIASECVector;
  const topAxis = getTopAxis(studentVector);

  // Start screen
  if (!session && results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">API Demo</h1>
          <p className="text-slate-600 mb-6">Tests real backend API at {API_BASE}</p>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}
          <VitaButton onClick={handleStart} disabled={loading}>
            {loading ? 'Connecting...' : 'Start Demo'}
          </VitaButton>
        </div>
      </div>
    );
  }

  // Complete screen
  if (!currentTask && results.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Session Complete!</h2>
            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <h3 className="font-medium mb-3">Final RIASEC Profile</h3>
              <div className="flex justify-center gap-2">
                {AXES.map((axis, idx) => (
                  <div key={axis} className="text-center">
                    <div className="w-10 bg-blue-500 rounded-t mx-auto" style={{ height: `${studentVector[idx] * 100}px` }} />
                    <div className="text-sm font-medium mt-1">{axis}</div>
                    <div className="text-xs text-slate-500">{(studentVector[idx] * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2 mb-6 text-left">
              {results.map((r: TaskResult & { program?: string; entropy?: number; apt_prob?: number }, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${r.signalType === 'aptitude' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {r.signalType}
                    </span>
                    <span className="text-green-700 font-medium">{r.program ?? '-'}</span>
                    <span className="text-slate-400 text-xs">ent:{r.entropy?.toFixed(2)} apt:{((r.apt_prob ?? 0) * 100).toFixed(0)}%</span>
                  </div>
                  <span className={r.isCorrect === true ? 'text-green-600' : r.isCorrect === false ? 'text-red-600' : 'text-slate-500'}>
                    {r.isCorrect === true ? '✓' : r.isCorrect === false ? '✗' : `→ ${r.selectedRiasec}`}
                  </span>
                </div>
              ))}
            </div>
            <VitaButton onClick={handleReset}>
              Try Again
            </VitaButton>
          </div>
        </div>
      </div>
    );
  }

  // Task screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}
        
        {/* Stats */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
          <div className="flex flex-wrap gap-4 justify-between items-center text-sm">
            <div><span className="text-slate-500">Top:</span> <span className="font-bold text-blue-600">{topAxis}</span></div>
            <div><span className="text-slate-500">API Program:</span> <span className="font-medium text-green-700">{debugInfo?.program ?? '-'}</span></div>
            <div><span className="text-slate-500">Entropy:</span> <span className="font-mono">{(debugInfo?.entropy ?? 0).toFixed(3)}</span></div>
            <div><span className="text-slate-500">Apt%:</span> <span className="font-mono">{debugInfo ? (debugInfo.apt_prob * 100).toFixed(0) : 0}%</span></div>
            <div><span className="text-slate-500">Policy:</span> <span className="font-mono text-xs">{debugInfo?.policy}</span></div>
          </div>
          <div className="flex gap-1 mt-3">
            {AXES.map((axis, idx) => (
              <div key={axis} className="flex-1 text-center">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${axis === topAxis ? 'bg-blue-600' : 'bg-blue-300'}`} style={{ width: `${studentVector[idx] * 100}%` }} />
                </div>
                <div className={`text-xs mt-1 ${axis === topAxis ? 'font-bold text-blue-600' : 'text-slate-500'}`}>{axis}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task type badges */}
        {currentTask && (
          <div className="mb-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentTask.signalType === 'aptitude' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {currentTask.signalType}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">{currentTask.type}</span>
          </div>
        )}

        {/* Preference UI or Task */}
        {pendingResult ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">{pendingResult.isCorrect === true ? '✅' : pendingResult.isCorrect === false ? '❌' : '📝'}</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {pendingResult.signalType === 'aptitude' ? (pendingResult.isCorrect ? 'Correct!' : 'Not quite') : `Selected: ${pendingResult.selectedRiasec}`}
            </h3>
            <p className="text-slate-600 mb-6">Did you enjoy this task?</p>
            <div className="flex justify-center gap-4">
              <VitaButton onClick={() => handlePreference(true)} disabled={loading}>
                👍 Liked
              </VitaButton>
              <VitaButton variant="secondary" onClick={() => handlePreference(false)} disabled={loading}>
                👎 Not for me
              </VitaButton>
            </div>
          </div>
        ) : currentTask ? (
          <MicrotaskRenderer task={currentTask} onComplete={handleComplete} onSkip={handleSkip} />
        ) : loading ? (
          <div className="text-center p-8">Loading...</div>
        ) : null}

        {/* Live diagnostics panel */}
        <div className="mt-6 p-4 bg-slate-900 rounded-xl text-sm font-mono border-2 border-slate-700">
          <div className="text-green-400 font-bold mb-2">� DIAGNOSTICS: {results.length} tasks completed</div>
          <div className="flex justify-between items-center mb-3 text-slate-300">
            <span>Stopping Progress</span>
            <span>Entropy: {(debugInfo?.entropy ?? 1.79).toFixed(3)} (stop &lt; 1.20)</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full mb-4">
            <div 
              className="h-full bg-green-500 rounded-full transition-all" 
              style={{ width: `${Math.min(100, Math.max(0, (1.79 - (debugInfo?.entropy ?? 1.79)) / (1.79 - 1.20) * 100))}%` }} 
              />
            </div>
            {results.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {results.map((r: TaskResult & { program?: string; entropy?: number; apt_prob?: number }, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span className={r.signalType === 'aptitude' ? 'text-purple-400' : 'text-blue-400'}>
                      {idx + 1}. {r.signalType} | {r.program ?? '-'}
                    </span>
                    <span className="text-slate-500">
                      ent:{r.entropy?.toFixed(2) ?? '-'} apt:{((r.apt_prob ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
