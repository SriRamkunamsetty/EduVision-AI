/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Camera, PlusCircle, Server, ShieldCheck, Activity, Cpu, RefreshCw, Zap, Wifi } from 'lucide-react';
import { CameraConfig, SystemMetrics } from '../types';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    gpuUsage: 64,
    gpuTemp: 68,
    vramUsed: 6920,
    vramTotal: 16160,
    inferenceSpeedMs: 12.8,
    queueSize: 0,
    activeStreams: 2,
    cpuUsage: 18,
    ramUsage: 5.2
  });

  const [cameras, setCameras] = useState<CameraConfig[]>([
    {
      id: 'cam_01',
      name: 'Newton-304 Main Front',
      url: 'rtsp://admin:psw123@192.168.1.100:554/stream1',
      fps: 30,
      resolution: '1920x1080',
      status: 'Online',
      gpuId: 0
    },
    {
      id: 'cam_02',
      name: 'Newton-304 Overhead Rear',
      url: 'rtsp://admin:psw123@192.168.1.101:554/stream1',
      fps: 30,
      resolution: '1920x1080',
      status: 'Online',
      gpuId: 0
    }
  ]);

  // Form states to add new active IP Camera stream URLs
  const [newCamName, setNewCamName] = useState('Newton Hall Hallway Cam');
  const [newCamUrl, setNewCamUrl] = useState('rtsp://admin:passwd@192.168.1.140:554/stream1');
  const [addingCam, setAddingCam] = useState(false);

  // Sync state over SSE so Admin panel updates instantly too!
  useEffect(() => {
    const sseSource = new EventSource('/api/stream');
    sseSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.metrics) setMetrics(payload.metrics);
        if (payload.cameras) setCameras(payload.cameras);
      } catch (err) {
        console.warn(err);
      }
    };
    return () => sseSource.close();
  }, []);

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCam(true);
    try {
      const resp = await fetch('/api/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCamName,
          url: newCamUrl,
          fps: 30,
          resolution: '1920x1080',
          gpuId: 0
        })
      });
      const data = await resp.json();
      if (data.success) {
        setCameras(data.cameras);
        setNewCamName('Newton-304 Wide Front');
        setNewCamUrl('rtsp://admin:passwd@192.168.1.200:554/live1');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingCam(false);
    }
  };

  return (
    <div id="admin_p_container" className="flex flex-col gap-6 p-6 max-w-7xl mx-auto font-sans">
      {/* Page Title */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
          SYSTEM ADMINISTRATOR DASHBOARD
        </span>
        <h1 className="font-sans font-extrabold text-slate-800 text-2xl mt-1 leading-tight">
          GPU Inference Cluster & Camera Gateway Status
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Monitor NVIDIA deep learning loads, manage RTSP stream addresses, and troubleshoot processing micro-latencies.
        </p>
      </div>

      {/* GPU cluster telemetry dials */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric block 1 */}
        <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-lg flex flex-col gap-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">NVIDIA T4 GPU Load</span>
            <Cpu size={16} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-mono font-black">{metrics.gpuUsage}%</span>
          </div>
          {/* Progress bar background indicator container */}
          <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${metrics.gpuUsage}%` }}></div>
          </div>
          <p className="text-[9px] font-mono text-slate-400">Core Temp: {metrics.gpuTemp}°C // VRAM clock locked</p>
        </div>

        {/* Metric block 2 */}
        <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-lg flex flex-col gap-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Inference Speed</span>
            <Activity size={16} className="text-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-mono font-black">{metrics.inferenceSpeedMs} ms</span>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(metrics.inferenceSpeedMs/30)*100}%` }}></div>
          </div>
          <p className="text-[9px] font-mono text-slate-400">Active Queue Pipeline size: {metrics.queueSize}</p>
        </div>

        {/* Metric block 3 */}
        <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-lg flex flex-col gap-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Tesla VRAM Allocated</span>
            <Zap size={16} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-mono font-black">{metrics.vramUsed} MB</span>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${(metrics.vramUsed/metrics.vramTotal)*100}%` }}></div>
          </div>
          <p className="text-[9px] font-mono text-slate-400">Capacity Total limits: {metrics.vramTotal} MB</p>
        </div>

        {/* Metric block 4 */}
        <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-lg flex flex-col gap-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-violet-400 font-bold uppercase">Active RTSP Streams</span>
            <Wifi size={16} className="text-violet-400 animate-bounce" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-mono font-black">{cameras.length} Nodes</span>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${(cameras.length/5)*100}%` }}></div>
          </div>
          <p className="text-[9px] font-mono text-slate-400">FPS rating targets: 30 FPS constant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cameras lists (Col 7/12) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-4">
            <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
              <Server className="text-indigo-600" size={16} /> Connected Video Gateway Channels
            </h3>

            <div className="flex flex-col gap-3">
              {cameras.map((c, i) => (
                <div key={i} className="border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-50 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200">
                      <Camera size={18} />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-xs text-slate-800">{c.name}</h4>
                      <p className="text-[9px] font-mono text-slate-400 max-w-[200px] md:max-w-xs truncate">{c.url}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1 font-mono text-[9px] text-slate-400">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-sans font-bold rounded border border-emerald-100 flex items-center gap-1">
                      <Wifi size={10} /> Online
                    </span>
                    <span>{c.resolution} • {c.fps} FPS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Cameras Form (Col 5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-4">
            <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
              <PlusCircle className="text-indigo-600" size={16} /> Register Digital IP Camera (RTSP Gateway)
            </h3>

            <form onSubmit={handleAddCamera} className="font-sans text-xs text-slate-600 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-600">Camera Name:</label>
                <input
                  type="text"
                  required
                  value={newCamName}
                  onChange={(e) => setNewCamName(e.target.value)}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-200 outline-none text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-600">RTSP Stream Address / URL Paths:</label>
                <input
                  type="text"
                  required
                  value={newCamUrl}
                  onChange={(e) => setNewCamUrl(e.target.value)}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-200 outline-none font-mono text-[10px] text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={addingCam}
                id="add_rtsp_cam_submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-2xl transition duration-150 shadow-md cursor-pointer disabled:opacity-50"
              >
                {addingCam ? 'Registering...' : 'Register Video Channel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
