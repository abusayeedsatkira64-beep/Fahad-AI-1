import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroBanner } from './components/HeroBanner.js';
import { VideoOptimizer } from './components/VideoOptimizer.js';
import { ActivityTerminal } from './components/ActivityTerminal.js';
import { OptimizationResult } from './components/OptimizationResult.js';
import { TikTokAnalyzer } from './components/TikTokAnalyzer.js';
import { ContactSection } from './components/ContactSection.js';
import { Footer } from './components/Footer.js';
import { VideoInspection, OptimizationJob } from './types/optimizer.js';

export default function App() {
  const [activeSection, setActiveSection] = useState('optimizer');
  const [selectedInspection, setSelectedInspection] = useState<VideoInspection | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<OptimizationJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInspectionChange = (inspection: VideoInspection | null, filePath: string | null) => {
    setSelectedInspection(inspection);
    setCurrentFilePath(filePath);
  };

  const handleStartJob = async (filePath: string) => {
    setIsProcessing(true);
    setActiveSection('terminal');

    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize optimization');
      }

      const jobId = data.jobId;
      setActiveJob(data.job);

      let isFinished = false;

      // Resilient background polling to guarantee smooth real-time progress across all proxies/iframes
      const pollTimer = setInterval(async () => {
        if (isFinished) return;
        try {
          const r = await fetch(`/api/jobs/${jobId}`);
          if (r.ok) {
            const current = await r.json();
            setActiveJob((prev) => {
              if (!prev) return current;
              // Keep newer logs
              return {
                ...current,
                logs: current.logs?.length >= (prev.logs?.length || 0) ? current.logs : prev.logs,
              };
            });
            if (current.status === 'completed' || current.status === 'failed') {
              isFinished = true;
              setIsProcessing(false);
              clearInterval(pollTimer);
              try { eventSource?.close(); } catch (_) {}
            }
          }
        } catch (_) {}
      }, 500);

      // Connect to SSE for instant push events
      let eventSource: EventSource | null = null;
      try {
        eventSource = new EventSource(`/api/optimize/stream/${jobId}`);

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'init' || payload.type === 'job') {
              setActiveJob((prev) => ({
                ...(prev || payload.data || payload.job),
                ...(payload.data || payload.job),
              }));
            } else if (payload.type === 'log') {
              setActiveJob((prev) => {
                if (!prev) return null;
                const exists = prev.logs.some((l) => l.id === payload.data.id);
                return {
                  ...prev,
                  stage: payload.data.stageNumber,
                  logs: exists ? prev.logs : [...prev.logs, payload.data],
                };
              });
            } else if (payload.type === 'complete') {
              isFinished = true;
              setActiveJob(payload.data);
              setIsProcessing(false);
              clearInterval(pollTimer);
              eventSource?.close();
            } else if (payload.type === 'error') {
              isFinished = true;
              setIsProcessing(false);
              clearInterval(pollTimer);
              eventSource?.close();
            }
          } catch (_) {}
        };

        eventSource.onerror = () => {
          // Normal disconnect on completion or proxy cycle - polling maintains real-time sync
          if (isFinished) {
            try { eventSource?.close(); } catch (_) {}
          }
        };
      } catch (_) {}
    } catch (err: any) {
      console.warn('Optimization launch warning:', err);
      setIsProcessing(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!activeJob || activeJob.status !== 'completed' || !activeJob.downloadUrl) return;

    const url = activeJob.downloadUrl;
    const rawBase = activeJob.originalSpecs?.filename ? activeJob.originalSpecs.filename.replace(/\.[^/.]+$/, '') : 'video';
    const cleanBase = rawBase.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const downloadFileName = `FAHAD_METHOD_${cleanBase}.mp4`;

    try {
      setIsDownloading(true);

      // Method 1: Fetch as Blob and create temporary download link (100% reliable inside iframes)
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Download HTTP error ${res.status}`);
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        try {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      }, 2000);
    } catch (err: any) {
      console.warn('Direct blob download error, triggering fallback anchor:', err);
      // Method 2 Fallback: programmatic anchor with target _blank and download attribute
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = downloadFileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch (_) {}
      }, 1000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col font-sans selection:bg-[#00FF66] selection:text-black">
      {/* Top Bar Contract Navigation */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content Sections */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* Hero Section */}
        <HeroBanner
          onStartOptimizing={() => handleNavigate('optimizer')}
          onOpenTerminal={() => handleNavigate('terminal')}
        />

        {/* 1. Video Optimizer (Primary Engine) */}
        <VideoOptimizer
          onStartJob={handleStartJob}
          isProcessing={isProcessing}
          selectedInspection={selectedInspection}
          onInspectionChange={handleInspectionChange}
        />

        {/* 2. Processing Activity Terminal */}
        <ActivityTerminal job={activeJob} isProcessing={isProcessing} />

        {/* 4. Optimization Result & TikTok Studio Upload (Revealed on Completion) */}
        {activeJob && activeJob.status === 'completed' && (
          <OptimizationResult
            job={activeJob}
            onDownload={handleDownload}
            isDownloading={isDownloading}
          />
        )}

        {/* 3. TikTok Analyzer */}
        <TikTokAnalyzer />

        {/* 5. Contact Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
