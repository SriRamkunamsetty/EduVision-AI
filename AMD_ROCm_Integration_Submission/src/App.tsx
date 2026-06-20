/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Brain, Sparkles, MonitorSmartphone, GraduationCap, Cpu, ShieldAlert, Wifi, Globe, Bell, LogOut, ChevronDown, Check } from 'lucide-react';
import LandingPage from './components/LandingPage';
import TeacherDashboard from './components/TeacherDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Student, SystemMetrics, ConfusionEvent, DriftPrediction, SessionConfig } from './types';

type UserRole = 'landing' | 'teacher' | 'head' | 'admin';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('landing');
  const [initData, setInitData] = useState<{
    frame: { students: Student[]; classroomEngagement: number; classroomAttention: number; activeHandRaises: number; confusedCount: number };
    metrics: SystemMetrics;
    confusion: ConfusionEvent[];
    prediction: DriftPrediction;
    session: SessionConfig;
  } | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  interface SystemAlert {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    severity: 'high' | 'medium';
    read: boolean;
  }

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'alert_0',
      title: 'Attention Drift predicted',
      description: 'Model Gaze projection forecasted a -24% classroom attention drop in Newton Hall Rm 304.',
      timestamp: '20:12',
      severity: 'high',
      read: false
    },
    {
      id: 'alert_1',
      title: 'Active FPS Threshold Notice',
      description: 'Camera Node-01 "Newton Front" synchronized successfully at 1920x1080 resolution at 30 FPS.',
      timestamp: '20:05',
      severity: 'medium',
      read: false
    },
    {
      id: 'alert_2',
      title: 'NVIDIA Hardware Accel Active',
      description: 'GPU clusters successfully verified TensorRT inference speeds under 15ms target ranges.',
      timestamp: '19:59',
      severity: 'medium',
      read: true
    }
  ]);

  const alertedRef = useRef<Record<string, number>>({});

  const handleClearAllAlerts = () => {
    setAlerts([]);
  };

  const handleAddMockAlert = () => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const mockOptions = [
      {
        title: 'Gaze Deviation Detected',
        description: 'Multiple students in row 2 showing gaze deviation indicators away from whiteboard.',
        severity: 'medium' as const,
      },
      {
        title: 'Edge Stream Dropped Frame',
        description: 'IP Over-room Camera stream detected a 2.5s jitter on socket-connection pathways.',
        severity: 'high' as const,
      },
      {
        title: 'Pedagogic Obstacle Spike',
        description: 'Frustration indicators flagged critical 82% confusion on derivative matrix calculation.',
        severity: 'high' as const,
      }
    ];

    const randomOption = mockOptions[Math.floor(Math.random() * mockOptions.length)];
    const newMock: SystemAlert = {
      id: `mock_${Date.now()}`,
      title: randomOption.title,
      description: randomOption.description,
      timestamp: timeString,
      severity: randomOption.severity,
      read: false,
    };

    setAlerts((prev) => [newMock, ...prev]);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/session/stop', { method: 'POST' });
    } catch (err) {
      console.warn("Failed to stop course session on server logs during Logout process:", err);
    }
    setActiveRole('landing');
    setIsAlertsOpen(false);
    setIsProfileOpen(false);
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  // Mark all as read when opening alerts tray
  useEffect(() => {
    if (isAlertsOpen && alerts.some(a => !a.read)) {
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    }
  }, [isAlertsOpen, alerts]);

  // Telemetry real-time dynamic alerts generation
  useEffect(() => {
    if (!initData) return;

    const now = Date.now();
    const newAlerts: SystemAlert[] = [];

    // 1. Look for sleeping students (high fatigue alerts)
    initData.frame.students.forEach((student) => {
      if (student.activity === 'Sleeping') {
        const key = `${student.id}_sleeping`;
        if (!alertedRef.current[key] || (now - alertedRef.current[key] > 20000)) {
          alertedRef.current[key] = now;
          newAlerts.push({
            id: `alert_sleep_${student.id}_${now}`,
            title: `Severe Fatigue Alert: ${student.name}`,
            description: `Sensor tracking flagged student sleeping/napping in Row ${student.row}, Col ${student.col}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            severity: 'high',
            read: false,
          });
        }
      }

      // 2. Look for phone usage
      if (student.activity === 'Using Phone') {
        const key = `${student.id}_phone`;
        if (!alertedRef.current[key] || (now - alertedRef.current[key] > 20000)) {
          alertedRef.current[key] = now;
          newAlerts.push({
            id: `alert_phone_${student.id}_${now}`,
            title: `Distraction Event: ${student.name}`,
            description: `${student.name} is on their mobile/phone device in Row ${student.row}, Col ${student.col}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            severity: 'medium',
            read: false,
          });
        }
      }

      // 3. Look for active hand raises
      if (student.activity === 'Raising Hand') {
        const key = `${student.id}_hand`;
        if (!alertedRef.current[key] || (now - alertedRef.current[key] > 20000)) {
          alertedRef.current[key] = now;
          newAlerts.push({
            id: `alert_hand_${student.id}_${now}`,
            title: `Active Hand Raise: ${student.name}`,
            description: `${student.name} is holding their hand raised in Row ${student.row} requesting lecturer assistance.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            severity: 'high',
            read: false,
          });
        }
      }
    });

    // 4. Look for global metrics alert (GPU Load > 80)
    if (initData.metrics && initData.metrics.gpuUsage > 80) {
      const key = `gpu_load_warning`;
      if (!alertedRef.current[key] || (now - alertedRef.current[key] > 30000)) {
        alertedRef.current[key] = now;
        newAlerts.push({
          id: `alert_gpu_${now}`,
          title: `Clustered GPU Heavy Usage`,
          description: `Edge telemetry reports high GPU load on TensorRT processing clusters at ${initData.metrics.gpuUsage}% capacity.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'high',
          read: false,
        });
      }
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 15));
    }
  }, [initData]);

  // Load Initial Sync frames via Server-Sent Events (SSE)
  useEffect(() => {
    const sseSource = new EventSource('/api/stream');

    sseSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'init') {
          setInitData({
            frame: payload.frame,
            metrics: payload.metrics,
            confusion: payload.confusion,
            prediction: payload.prediction,
            session: payload.session
          });
          setConnectionStatus('connected');
        } else if (payload.type === 'telemetry_udpate') {
          setInitData((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              frame: payload.frame,
              metrics: payload.metrics,
              confusion: payload.confusion,
              prediction: payload.prediction,
              session: payload.session
            };
          });
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error("Failed to parse SSE init frame", err);
      }
    };

    sseSource.onopen = () => {
      setConnectionStatus('connected');
    };

    sseSource.onerror = (err) => {
      console.warn("Express telemetry loop offline. Re-establishing connection paths...", err);
      setConnectionStatus('connecting');
    };

    return () => {
      sseSource.close();
    };
  }, []);

  const renderActiveScreen = () => {
    if (!initData) {
      return (
        <div className="bg-slate-950 text-white min-h-screen flex flex-col items-center justify-center gap-4 text-center font-mono">
          <div className="h-10 w-10 border-4 border-t-indigo-500 border-slate-800 rounded-full animate-spin"></div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">Syncing Telemetry Channels...</span>
            <span className="text-[10px] text-slate-500 max-w-[280px]">Connecting to Newton Hall Edge AI Servers at GPU node-0...</span>
          </div>
        </div>
      );
    }

    switch (activeRole) {
      case 'landing':
        return <LandingPage onStartDemo={() => setActiveRole('teacher')} />;
      case 'teacher':
        return <TeacherDashboard initialData={initData} />;
      case 'head':
        return <AnalyticsDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <LandingPage onStartDemo={() => setActiveRole('teacher')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Universal Navbar Roles Selector Tab Bar */}
      {activeRole !== 'landing' && (
        <nav id="universal_nav_bar" className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shrink-0 relative z-30 shadow-md">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveRole('landing')}>
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center border border-indigo-400/20">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <span className="font-sans font-black text-sm tracking-tight text-white">EduVision AI</span>
              <p className="text-[8px] font-mono text-slate-400 uppercase leading-none mt-0.5">Management Portal</p>
            </div>
          </div>

          {/* Active Workspaces Selector (Role Base Authorization Controls) */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 items-center justify-center font-sans font-bold text-xs">
            <button
              onClick={() => {
                setActiveRole('teacher');
                setIsProfileOpen(false);
                setIsAlertsOpen(false);
              }}
              id="role_nav_teacher_btn"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeRole === 'teacher' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap size={14} />
              Teacher Pane
            </button>
            <button
              onClick={() => {
                setActiveRole('head');
                setIsProfileOpen(false);
                setIsAlertsOpen(false);
              }}
              id="role_nav_dept_head_btn"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeRole === 'head' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MonitorSmartphone size={14} />
              Department Head
            </button>
            <button
              onClick={() => {
                setActiveRole('admin');
                setIsProfileOpen(false);
                setIsAlertsOpen(false);
              }}
              id="role_nav_sys_admin_btn"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeRole === 'admin' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu size={14} />
              Administrator
            </button>
          </div>

          {/* Actions panel containing telemetry badge, bell notifications, user metadata profile, and logout */}
          <div className="flex items-center gap-3">
            {/* EventStream Telemetry Indicator Badge */}
            <span className="hidden sm:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
              <span className={`h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
              <span className="text-slate-400 uppercase text-[9px]">EventStream Tracker</span>
            </span>

            {/* Notification Bell Icon */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsAlertsOpen(!isAlertsOpen);
                  setIsProfileOpen(false);
                }}
                id="navbar_notif_bell"
                className="relative p-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800/80 transition cursor-pointer flex items-center justify-center h-9 w-9"
              >
                <Bell size={16} className={unreadCount > 0 ? "animate-bounce" : ""} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-rose-500 text-white text-[9px] font-sans font-extrabold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Alerts Tray Dropdown flyout */}
              {isAlertsOpen && (
                <div 
                  id="alerts_dropdown_tray" 
                  className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 text-left z-50 text-xs text-white max-h-[420px] overflow-y-auto"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-1.5 select-none animate-pulse">
                      <Bell size={14} className="text-amber-400" />
                      <h4 className="font-sans font-extrabold text-xs tracking-tight uppercase">System Alerts</h4>
                    </div>
                    <button 
                      onClick={handleClearAllAlerts}
                      className="text-[9px] font-mono text-slate-400 hover:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 py-3">
                    {alerts.length > 0 ? (
                      alerts.map((item) => (
                        <div 
                          key={item.id} 
                          className={`p-2.5 rounded-xl border font-sans flex flex-col gap-1 transition-colors ${
                            item.read ? 'bg-slate-950/40 border-slate-850/80' : 'bg-indigo-950/20 border-indigo-900/40'
                          }`}
                        >
                          <div className="flex justify-between items-center gap-2">
                            <span className={`text-[8px] font-mono font-bold uppercase px-1 py-0.5 rounded ${
                              item.severity === 'high' 
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-900/35' 
                                : 'bg-amber-950/80 text-amber-400 border border-amber-900/35'
                            }`}>
                              {item.severity}
                            </span>
                            <span className="text-[8px] text-slate-500 font-mono">
                              {item.timestamp}
                            </span>
                          </div>
                          <h5 className="font-sans font-bold text-[11px] text-slate-200 mt-0.5">{item.title}</h5>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-normal">{item.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-500 font-sans flex flex-col items-center justify-center gap-1.5">
                        <span className="text-lg font-bold">✓</span>
                        <span className="text-[11px] text-slate-400">All edge systems stable.</span>
                        <span className="text-[9px] text-slate-500 font-mono">Telemetry feeds running in variance</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-800">
                    <button 
                      onClick={handleAddMockAlert}
                      className="w-full bg-indigo-650 hover:bg-indigo-600 text-white transition py-2 rounded-xl text-[10px] font-sans font-bold text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      + Generate Test Alert
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsAlertsOpen(false);
                }}
                id="navbar_profile_dropdown"
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800/80 transition cursor-pointer select-none h-9"
              >
                <div className="h-6 w-6 rounded-lg bg-indigo-500 text-white font-sans font-black text-[10px] flex items-center justify-center shadow-inner">
                  SK
                </div>
                <span className="text-[11px] font-sans font-bold hidden lg:inline max-w-[90px] truncate text-slate-350">
                  Dr. Sriram
                </span>
                <ChevronDown size={11} className={`text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div 
                  id="profile_dropdown_menu" 
                  className="absolute right-0 mt-3 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 text-left z-50 text-xs text-white"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-sans font-extrabold text-sm flex items-center justify-center shadow-md shrink-0">
                      SK
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-sans font-black text-slate-100 text-xs truncate">Dr. Sriram Kunamsetty</span>
                      <span className="text-[9px] font-mono text-slate-400 truncate mt-0.5">sriramkunamsetty8526@gmail.com</span>
                    </div>
                  </div>

                  <div className="py-2.5 my-3 flex flex-col gap-1 text-[9px] font-mono text-slate-400 bg-slate-950/40 px-3 rounded-xl border border-slate-850/60 select-none">
                    <p className="flex justify-between leading-normal">
                      <span>Department:</span>
                      <span className="text-slate-200 font-sans font-semibold text-right">Computer Science & AI</span>
                    </p>
                    <p className="flex justify-between leading-normal">
                      <span>Access Tier:</span>
                      <span className="text-emerald-400 font-bold uppercase">Administrator</span>
                    </p>
                    <p className="flex justify-between leading-normal">
                      <span>Staff ID:</span>
                      <span className="text-slate-200">SK-NT-304</span>
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-widest block mb-2 select-none">Switch Account View</span>
                    
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          setActiveRole('teacher');
                          setIsProfileOpen(false);
                          setIsAlertsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left cursor-pointer ${
                          activeRole === 'teacher' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-850 text-slate-350 font-normal'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap size={13} />
                          <span>Lecturer Account</span>
                        </span>
                        {activeRole === 'teacher' && <Check size={12} className="text-emerald-400" />}
                      </button>

                      <button
                        onClick={() => {
                          setActiveRole('head');
                          setIsProfileOpen(false);
                          setIsAlertsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left cursor-pointer ${
                          activeRole === 'head' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-850 text-slate-350 font-normal'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MonitorSmartphone size={13} />
                          <span>Department Head</span>
                        </span>
                        {activeRole === 'head' && <Check size={12} className="text-emerald-400" />}
                      </button>

                      <button
                        onClick={() => {
                          setActiveRole('admin');
                          setIsProfileOpen(false);
                          setIsAlertsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left cursor-pointer ${
                          activeRole === 'admin' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-850 text-slate-350 font-normal'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Cpu size={13} />
                          <span>IT System Admin</span>
                        </span>
                        {activeRole === 'admin' && <Check size={12} className="text-emerald-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Action Button */}
            <button
              onClick={handleLogout}
              id="navbar_logout_btn"
              className="flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl bg-slate-950 hover:bg-rose-950/60 transition duration-150 text-xs font-semibold text-rose-400 border border-slate-800 hover:border-rose-900/40 cursor-pointer shrink-0"
              title="Logout from system"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline font-sans text-slate-350 hover:text-rose-200">Logout</span>
            </button>
          </div>
        </nav>
      )}

      {/* Render selected view */}
      <div className="flex-1 shrink-0 relative">
        {renderActiveScreen()}
      </div>
    </div>
  );
}
