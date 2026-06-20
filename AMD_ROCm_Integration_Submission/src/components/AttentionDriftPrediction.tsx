/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrendingDown, TrendingUp, AlertTriangle, Cpu, HelpCircle, Layers, CheckCircle } from 'lucide-react';
import { DriftPrediction } from '../types';

interface AttentionDriftPredictionProps {
  prediction: DriftPrediction;
  currentEngagement: number;
}

export default function AttentionDriftPrediction({ prediction, currentEngagement }: AttentionDriftPredictionProps) {
  const isDropSignificant = prediction.predictedDropPercent > 10;
  
  // Create simulated timeline paths for graph rendering
  // Coordinates are generated dynamically relative to real values
  const currentVal = currentEngagement;
  const nextVal = prediction.predictedEngagementIn5Min;

  const points = [
    { label: 'Now', val: currentVal, estNum: currentVal },
    { label: '+1m', val: currentVal - (prediction.predictedDropPercent * 0.2), estNum: Math.round(currentVal - (prediction.predictedDropPercent * 0.2)) },
    { label: '+2m', val: currentVal - (prediction.predictedDropPercent * 0.4), estNum: Math.round(currentVal - (prediction.predictedDropPercent * 0.4)) },
    { label: '+3m', val: currentVal - (prediction.predictedDropPercent * 0.6), estNum: Math.round(currentVal - (prediction.predictedDropPercent * 0.6)) },
    { label: '+4m', val: currentVal - (prediction.predictedDropPercent * 0.8), estNum: Math.round(currentVal - (prediction.predictedDropPercent * 0.8)) },
    { label: '+5m', val: nextVal, estNum: nextVal }
  ];

  // SVG dimensions for trajectory graph
  const width = 380;
  const height = 110;
  const padX = 30;
  const padY = 20;

  const getSvgCoordinates = () => {
    return points.map((p, idx) => {
      const x = padX + (idx * (width - padX * 2)) / (points.length - 1);
      const y = height - padY - (p.val / 100) * (height - padY * 2);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div id="drift_predictor_card" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="text-violet-600" size={20} />
          <div>
            <h2 className="font-sans font-bold text-slate-800 text-sm leading-none">Attention Drift Prediction</h2>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">LSTM / TRANSFORMER TEMPORAL COGNITIVE FORECASTING</p>
          </div>
        </div>
        
        <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-[10px] font-mono font-semibold rounded-full border border-violet-100">
          <Cpu size={12} className="animate-spin text-violet-500" /> Confidence: {Math.round(prediction.confidenceScore * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Trajectory Graph (Column 7/12) */}
        <div className="md:col-span-7 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">5-Minute Class Engagement Trajectory Preview</span>
          
          <div className="bg-slate-950 p-4 rounded-2xl relative overflow-hidden border border-slate-800 shadow-inner">
            {/* Horizontal guidelines */}
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-800/60 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-1/4 border-t border-slate-800/40 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-3/4 border-t border-slate-800/40 pointer-events-none"></div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
              {/* Reference fill path underneath curve */}
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d={`M ${padX},${height - padY} L ${getSvgCoordinates()} L ${width - padX},${height - padY} Z`}
                fill="url(#curveGradient)"
              />

              {/* Connecting line path */}
              <polyline
                fill="none"
                stroke={isDropSignificant ? '#ef4444' : '#8b5cf6'}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getSvgCoordinates()}
                className="transition-all duration-500"
              />

              {/* Specific point nodes circles */}
              {points.map((p, idx) => {
                const x = padX + (idx * (width - padX * 2)) / (points.length - 1);
                const y = height - padY - (p.val / 100) * (height - padY * 2);
                const isFirst = idx === 0;
                const isLast = idx === points.length - 1;

                return (
                  <g key={idx} className="cursor-pointer group">
                    <circle
                      cx={x}
                      cy={y}
                      r={isLast || isFirst ? 5.5 : 4}
                      fill={isLast ? '#ef4444' : isFirst ? '#4f46e5' : '#8b5cf6'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      {p.estNum}%
                    </text>
                    <text
                      x={x}
                      y={height - 2}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="7"
                      fontFamily="sans-serif"
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Prediction Diagnostic alerts block (Column 5/12) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
            isDropSignificant 
              ? 'bg-rose-50/70 border-rose-100 text-rose-900 shadow-sm' 
              : 'bg-emerald-50/70 border-emerald-100 text-emerald-900 shadow-sm'
          }`}>
            <div className="flex items-center gap-2">
              {isDropSignificant ? (
                <TrendingDown className="text-rose-600 animate-bounce" size={18} />
              ) : (
                <TrendingUp className="text-emerald-600" size={18} />
              )}
              <span className="font-sans font-extrabold text-sm">
                {isDropSignificant 
                  ? `Attention Drop Hazard Predicted (-${prediction.predictedDropPercent}%)` 
                  : 'Engagement Outlook Stable'
                }
              </span>
            </div>

            <p className="text-[11px] font-sans font-medium leading-relaxed opacity-90">
              {prediction.driftReason}
            </p>

            {isDropSignificant && (
              <div className="mt-2 text-[9px] font-mono bg-rose-100 px-2 py-1 rounded-lg border border-rose-200 text-rose-800 flex items-start gap-1">
                <AlertTriangle size={12} className="text-rose-600 mt-0.5 shrink-0" />
                <span>
                  <strong>LSTM Trigger Flag:</strong> Temporal sequence length tracked rising gaze shifts downward since 42s.
                </span>
              </div>
            )}
          </div>

          {/* Copilot suggested remedy */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3">
            {isDropSignificant ? (
              <div className="bg-amber-100 text-amber-800 rounded-xl p-2 shrink-0">
                <HelpCircle size={16} />
              </div>
            ) : (
              <div className="bg-emerald-100 text-emerald-800 rounded-xl p-2 shrink-0">
                <CheckCircle size={16} fill="none" />
              </div>
            )}
            <div>
              <p className="font-sans font-bold text-slate-800 text-xs leading-none">AI Action Recommendation</p>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1.5">
                {isDropSignificant 
                  ? "Launch a 1-minute slide review questionnaire or direct questions specifically to Newton Room Col-2 seats to break up the napping trend."
                  : "Great pacing flow! Current classroom retention and eye gaze vectors match target benchmarks perfectly."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
