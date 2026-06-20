/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ArrowDownToLine, BarChart3, Clock, FileSpreadsheet, FileText, TrendingUp, Sparkles, Award } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  // Class comparative mock data
  const comparisons = [
    { section: 'Section A-1 (Deep Learning)', count: 12, engagement: 84, attention: 88, confusion: 12 },
    { section: 'Section B-2 (Autonomous Systems)', count: 15, engagement: 72, attention: 76, confusion: 32 },
    { section: 'Section C-4 (Data Structures)', count: 18, engagement: 68, attention: 70, confusion: 45 },
  ];

  const triggerDownloadAction = async (type: 'csv' | 'txt') => {
    setDownloadingType(type);
    try {
      const response = await fetch(`/api/reports/download/${type}`);
      const textVal = await response.text();
      
      // Create prompt payload download link
      const blob = new Blob([textVal], { type: type === 'csv' ? 'text/csv' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'csv' ? 'edu_classroom_analytics.csv' : 'edu_classroom_session_report.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn(e);
    } finally {
      setTimeout(() => setDownloadingType(null), 1000);
    }
  };

  return (
    <div id="analytics_p_container" className="flex flex-col gap-6 p-6 max-w-7xl mx-auto font-sans">
      {/* Page Title */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
          DEPARTMENT HEAD WORKSPACE
        </span>
        <h1 className="font-sans font-extrabold text-slate-800 text-2xl mt-1 leading-tight">
          Educational Analytics & Section Comparisons
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Review historical records index charts, audit teaching effectiveness, and output classroom analytics files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Trajectory comparison trends list (Col 8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section comparison overview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-5">
            <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={16} /> Live Classroom Section Audits
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase font-bold text-left">
                    <th className="pb-3">Section Description</th>
                    <th className="pb-3">Enrolled</th>
                    <th className="pb-3 text-center">Avg Engagement</th>
                    <th className="pb-3 text-center">Attention Focus</th>
                    <th className="pb-3 text-right">Frustration Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans font-medium text-slate-700">
                  {comparisons.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3.5 pr-2 font-semibold text-slate-800">{c.section}</td>
                      <td className="py-3.5 pr-2">{c.count} students</td>
                      <td className="py-3.5 px-2 text-center">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                          {c.engagement}%
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center text-indigo-600 font-bold">{c.attention}%</td>
                      <td className="py-3.5 text-right font-mono text-rose-500 font-bold">{c.confusion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Core teaching vector insight block */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-indigo-900 shadow-xl flex items-center gap-6">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-400/20 flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-slate-100">AI Pedagogic Quality Index (A-PQI)</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                Your Department currently maintains a **78.2% pedagogical quality rating**, tracking +5.4% higher than last semester baseline. Section A-1 exhibits peer-leading eye gaze vectors due to frequent pause recap slides on complex mathematical formulas.
              </p>
            </div>
          </div>
        </div>

        {/* Generate Reports block (Col 4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 flex flex-col gap-5">
            <h3 className="font-sans font-bold text-slate-800 text-sm">Download Performance Reports</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Export high-fidelity, processed CSV student index logs or clean text summaries of cognitive performance indices.
            </p>

            <div className="flex flex-col gap-3">
              <button
                disabled={downloadingType !== null}
                onClick={() => triggerDownloadAction('csv')}
                id="export_csv_btn"
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs px-4 py-3.5 rounded-2xl transition flex items-center justify-between shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-600" size={16} />
                  <span>Student Engagement Logs</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">.CSV</span>
              </button>

              <button
                disabled={downloadingType !== null}
                onClick={() => triggerDownloadAction('txt')}
                id="export_txt_btn"
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs px-4 py-3.5 rounded-2xl transition flex items-center justify-between shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <FileText className="text-indigo-600" size={16} />
                  <span>Teaching Session Summary</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">.TXT</span>
              </button>
            </div>

            {downloadingType && (
              <p className="text-[9px] font-mono text-emerald-500 mt-1 transition animate-pulse">
                Generating file. Initiating raw streams download sequence...
              </p>
            )}
          </div>

          {/* Historical lists */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col gap-4">
            <h4 className="font-sans font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Clock size={14} /> Historical Sessions Audit
            </h4>
            <div className="flex flex-col gap-2">
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-sans font-semibold text-slate-800">Gradient Descent Intro</p>
                  <p className="text-[9px] font-mono text-slate-400">June 18 • Newton Rm-304</p>
                </div>
                <span className="font-mono text-[10px] text-emerald-600 font-extrabold">88% ENG</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-sans font-semibold text-slate-800">Convnets Multi-Class Layers</p>
                  <p className="text-[9px] font-mono text-slate-400">June 15 • Newton Rm-304</p>
                </div>
                <span className="font-mono text-[10px] text-emerald-600 font-extrabold">79% ENG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
