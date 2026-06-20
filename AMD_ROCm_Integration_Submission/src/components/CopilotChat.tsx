/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, ArrowRight, BrainCircuit, RefreshCw } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CopilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I am EduVision AI Teacher Copilot, powered by Gemini 3.5-flash. I analyze your live RTSP/Webcam stream telemetry to provide deep classroom insights.\n\nAsk me about current struggles, confusion alerts, seating rows attention, or strategies!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const presets = [
    "Which students are struggling?",
    "What topic triggered confusion?",
    "Explain attention drift forecast.",
    "Draft a 1-minute retention challenge."
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');

    try {
      const resp = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userQuery: textToSend
        })
      });
      const data = await resp.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: "I apologize, custom inferenceloop faced an optimization delay. Please try querying in a minute." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Connection timeout while calling GenAI systems. Please verify internet and local server status." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format custom text formatting beautifully
  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-sans font-bold text-slate-800 text-sm mt-3 mb-1">{line.slice(4)}</h4>;
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return <h3 key={idx} className="font-sans font-extrabold text-slate-800 text-base mt-4 mb-2 border-b border-slate-100 pb-1">{line.replace(/^#+\s+/, '')}</h3>;
      }
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-600 text-[11px] leading-relaxed my-1">
            {formatBoldText(line.slice(2))}
          </li>
        );
      }
      // Standard line
      return <p key={idx} className="text-slate-600 text-[11px] leading-relaxed my-1.5">{formatBoldText(line)}</p>;
    });
  };

  // Replace **bold** tags with standard HTML elements
  const formatBoldText = (text: string) => {
    const regex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="font-extrabold text-slate-800">{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div id="copilot_container" className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[520px]">
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-emerald-400 rotate-12" size={18} />
          <div>
            <h3 className="font-sans font-bold text-xs leading-none">EduVision AI Teaching Copilot</h3>
            <p className="text-[9px] font-mono text-slate-400 mt-0.5">GEMINI RAG ANALYTICS CO-COUNSEL</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
          <Sparkles size={10} /> Online
        </span>
      </div>

      {/* Messages Feed area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
              m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-emerald-400'
            }`}>
              {m.role === 'user' ? 'U' : <Bot size={14} />}
            </div>

            <div className={`p-3.5 rounded-2xl border text-xs shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' 
                : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'
            }`}>
              {m.role === 'user' ? <p className="leading-relaxed">{m.content}</p> : <div className="space-y-1">{renderMessageContent(m.content)}</div>}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 mr-auto max-w-[85%]">
            <div className="h-7 w-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center text-xs shrink-0 animate-spin">
              <RefreshCw size={14} />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs rounded-tl-none flex items-center gap-2 text-slate-400">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-505 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-505 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-505 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
              <span>Gemini analyzing live classroom vectors...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Presets and entry */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        {/* Presets cards bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="text-[10px] whitespace-nowrap bg-slate-50 border border-slate-200 text-slate-600 font-sans font-medium px-2.5 py-1 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shrink-0 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Text Area layout */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-2xl p-1 bg-slate-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition duration-150">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
            placeholder="Ask Copilot about room statistics or confusion metrics..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs outline-none text-slate-800 placeholder-slate-400"
          />
          <button
            onClick={() => handleSendMessage(input)}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl p-2 transition cursor-pointer"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
