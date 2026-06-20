/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Webcam, Monitor, Zap, AlertTriangle } from 'lucide-react';
import { Student } from '../types';

interface StudentCamFeedProps {
  students: Student[];
  isSessionRunning: boolean;
  onSimulateSleep: () => void;
  onSimulateConfusion: () => void;
  onSimulateHandRaise: () => void;
}

export default function StudentCamFeed({
  students,
  isSessionRunning,
  onSimulateSleep,
  onSimulateConfusion,
  onSimulateHandRaise,
}: StudentCamFeedProps) {
  const [streamSource, setStreamSource] = useState<'rtsp_sim' | 'webcam'>('rtsp_sim');
  const [activeCam, setActiveCam] = useState<'front' | 'rear'>('front');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [inferenceFps, setInferenceFps] = useState(29.8);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Toggle Web Camera
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (streamSource === 'webcam') {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } })
        .then((stream) => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.log("Video play locked", err));
          }
          setIsWebcamActive(true);
        })
        .catch((err) => {
          console.warn("Camera permissions denied or webcam missing", err);
          alert("Could not access webcam. Using RTSP simulation fallback.");
          setStreamSource('rtsp_sim');
        });
    } else {
      setIsWebcamActive(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [streamSource]);

  // Fluctuating FPS overlay to simulate living inferencing pipeline
  useEffect(() => {
    const intv = setInterval(() => {
      setInferenceFps(parseFloat((28.5 + Math.random() * 2.8).toFixed(1)));
    }, 1200);
    return () => clearInterval(intv);
  }, []);

  // WebCam Canvas bounding box rendering
  useEffect(() => {
    let animId: number;
    const ctx = canvasRef.current?.getContext('2d');
    
    const drawOverlay = () => {
      if (!canvasRef.current || !ctx) return;
      
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      ctx.clearRect(0, 0, width, height);

      if (streamSource === 'webcam' && isWebcamActive) {
        // Overlay a mock bounding box around the user's face in the center
        const centerX = width / 2;
        const centerY = height / 2 - 20;
        const boxSize = 130;

        ctx.strokeStyle = '#22c55e'; // Green
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - boxSize/2, centerY - boxSize/2, boxSize, boxSize);

        // Tech visual handles
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillText('STUDENT_ID: 00_LOCAL_FEED (YOU)', centerX - boxSize/2, centerY - boxSize/2 - 25);
        ctx.fillText('ATTENTION: LOOKING AT SCREEN (98%)', centerX - boxSize/2, centerY - boxSize/2 - 10);
        ctx.fillText('EMOTION: INTERESTED / CONNECTED', centerX - boxSize/2, centerY + boxSize/2 + 20);

        // Small corner highlight bracket lines
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444'; // Red gaze pointer vector
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + 30, centerY - Math.sin(Date.now() / 200) * 15);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillText('GAZE VECTOR', centerX + 35, centerY - 5);
      } else {
        // Draw standard RTSP students simulated map
        if (!isSessionRunning) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.fillRect(0, 0, width, height);
          ctx.font = 'bold 16px Inter, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText('SESSION TERMINATED. START TO RECONNECT CAMERA PIPELINE.', width / 2, height / 2);
          return;
        }

        students.forEach((s) => {
          // Map student bounding box (scaled by CSS percentage handles but we can draw on Canvas as well)
          const scaleX = width / 100;
          const scaleY = height / 100;

          const sX = s.box.x * scaleX;
          const sY = s.box.y * scaleY;
          const sW = s.box.w * scaleX;
          const sH = s.box.h * scaleY;

          // Select stroke based on engagement level
          let strokeColor = '#22c55e'; // green
          if (s.engagementScore < 50) strokeColor = '#ef4444'; // red
          else if (s.engagementScore < 75) strokeColor = '#eab308'; // yellow

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(sX, sY, sW, sH);

          // Transparent colored fill
          ctx.fillStyle = strokeColor + '15'; // 15% opacity hex
          ctx.fillRect(sX, sY, sW, sH);

          // Gaze directional line
          ctx.beginPath();
          ctx.strokeStyle = '#06b6d4'; // Cyan gaze pointer
          ctx.lineWidth = 1.5;
          ctx.moveTo(sX + sW/2, sY + 30);
          ctx.lineTo(sX + sW/2 + s.gazeVector.x * 20, sY + 30 + s.gazeVector.y * 20);
          ctx.stroke();

          // Text identifiers
          ctx.fillStyle = '#0f172a';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px JetBrains Mono, monospace';
          
          // Small text tag backgrounds
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(sX, sY - 18, sW + 10, 15);
          
          ctx.fillStyle = strokeColor;
          ctx.fillText(`${s.name.split(' ')[0]} - ${s.engagementScore}%`, sX + 4, sY - 7);

          // Display current action underneath the box
          ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
          ctx.fillRect(sX, sY + sH, sW, 14);
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px JetBrains Mono, monospace';
          ctx.fillText(`${s.activity.substring(0, 16)}`, sX + 4, sY + sH + 10);
        });
      }

      animId = requestAnimationFrame(drawOverlay);
    };

    drawOverlay();

    return () => cancelAnimationFrame(animId);
  }, [students, streamSource, isWebcamActive, isSessionRunning]);

  return (
    <div id="camera_section_card" className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
      {/* Video stream top settings control bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSessionRunning ? 'bg-red-400' : 'bg-slate-500'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isSessionRunning ? 'bg-red-500' : 'bg-slate-600'}`}></span>
          </div>
          <div>
            <span className="font-mono text-sm uppercase text-slate-400 font-semibold tracking-wider">
              {streamSource === 'webcam' ? 'LOCAL WEBCAM FEED' : `STREAM: NEWTON 304 - FRONT CAMERA`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Feed selectors */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex">
            <button
              onClick={() => setStreamSource('rtsp_sim')}
              id="rtsp_cam_button"
              className={`flex items-center gap-1.5 font-sans font-medium text-xs px-3 py-1.5 rounded-lg transition-all ${
                streamSource === 'rtsp_sim' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor size={14} />
              RTSP Cam
            </button>
            <button
              onClick={() => setStreamSource('webcam')}
              id="webcam_cam_button"
              className={`flex items-center gap-1.5 font-sans font-medium text-xs px-3 py-1.5 rounded-lg transition-all ${
                streamSource === 'webcam' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Webcam size={14} />
              Local Webcam
            </button>
          </div>

          <div className="bg-slate-950 text-emerald-400 font-mono text-xs px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
            <Zap size={12} className="text-amber-400" />
            <span>NVIDIA T4: {inferenceFps} FPS</span>
          </div>
        </div>
      </div>

      {/* Main video canvas display frame */}
      <div className="relative aspect-video w-full bg-black shrink-0">
        {streamSource === 'webcam' ? (
          <video
            ref={videoRef}
            id="webcam_video_element"
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            muted
            playsInline
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden">
            {/* High fidelity animated background simulating video classrooms */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(51,65,85,0.73)_0%,rgba(15,23,42,1)_100%)] opacity-85" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[90%] h-[90%] flex flex-wrap justify-center items-center gap-4 opacity-15">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-16 h-16 rounded-full bg-indigo-500 border border-indigo-300 animate-pulse" style={{ animationDelay: `${i*150}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Floating AI computer vision canvas tracker boxes output */}
        <canvas
          ref={canvasRef}
          id="cv_overlay_canvas"
          width={640}
          height={360}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Floating status warnings inside camera frame */}
        {isSessionRunning && streamSource === 'rtsp_sim' && (
          <div className="absolute left-4 bottom-4 z-20 pointer-events-none flex flex-col gap-1.5">
            <div className="bg-slate-950/90 border border-slate-800 backdrop-blur text-[10px] font-mono px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300 shadow-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              <span>YOLOv11 & arcFace inference loop active</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Quick-Test Simulation Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <label className="text-xs font-mono text-slate-400 gap-1.5 flex items-center font-medium">
          <AlertTriangle size={14} className="text-amber-400" />
          SIMULATION CONTROLS (QUICK DEPLOYMENT TESTING)
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSimulateHandRaise}
            id="trigger_handraise_btn"
            disabled={!isSessionRunning}
            className="bg-indigo-950 hover:bg-indigo-900 text-indigo-200 hover:text-white disabled:opacity-50 border border-indigo-800 disabled:cursor-not-allowed font-sans font-medium text-xs px-3 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 shadow"
          >
            ✋ Hand-Raise
          </button>
          <button
            onClick={onSimulateSleep}
            id="trigger_sleep_btn"
            disabled={!isSessionRunning}
            className="bg-rose-950 hover:bg-rose-900 text-rose-200 hover:text-white disabled:opacity-50 border border-rose-800 disabled:cursor-not-allowed font-sans font-medium text-xs px-3 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 shadow"
          >
            😴 Nap Distraction
          </button>
          <button
            onClick={onSimulateConfusion}
            id="trigger_confusion_btn"
            disabled={!isSessionRunning}
            className="bg-amber-950 hover:bg-amber-900 text-amber-200 hover:text-white disabled:opacity-50 border border-amber-800 disabled:cursor-not-allowed font-sans font-medium text-xs px-3 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 shadow"
          >
            ❓ Spike Confusion
          </button>
        </div>
      </div>
    </div>
  );
}
