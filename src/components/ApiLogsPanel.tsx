import React, { useState } from 'react';
import { useDemo } from '../store/DemoStore';
import { Terminal, ChevronUp, ChevronDown, Trash2, Globe, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ApiLogsPanel() {
  const { apiLogs, clearApiLogs } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  return (
    <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:w-[480px] z-50 bg-zinc-950 border-t sm:border border-zinc-800 sm:rounded-t-2xl shadow-2xl overflow-hidden font-mono text-xs text-zinc-300">
      {/* Header Bar */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-900 px-4 py-3 flex items-center justify-between hover:bg-zinc-850/80 transition-colors border-b border-zinc-800"
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-tight">ZonePilot Backend API Gateway</span>
          <span className="bg-zinc-800 text-[10px] text-zinc-400 px-2 py-0.5 rounded-full font-medium">
            {apiLogs.length} req
          </span>
        </div>
        <div className="flex items-center gap-3">
          {apiLogs.length > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); clearApiLogs(); }} 
              className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
              title="Clear all logs"
            >
              <Trash2 size={13} />
            </button>
          )}
          {isOpen ? <ChevronDown size={14} className="text-zinc-400" /> : <ChevronUp size={14} className="text-zinc-400" />}
        </div>
      </button>

      {/* Main Console Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 350 }}
            exit={{ height: 0 }}
            className="flex flex-col h-[350px]"
          >
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-zinc-950">
              {apiLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-10 text-center">
                  <Globe size={24} className="mb-2 text-zinc-700 animate-spin" style={{ animationDuration: '4s' }} />
                  <div>No requests captured yet.</div>
                  <div className="text-[10px] mt-1 text-zinc-700">Trigger actions in the UI to see REST requests.</div>
                </div>
              ) : (
                apiLogs.map((log) => {
                  const isSuccess = log.status >= 200 && log.status < 300;
                  const isExpanded = selectedLog === log.id;
                  
                  return (
                    <div 
                      key={log.id} 
                      className={`border rounded-lg overflow-hidden transition-all ${
                        isExpanded ? 'border-zinc-700 bg-zinc-900/50' : 'border-zinc-900 hover:border-zinc-800 bg-zinc-900/20'
                      }`}
                    >
                      <button 
                        onClick={() => setSelectedLog(isExpanded ? null : log.id)}
                        className="w-full text-left p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] uppercase ${
                            log.method === 'GET' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                            log.method === 'POST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                            'bg-amber-950 text-amber-400 border border-amber-900'
                          }`}>
                            {log.method}
                          </span>
                          <span className="font-medium text-zinc-300 break-all">{log.endpoint}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${
                            isSuccess ? 'bg-emerald-950/70 text-emerald-400' : 'bg-red-950/70 text-red-400'
                          }`}>
                            {log.status}
                          </span>
                          <span className="text-[10px] text-zinc-600">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-zinc-800 p-3 space-y-2 bg-zinc-950 text-[11px]">
                          {log.payload && (
                            <div>
                              <div className="text-zinc-500 font-semibold mb-1 flex items-center gap-1">
                                <span>Request Payload</span>
                                <ArrowRight size={10} />
                              </div>
                              <pre className="bg-zinc-900 p-2 rounded text-zinc-400 whitespace-pre-wrap break-all border border-zinc-850 custom-scrollbar">
                                {log.payload}
                              </pre>
                            </div>
                          )}
                          <div>
                            <div className="text-zinc-500 font-semibold mb-1 flex items-center gap-1">
                              <span>API Response Body</span>
                            </div>
                            <pre className="bg-zinc-900 p-2 rounded text-emerald-400 whitespace-pre-wrap break-all border border-zinc-850 custom-scrollbar">
                              {log.response}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="bg-zinc-900 px-3 py-1.5 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
              <span>Environment: Local Sandbox Dev</span>
              <span>Port: 3000 (Internal Proxied)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
