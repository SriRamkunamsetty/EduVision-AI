/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { User, Eye, Sparkles, Sliders, LayoutGrid, Award } from 'lucide-react';
import { Student } from '../types';

interface ClassroomHeatmapProps {
  students: Student[];
}

export default function ClassroomHeatmap({ students }: ClassroomHeatmapProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Group students by row & columns for visual grid representation
  const maxRows = Math.max(...students.map(s => s.row), 3);
  const maxCols = Math.max(...students.map(s => s.col), 4);

  const gridRows = Array.from({ length: maxRows }, (_, rIndex) => {
    return Array.from({ length: maxCols }, (_, cIndex) => {
      return students.find(s => s.row === rIndex + 1 && s.col === cIndex + 1);
    });
  });

  return (
    <div id="heatmap_card" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="text-indigo-600" size={20} />
          <h2 className="font-sans font-bold text-slate-800 text-lg">Classroom Heatmap & Seating Layout</h2>
        </div>
        <span className="text-slate-400 text-xs font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
          Newton Rm-304 Grid
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Seating Layout map (8/12 grid columns) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Whiteboard / Teaching board simulation indicator */}
          <div className="w-4/5 py-2.5 mb-8 bg-slate-900 text-slate-300 font-mono text-center text-xs tracking-widest uppercase font-semibold rounded-lg border border-slate-700 shadow shrink-0">
            [ FRONT LECTURE BOARD / TEACHING STAND ]
          </div>

          {/* Interactive Responsive Grid of Seats */}
          <div className="grid gap-3 w-full max-w-lg shrink-0" style={{ gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))` }}>
            {gridRows.map((rowArr, rIdx) => 
              rowArr.map((student, cIdx) => {
                if (!student) {
                  return (
                    <div 
                      key={`empty-${rIdx}-${cIdx}`} 
                      className="aspect-square bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 text-[10px]"
                    >
                      Empty
                    </div>
                  );
                }

                // Green/Yellow/Red selection based on engagement score
                let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60';
                let dotClass = 'bg-emerald-500';
                if (student.engagementScore < 50) {
                  colorClass = 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/60';
                  dotClass = 'bg-rose-500';
                } else if (student.engagementScore < 75) {
                  colorClass = 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/60';
                  dotClass = 'bg-amber-500';
                }

                const isActive = selectedStudent?.id === student.id;

                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    id={`seat_student_${student.id}`}
                    className={`aspect-square p-2 border rounded-2xl flex flex-col justify-between text-left transition duration-150 cursor-pointer ${colorClass} ${
                      isActive ? 'ring-2 ring-indigo-500 scale-95 shadow-lg' : 'shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                        A-{student.row}-{student.col}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${dotClass} animate-pulse`}></span>
                    </div>

                    <div className="mt-1 flex flex-col">
                      <span className="font-sans font-bold text-xs truncate max-w-[85px] leading-tight text-slate-800">
                        {student.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-mono font-medium opacity-80 mt-0.5">
                        ENG: {student.engagementScore}%
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          
          <div className="mt-6 flex gap-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-300"></span> Engaged (&gt;75%)</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500 border border-amber-300"></span> Passive (50%-75%)</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-rose-500 border border-rose-300"></span> Distressed/Sleeping (&lt;50%)</span>
          </div>
        </div>

        {/* Selected Student HUD Metrics panel (4/12 grid columns) */}
        <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-[320px] flex flex-col justify-between">
          {selectedStudent ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <div className="h-10 w-10 bg-slate-800 text-white rounded-xl flex items-center justify-center font-bold">
                  {selectedStudent.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-sans font-bold text-slate-800 text-sm leading-tight">{selectedStudent.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400">INDEX: {selectedStudent.id}</p>
                </div>
              </div>

              {/* Engagement Dial / Indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Engagement INDEX</span>
                  <span className="text-lg font-mono font-bold text-slate-800">{selectedStudent.engagementScore}%</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Emotion Track</span>
                  <span className="text-xs font-sans font-semibold text-slate-700 mt-1 capitalize">{selectedStudent.emotion}</span>
                </div>
              </div>

              {/* Focus Bar parameters */}
              <div className="flex flex-col gap-2 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-mono text-slate-500 flex items-center gap-1"><Eye size={12} /> Gaze Attention</span>
                  <span className="font-mono text-slate-800 font-bold">{selectedStudent.attentionScore}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${selectedStudent.attentionScore}%` }}></div>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5 font-mono">STATE: {selectedStudent.attention}</p>
              </div>

              {/* Behavior Metrics */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-400">Current Behavior:</span>
                  <span className="font-medium text-slate-700">{selectedStudent.activity}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-400">Behavior Score:</span>
                  <span className="font-mono text-slate-700">{selectedStudent.activityScore}%</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono text-slate-700 text-[10px]">Row {selectedStudent.row}, Desk {selectedStudent.col}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-slate-400 py-12 gap-3 m-auto">
              <Award className="text-slate-300 animate-bounce" size={40} />
              <div className="flex flex-col">
                <span className="font-sans font-bold text-xs text-slate-600">Select Seating Block</span>
                <span className="text-[10px] text-slate-400 max-w-[160px] leading-relaxed mt-1 m-auto">Click on any classroom seat in the grid mapping to inspect precise bounding metrics.</span>
              </div>
            </div>
          )}

          {/* Prompt AI diagnostics about selected desk */}
          {selectedStudent && (
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl mt-4 text-[10px] text-indigo-800 flex items-start gap-1.5 shadow-sm">
              <Sparkles size={14} className="text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Copilot Tip:</strong> {selectedStudent.name.split(' ')[0]} is currently flagged as{' '}
                <strong>{selectedStudent.engagementScore}%</strong> engagement. {
                  selectedStudent.engagementScore < 50 
                    ? 'Use a rapid review question to re-trigger attention.' 
                    : 'Acknowledge hand gestures with positive verbal cues.'
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
