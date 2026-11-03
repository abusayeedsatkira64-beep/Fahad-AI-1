import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  executeFahadMethodPipeline,
  runFFprobeInspection,
  jobsStore,
  jobListeners,
} from './server/videoEngine.js';
import {
  ensureSpecificSamplePresetExists,
  SAMPLE_PRESETS,
} from './server/samplesManager.js';
import {
  analyzeTikTokUrl,
  SAMPLE_TIKTOK_URLS,
} from './server/tiktokAnalyzer.js';
import { OptimizationJob } from './src/types/optimizer.js';

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const portArg = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : NaN;
const PORT = !isNaN(portArg) ? portArg : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

const hostArgIndex = process.argv.indexOf('--host');
const hostArg = hostArgIndex !== -1 ? process.argv[hostArgIndex + 1] : undefined;
const HOST = hostArg || '0.0.0.0';

// Directories
const BASE_STORAGE_DIR = '/tmp/fahad_method';
const UPLOADS_DIR = path.join(BASE_STORAGE_DIR, 'uploads');
const OPTIMIZED_DIR = path.join(BASE_STORAGE_DIR, 'optimized');
const SAMPLES_DIR = path.join(BASE_STORAGE_DIR, 'samples');

[BASE_STORAGE_DIR, UPLOADS_DIR, OPTIMIZED_DIR, SAMPLES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Clean up files older than 30 minutes
function cleanupOldFiles() {
  const cutoff = Date.now() - 30 * 60 * 1000;
  [UPLOADS_DIR, OPTIMIZED_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (e) {
      console.error('File cleanup error:', e);
    }
  });
}
setInterval(cleanupOldFiles, 10 * 60 * 1000);

// Multer storage for up to 1GB uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const uniqueName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1 GB maximum upload
  },
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'FAHAD METHOD',
    engine: 'Lossless Haze MP4 Container Optimizer',
  });
});

// API: Pre-loaded Sample Presets
app.get('/api/samples', (_req: Request, res: Response) => {
  res.json({
    presets: SAMPLE_PRESETS,
    sampleTikTokUrls: SAMPLE_TIKTOK_URLS,
  });
});

// API: Select a Sample Preset
app.post('/api/samples/select', async (req: Request, res: Response) => {
  try {
    const { presetId } = req.body;
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) {
      return res.status(400).json({ error: 'Unknown sample preset ID' });
    }

    const sampleFilePath = await ensureSpecificSamplePresetExists(presetId, SAMPLES_DIR);
    const inspection = await runFFprobeInspection(sampleFilePath);

    res.json({
      success: true,
      filePath: sampleFilePath,
      inspection,
    });
  } catch (err: any) {
    console.error('Error selecting sample preset:', err);
    res.status(500).json({ error: err.message || 'Failed to inspect sample video' });
  }
});

// API: Upload video & inspect (Direct small files)
app.post('/api/upload', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const uploadedPath = req.file.path;
    const inspection = await runFFprobeInspection(uploadedPath);

    res.json({
      success: true,
      filePath: uploadedPath,
      originalFilename: req.file.originalname,
      inspection,
    });
  } catch (err: any) {
    console.error('Error handling upload:', err);
    res.status(500).json({ error: err.message || 'Failed to inspect uploaded video' });
  }
});

// API: Chunked video upload (Supports up to 1GB without hitting 32MB gateway limits)
const chunkUpload = multer({
  dest: path.join(UPLOADS_DIR, 'chunks'),
  limits: { fileSize: 30 * 1024 * 1024 },
});

app.post('/api/upload/chunk', chunkUpload.single('chunk'), async (req: Request, res: Response) => {
  try {
    const { uploadId, chunkIndex, totalChunks, filename } = req.body;
    if (!req.file || !uploadId || chunkIndex === undefined || !totalChunks) {
      return res.status(400).json({ error: 'Missing chunk upload metadata' });
    }

    const cIdx = parseInt(chunkIndex, 10);
    const tChunks = parseInt(totalChunks, 10);
    const chunkDir = path.join(UPLOADS_DIR, `chunks_${uploadId}`);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const chunkTarget = path.join(chunkDir, `part_${cIdx}`);
    try {
      fs.copyFileSync(req.file.path, chunkTarget);
      fs.unlinkSync(req.file.path);
    } catch (_) {
      fs.renameSync(req.file.path, chunkTarget);
    }

    const parts = fs.readdirSync(chunkDir).filter((f) => f.startsWith('part_'));
    if (parts.length === tChunks) {
      const ext = path.extname(filename || 'video.mp4') || '.mp4';
      const cleanBase = path.basename(filename || 'video', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const finalFileName = `upload_${Date.now()}_${cleanBase}${ext}`;
      const finalFilePath = path.join(UPLOADS_DIR, finalFileName);
      const writeStream = fs.createWriteStream(finalFilePath);

      for (let i = 0; i < tChunks; i++) {
        const partPath = path.join(chunkDir, `part_${i}`);
        if (!fs.existsSync(partPath)) {
          throw new Error(`Missing chunk part ${i}`);
        }
        const data = fs.readFileSync(partPath);
        writeStream.write(data);
      }
      writeStream.end();

      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (e) => reject(e));
      });

      try {
        fs.rmSync(chunkDir, { recursive: true, force: true });
      } catch (_) {}

      const inspection = await runFFprobeInspection(finalFilePath);

      return res.json({
        success: true,
        filePath: finalFilePath,
        originalFilename: filename,
        inspection,
      });
    }

    res.json({
      success: true,
      chunkReceived: cIdx,
      totalChunks: tChunks,
    });
  } catch (err: any) {
    console.error('Error handling chunk upload:', err);
    res.status(500).json({ error: err.message || 'Chunk upload failed' });
  }
});

// API: Start optimization pipeline
app.post('/api/optimize', async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Valid video file path required' });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const originalExt = path.extname(filePath);
    const originalBase = path.basename(filePath, originalExt);
    const outputFilename = `FAHAD_METHOD_${originalBase}.mp4`;
    const outputPath = path.join(OPTIMIZED_DIR, outputFilename);

    const initialInspection = await runFFprobeInspection(filePath);

    const newJob: OptimizationJob = {
      jobId,
      createdAt: new Date().toISOString(),
      stage: 0,
      totalStages: 12,
      status: 'inspecting',
      originalSpecs: initialInspection,
      optimizedSpecs: null,
      verification: null,
      logs: [],
    };

    jobsStore.set(jobId, newJob);

    // Run pipeline asynchronously
    executeFahadMethodPipeline(jobId, filePath, outputPath).catch((e) => {
      console.error(`Job ${jobId} failed:`, e);
    });

    res.json({
      success: true,
      jobId,
      job: newJob,
    });
  } catch (err: any) {
    console.error('Error initiating optimization:', err);
    res.status(500).json({ error: err.message || 'Failed to start optimization' });
  }
});

// API: Stream logs via Server-Sent Events (SSE)
app.get('/api/optimize/stream/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = jobsStore.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send current state and all accumulated logs immediately
  res.write(`data: ${JSON.stringify({ type: 'init', job })}\n\n`);

  if (!jobListeners.has(jobId)) {
    jobListeners.set(jobId, new Set());
  }

  const listener = (event: any) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  jobListeners.get(jobId)!.add(listener);

  // Keep-alive ping to prevent intermediary reverse-proxy disconnects
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 10000);

  req.on('close', () => {
    clearInterval(keepAlive);
    const set = jobListeners.get(jobId);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        jobListeners.delete(jobId);
      }
    }
  });
});

// API: Get job status
app.get('/api/jobs/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = jobsStore.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// API: Download optimized video
app.get('/api/download/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = jobsStore.get(jobId);

  if (!job || job.status !== 'completed' || !job.optimizedSpecs) {
    return res.status(404).json({ error: 'Optimized file not available yet.' });
  }

  const optimizedFilename = job.optimizedSpecs.filename;
  const filePath = path.join(OPTIMIZED_DIR, optimizedFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Optimized file expired or missing.' });
  }

  const stat = fs.statSync(filePath);
  const rawBase = path.basename(job.originalSpecs?.filename || 'video', path.extname(job.originalSpecs?.filename || ''));
  const cleanBase = rawBase.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const downloadName = `FAHAD_METHOD_${cleanBase}.mp4`;

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');

  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    console.error('Download stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream video file' });
    }
  });
  stream.pipe(res);
});

// API: TikTok Video Analyzer
app.post('/api/tiktok-analyze', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'TikTok URL is required' });
    }

    const result = await analyzeTikTokUrl(url);
    res.json(result);
  } catch (err: any) {
    console.error('Error analyzing TikTok video:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});
// Explicit API error handler (prevents any error or fallthrough to Vite HTML)
app.use('/api', (err: any, _req: Request, res: Response, next: any) => {
  console.error('[API ERROR]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'API request failed',
    code: err.code,
  });
});

// Explicit 404 handler for any unhandled /api/* route
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// Bootstrapping and server startup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Guard: Vite middlewares must never process /api requests
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: `API endpoint not found: ${req.path}` });
      }
      vite.middlewares(req, res, next);
    });
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`\n  VITE v8.3.0  ready in 120 ms\n\n  ➜  Local:   http://localhost:${PORT}/\n  ➜  Network: http://${HOST}:${PORT}/\n`);
    console.log(`[FAHAD METHOD] Engine online at http://${HOST}:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('Fatal startup error:', e);
});
