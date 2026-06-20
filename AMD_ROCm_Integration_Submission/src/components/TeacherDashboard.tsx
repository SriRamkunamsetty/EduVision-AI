/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Play, Square, Users, Flame, HelpCircle, AlertTriangle, HelpCircle as QuestionIcon, PlusCircle, Bell, VolumeX, ShieldQuestion } from 'lucide-react';
import { Student, SystemMetrics, ConfusionEvent, DriftPrediction, SessionConfig, CameraConfig } from '../types';
import StudentCamFeed from './StudentCamFeed';
import ClassroomHeatmap from './ClassroomHeatmap';
import AttentionDriftPrediction from './AttentionDriftPrediction';
import CopilotChat from './CopilotChat';

interface TeacherDashboardProps {
  initialData: {
    frame: { students: Student[]; classroomEngagement: number; classroomAttention: number; activeHandRaises: number; confusedCount: number };
    metrics: SystemMetrics;
    confusion: ConfusionEvent[];
    prediction: DriftPrediction;
    session: SessionConfig;
  };
}

export default function TeacherDashboard({ initialData }: TeacherDashboardProps) {
  // Setup reactive live hooks
  const [session, setSession] = useState<SessionConfig>(initialData.session);
  const [students, setStudents] = useState<Student[]>(initialData.frame.students);
  const [avgEngagement, setAvgEngagement] = useState<number>(initialData.frame.classroomEngagement);
  const [avgAttention, setAvgAttention] = useState<number>(initialData.frame.classroomAttention);
  const [activeHandRaises, setActiveHandRaises] = useState<number>(initialData.frame.activeHandRaises);
  const [confusedCount, setConfusedCount] = useState<number>(initialData.frame.confusedCount);

  const [prediction, setPrediction] = useState<DriftPrediction>(initialData.prediction);
  const [confusionHistory, setConfusionHistory] = useState<ConfusionEvent[]>(initialData.confusion);
  const [cameras, setCameras] = useState<CameraConfig[]>([]);

  // Simulation controls state
  const [topicInput, setTopicInput] = useState('Gradient Descent Optimizer chain-rules');
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [alertLogs, setAlertLogs] = useState<{ id: string; message: string; timestamp: Date }[]>([]);

  // Connect to SSE (Server Sent Events) EventStream for immediate real-time synchronization
  useEffect(() => {
    let sseSource = new EventSource('/api/stream');

    sseSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.session) setSession(payload.session);
        if (payload.frame) {
          setStudents(payload.frame.students);
          setAvgEngagement(payload.frame.classroomEngagement);
          setAvgAttention(payload.frame.classroomAttention);
          setActiveHandRaises(payload.frame.activeHandRaises);
          setConfusedCount(payload.frame.confusedCount);

          // Let's create beautiful instantaneous push notification logs on key triggers
          // E.g. Hand raising, sleeping
          const hands = payload.frame.students.filter((s: Student) => s.activity === 'Raising Hand');
          const sleeping = payload.frame.students.filter((s: Student) => s.activity === 'Sleeping');

          if (hands.length > activeHandRaises) {
            const lastHandSt = hands[hands.length - 1];
            addAlertLog(`✋ HAND-RAISE DETECTED: ${lastHandSt.name} in Row ${lastHandSt.row} raised their hand!`);
          }
          if (sleeping.length > students.filter(s => s.activity === 'Sleeping').length) {
            const lastSleepSt = sleeping[sleeping.length - 1];
            addAlertLog(`😴 FATIGUE DRIFT DETECTED: ${lastSleepSt.name} in Row ${lastSleepSt.row} fell asleep.`);
          }
        }
        if (payload.metrics) {
          // System states can be shared
        }
        if (payload.confusion) setConfusionHistory(payload.confusion);
        if (payload.prediction) setPrediction(payload.prediction);
        if (payload.cameras) setCameras(payload.cameras);
      } catch (err) {
        console.error("Error reading sse streaming payload", err);
      }
    };

    sseSource.onerror = (err) => {
      console.warn("SSE interface connection delay. Reconnecting automatically.", err);
    };

    return () => {
      sseSource.close();
    };
  }, [activeHandRaises, students]);

  const addAlertLog = (message: string) => {
    setAlertLogs((prev) => [
      { id: `${Date.now()}_alert`, message, timestamp: new Date() },
      ...prev.slice(0, 15)
    ]);
  };

  // Start Session handler
  const handleStartSession = async () => {
    setIsStartingSession(true);
    try {
      const resp = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput,
          subject: 'Computer Science & AI Pipeline Engines',
          classroomName: 'Newton Hall - Room 304'
        })
      });
      const data = await resp.json();
      if (data.success) {
        setSession(data.session);
        addAlertLog(`🚀 NEW CLASSROOM SESSION ACTIVATED. Topic focus: "${topicInput}"`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStartingSession(false);
    }
  };

  // Stop Session handler
  const handleStopSession = async () => {
    try {
      const resp = await fetch('/api/session/stop', { method: 'POST' });
      const data = await resp.json();
      if (data.success) {
        setSession(data.session);
        addAlertLog(`🛑 SENSORS DISCONNECTED. Session successfully concluded.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Immediate simulations triggers via server proxy
  const triggerSimulation = async (type: 'handraise' | 'sleep' | 'confusion') => {
    try {
      await fetch(`/api/simulate/${type}`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto font-sans">
      {/* Session Title & Start Stop Controllers */}
      <div id="session_control_banner" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
            A1
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              {session.isRunning ? 'LIVE INTERACTION ANALYTICS ACTIVATED' : 'SENSORS STANDBY / OFFLINE'}
            </span>
            <h1 className="font-sans font-extrabold text-slate-800 text-xl leading-tight">
              {session.isRunning ? `${session.topic}` : 'Start New Lecture Analytics'}
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Class: <strong className="text-slate-700">{session.name}</strong> • Classroom: <strong className="text-slate-700">{session.classroomName}</strong>
            </p>
          </div>
        </div>

        {/* Input Topic Controller */}
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200/60 flex-wrap">
          {!session.isRunning ? (
            <>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Lecture topic description..."
                className="bg-white border border-slate-200 outline-none rounded-xl px-4 py-2 text-xs w-64 text-slate-800"
              />
              <button
                disabled={isStartingSession}
                onClick={handleStartSession}
                id="start_session_button"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play size={13} fill="currentColor" /> Start Class
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-mono text-emerald-600 font-bold px-3 py-1 bg-emerald-50 rounded-lg flex items-center gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Live Processing...
              </span>
              <button
                onClick={handleStopSession}
                id="stop_session_button"
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Square size={13} fill="currentColor" /> Conclude Session
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Rows & column distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column (8 grid slots) - Video, Seating & Forecasting */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Key Metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white px-5 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">ENGAGEMENT INDEX</span>
                <h3 className="text-2xl font-mono font-bold text-slate-800 mt-1">{avgEngagement}%</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                E
              </div>
            </div>

            <div className="bg-white px-5 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">EYE GAZE INDEX</span>
                <h3 className="text-2xl font-mono font-bold text-slate-800 mt-1">{avgAttention}%</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                A
              </div>
            </div>

            <div className="bg-white px-5 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">HAND RAISES</span>
                <h3 className="text-2xl font-mono font-bold text-slate-800 mt-1">{activeHandRaises}</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs animate-bounce">
                ✋
              </div>
            </div>

            <div className="bg-white px-5 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">CONFUSED MARKS</span>
                <h3 className="text-2xl font-mono font-bold text-slate-800 mt-1">{confusedCount}</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                ❓
              </div>
            </div>
          </div>

          {/* Student stream component */}
          <StudentCamFeed
            students={students}
            isSessionRunning={session.isRunning}
            onSimulateSleep={() => triggerSimulation('sleep')}
            onSimulateConfusion={() => triggerSimulation('confusion')}
            onSimulateHandRaise={() => triggerSimulation('handraise')}
          />

          {/* Predictive attention drift section */}
          <AttentionDriftPrediction
            prediction={prediction}
            currentEngagement={avgEngagement}
          />

          {/* Heatmap & Grid charts block */}
          <ClassroomHeatmap students={students} />
        </div>

        {/* Right column (4 grid slots) - Chat assistant, Alert center & Logs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Chat Assistant */}
          <CopilotChat />

          {/* Alert Center Logs */}
          <div id="notifs_logs_card" className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="text-amber-400" size={16} />
                <h3 className="font-sans font-bold text-xs">Telemetry Alert Center</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Live logs trigger</span>
            </div>

            <div className="p-4 flex flex-col gap-3 max-h-[220px] overflow-y-auto bg-slate-50/50">
              {alertLogs.length > 0 ? (
                alertLogs.map((l) => (
                  <div key={l.id} className="text-[10px] font-mono bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm flex flex-col gap-1 leading-relaxed text-slate-700">
                    <span className="text-[8px] text-slate-400 text-right">
                      {l.timestamp.toLocaleTimeString()}
                    </span>
                    <p className="font-sans font-semibold text-slate-800">{l.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 text-[10px] py-12 flex flex-col items-center justify-center gap-1.5 m-auto">
                  <VolumeX className="text-slate-300" size={24} />
                  <span>No incidents flagged yet.</span>
                  <span className="text-[9px] text-slate-400">Start session to track.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
