/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Monitor, Zap, Compass, Users, Layers, ShieldCheck, ArrowRight, Sparkles, Brain } from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
}

export default function LandingPage({ onStartDemo }: LandingPageProps) {
  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-2/3 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner & Header Navigation */}
      <header className="px-6 lg:px-12 py-6 border-b border-slate-900 flex items-center justify-between shrink-0 relative z-20">
        <div className="flex items-center gap-2.5">
          <Brain className="text-indigo-400" size={24} />
          <span className="font-sans font-extrabold text-lg tracking-tight select-none bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            EduVision AI
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-400 font-medium font-sans">
          <a href="#pipeline" className="hover:text-white transition hidden md:inline">CV Pipeline</a>
          <a href="#features" className="hover:text-white transition hidden md:inline">Features</a>
          <button
            onClick={onStartDemo}
            id="header_launch_demo_btn"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4.5 py-2 rounded-xl transition shadow-lg shrink-0 cursor-pointer flex items-center gap-1"
          >
            Launch System <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Body Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 md:py-24 relative z-10 flex flex-col gap-12 lg:gap-16 justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Slogans and call to action inputs (Col 7/12) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-mono w-fit shadow-md">
              <Sparkles size={12} className="text-amber-400" />
              <span>GPU-Accelerated Classroom analytics Engine</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tight leading-none text-white">
              Real-Time <br />
              <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                Classroom Engagement
              </span> <br />
              Intelligence Platform.
            </h1>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg font-sans">
              Analyze live edge streams with YOLOv11 and facial cognitive architectures. Deliver immediate, explainable attention metrics, emotional frustration indicators, active hand raises tracker, and LSTM predictive attention drift straight to the teacher's podium.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button
                onClick={onStartDemo}
                id="hero_start_demo_workspace"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-indigo-500/20 transition duration-150 flex items-center gap-2 group cursor-pointer"
              >
                Start Living Demo <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
              </button>
              <a
                href="#pipeline"
                className="text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 text-sm font-semibold px-6 py-3.5 rounded-2xl transition shadow flex items-center gap-1.5"
              >
                Inspect CV Layer
              </a>
            </div>

            <div className="flex items-center gap-6 mt-4 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-yellow-400" /> NVIDIA TensorRT acceleration</span>
              <span className="flex items-center gap-1.5"><Users size={14} className="text-indigo-400" /> 2.2s WebSocket-like syncing</span>
            </div>
          </div>

          {/* Interactive Bounding box illustration mockup (Col 5/12) */}
          <div className="lg:col-span-5 relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
            <div className="absolute inset-0 bg-cover bg-center bg-[radial-gradient(circle_at_center,rgba(51,65,85,0.3)_0%,rgba(15,23,42,0.9)_100%)]"></div>
            
            {/* Overlay mockup labels */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 shadow-xl backdrop-blur">
                <span className="text-[10px] font-mono font-bold text-amber-400">FRONT_CAM_LIVE // INF_NODE_0</span>
                <span className="text-[10px] font-mono text-emerald-400">29.6 FPS</span>
              </div>

              {/* Box 1 */}
              <div className="absolute top-[35%] left-[22%] w-[32%] h-[40%] border-2 border-emerald-500 bg-emerald-500/10 rounded-xl flex flex-col justify-end p-2 animate-pulse" style={{ animationDuration: '3s' }}>
                <span className="text-[7px] font-mono bg-emerald-500 text-slate-950 px-1 py-0.5 rounded w-fit absolute -top-4 -left-0.5">LIAM J. (92% ATT)</span>
                <span className="text-[6px] font-mono text-emerald-300">AffectNet: INTERESTED</span>
                <div className="h-0.5 w-10 bg-cyan-400 mt-1 origin-left rotate-[-30deg]" />
              </div>

              {/* Box 2 */}
              <div className="absolute top-[42%] right-[18%] w-[30%] h-[38%] border-2 border-rose-500 bg-rose-500/10 rounded-xl flex flex-col justify-end p-2 animate-pulse" style={{ animationDuration: '4.5s' }}>
                <span className="text-[7px] font-mono bg-rose-500 text-slate-950 px-1 py-0.5 rounded w-fit absolute -top-4 -left-0.5">NOAH D. (18% ATT)</span>
                <span className="text-[6px] font-mono text-rose-300">YOLO_Pose: SLEEPING</span>
                <div className="h-0.5 w-6 bg-cyan-400 mt-1 origin-left rotate-[80deg]" />
              </div>

              <div className="text-[9px] font-mono text-slate-500 text-center bg-slate-950/50 py-1.5 rounded-lg border border-slate-900">
                Mock representation of face-mesh tracking coordinates on RTSP feeds
              </div>
            </div>
          </div>
        </div>

        {/* Neural Network Computer Vision pipeline details section (Section 2) */}
        <section id="pipeline" className="border-t border-slate-900 pt-16 flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
            <h2 className="text-xl md:text-3xl font-sans font-black tracking-tight text-white">Advanced Deep Learning Cognitive Stack</h2>
            <p className="text-slate-400 text-xs md:text-sm font-sans">
              Our edge servers run parallel pipelines combining specialized neural outputs for unified assessment context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl flex flex-col gap-4 text-left">
              <div className="h-10 w-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-900">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-100">Face Vector Recognition</h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-2">
                  Uses **YOLOv11** & **ArcFace** models to generate dynamic face coordinates, tracking multi-class classroom attendance with zero identity footprint.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl flex flex-col gap-4 text-left">
              <div className="h-10 w-10 rounded-xl bg-sky-950 text-sky-400 flex items-center justify-center border border-sky-900">
                <Compass size={18} />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-100">Head Pose & Eye Gaze Tracker</h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-2">
                  Uses **MediaPipe Face Mesh** and 3D Head Angle projections to construct instantaneous 3D Gaze vectors, pinpointing board attention.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl flex flex-col gap-4 text-left">
              <div className="h-10 w-10 rounded-xl bg-violet-950 text-violet-400 flex items-center justify-center border border-violet-900">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-100">Pose & Activity Classifier</h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-2">
                  NVIDIA-backed convolutional nets and **YOLO Pose** classifies hand raising, writing notes, resting, or excessive phone usage.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer bar */}
      <footer className="py-8 bg-slate-950 text-slate-600 border-t border-slate-900 text-center text-xs font-mono shrink-0">
        <p>© 2026 EduVision AI Platform. Engineered for next-generation intelligence. Protected under proprietary edge protocols.</p>
      </footer>
    </div>
  );
}
