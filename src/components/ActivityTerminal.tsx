import React, { useRef, useEffect, useState } from 'react';
import {
  Terminal as TerminalIcon,
  Circle,
  Clock,
  HardDrive,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  Copy,
  Check,
} from 'lucide-react';
import { OptimizationJob, TerminalLogEntry } from '../types/optimizer.js';

interface ActivityTerminalProps {
  job: OptimizationJob | null;
  isProcessing: boolean;
}

export const ActivityTerminal: React.FC<ActivityTerminalProps> = ({ job, isProcessing }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [job?.logs, autoScroll]);

  const handleContainerScroll = () => {
    if (!logContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    // Auto-scroll resumes only if user scrolls near bottom (< 30px)
    const atBottom = scrollHeight - scrollTop - clientHeight < 30;
    if (autoScroll !== atBottom) {
      setAutoScroll(atBottom);
    }
  };

  const copyLogs = () => {
    if (!job?.logs) return;
    const logText = job.logs.map((l) => `[${l.stageCode}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStage = job?.stage || 0;
  const progressPercent = Math.min(100, Math.round((currentStage / 12) * 100));

  const originalSizeMB = job?.originalSpecs ? (job.originalSpecs.fileSize / (1024 * 1024)).toFixed(2) : '0.00';
  const outputSizeMB = job?.optimizedSpecs ? (job.optimizedSpecs.fileSize / (1024 * 1024)).toFixed(2) : (isProcessing ? 'Calculating...' : '0.00');

  return (
    <section id="terminal" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#00FF66]/20 pb-4">
        <div>
          <div className="text-xs font-mono text-[#00FF66] tracking-widest uppercase mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] inline-block shadow-[0_0_8px_#00FF66]" />
            SECTION 02 · REAL-TIME ACTIVITY TERMINAL
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Processing Activity Terminal
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Live telemetry stream tracking genuine backend container restructuring and bitstream verification.
          </p>
        </div>

        {/* Engine Status Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-[#00FF66]/30 font-mono text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isProcessing
                  ? 'bg-[#00FF66] animate-pulse shadow-[0_0_10px_#00FF66]'
                  : job?.status === 'completed'
                  ? 'bg-[#00FF66]'
                  : job?.status === 'failed'
                  ? 'bg-red-500'
                  : 'bg-neutral-600'
              }`}
            />
            <span className="text-white uppercase font-bold">
              {isProcessing
                ? `STAGE ${currentStage}/12 EXECUTING`
                : job?.status === 'completed'
                ? 'OPTIMIZATION COMPLETED'
                : job?.status === 'failed'
                ? 'PROCESS ERROR'
                : 'ENGINE IDLE / READY'}
            </span>
          </div>

          <button
            onClick={copyLogs}
            disabled={!job?.logs?.length}
            className="p-2 rounded-lg bg-[#0c140e] border border-neutral-800 hover:border-[#00FF66]/40 text-neutral-400 hover:text-white transition-all disabled:opacity-40"
            title="Copy Terminal Output"
          >
            {copied ? <Check className="w-4 h-4 text-[#00FF66]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Telemetry Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 font-mono text-xs">
        <div className="p-3 rounded-xl bg-[#090e0b] border border-[#00FF66]/20 flex items-center justify-between">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#00FF66]" />
            ACTIVE STAGE
          </span>
          <span className="font-bold text-white">
            {job ? `[${String(currentStage).padStart(2, '0')}/12]` : '[--/12]'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#090e0b] border border-[#00FF66]/20 flex items-center justify-between">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00FF66]" />
            PROCESS TIME
          </span>
          <span className="font-bold text-[#00FF66]">
            {job?.elapsedTotalMs ? `${(job.elapsedTotalMs / 1000).toFixed(2)}s` : isProcessing ? 'Timing...' : '0.00s'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#090e0b] border border-[#00FF66]/20 flex items-center justify-between">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
            ORIGINAL SIZE
          </span>
          <span className="font-bold text-white">{originalSizeMB} MB</span>
        </div>

        <div className="p-3 rounded-xl bg-[#090e0b] border border-[#00FF66]/20 flex items-center justify-between">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-[#00FF66]" />
            OUTPUT SIZE
          </span>
          <span className="font-bold text-[#00FF66]">{outputSizeMB} {outputSizeMB !== 'Calculating...' ? 'MB' : ''}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1.5">
          <span>PIPELINE PROGRESS</span>
          <span className="text-[#00FF66] font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00FF66] to-[#4dff91] transition-all duration-300 shadow-[0_0_12px_#00FF66]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Terminal Screen Container */}
      <div className="rounded-2xl border border-[#00FF66]/30 bg-black overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,255,102,0.03)]">
        {/* Terminal Titlebar */}
        <div className="px-4 py-3 bg-[#0a0f0c] border-b border-[#00FF66]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#00FF66]/80 inline-block" />
            </div>
            <span className="text-xs font-mono text-neutral-400 ml-2">
              fahad_method@core-engine:~ (SSE Live Stream)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded bg-black border-neutral-700 text-[#00FF66] focus:ring-0"
              />
              <span>Auto-scroll</span>
            </label>
          </div>
        </div>

        {/* Terminal Logs Window */}
        <div
          ref={logContainerRef}
          onScroll={handleContainerScroll}
          className="p-4 sm:p-5 font-mono text-xs sm:text-sm h-72 sm:h-96 overflow-y-auto space-y-2 select-text break-words"
        >
          {job?.logs && job.logs.length > 0 ? (
            job.logs.map((log, index) => {
              const isLast = index === job.logs.length - 1;
              return (
                <div
                  key={log.id || index}
                  className={`leading-relaxed transition-opacity break-words ${
                    log.status === 'error'
                      ? 'text-red-400'
                      : log.status === 'success'
                      ? 'text-[#00FF66]'
                      : log.status === 'running'
                      ? 'text-amber-300'
                      : 'text-neutral-300'
                  }`}
                >
                  <span className="text-neutral-500 mr-2 shrink-0">
                    {log.elapsedMs ? `+${(log.elapsedMs / 1000).toFixed(2)}s` : '0.00s'}
                  </span>
                  <span className="font-bold mr-2 text-white">
                    {log.message}
                  </span>

                  {log.details && (
                    <div className="pl-4 sm:pl-14 text-xs text-neutral-400 font-mono mt-0.5 break-all">
                      {Object.entries(log.details).map(([key, val]) => (
                        <span key={key} className="mr-3 inline-block">
                          <span className="text-neutral-400">{key}:</span>{' '}
                          <span className="text-neutral-200">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {isLast && isProcessing && (
                    <span className="inline-block w-2 h-4 bg-[#00FF66] ml-2 animate-pulse align-middle" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-neutral-400 space-y-1.5 py-6">
              <div className="text-[#00FF66] font-bold">[FAHAD METHOD ENGINE INITIALIZED]</div>
              <div>Ready for input file. Terminal will stream real-time pipeline events here:</div>
              <div className="pl-4 text-xs text-neutral-400 space-y-0.5 mt-2">
                <div>[01] Loading original video...</div>
                <div>[02] Inspecting MP4 container...</div>
                <div>[03] Detecting original video streams...</div>
                <div>[04] Detecting original FPS...</div>
                <div>[05] Analyzing video metadata...</div>
                <div>[06] Reading MP4 sample tables...</div>
                <div>[07] Initializing optimization engine...</div>
                <div>[08] Preserving original encoded streams...</div>
                <div>[09] Optimizing container structure...</div>
                <div>[10] Validating output file...</div>
                <div>[11] Verifying original media streams...</div>
                <div>[12] Optimization completed.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
