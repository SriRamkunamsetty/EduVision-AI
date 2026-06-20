/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { Student, SystemMetrics, ConfusionEvent, DriftPrediction, SessionConfig, CameraConfig, LiveFrame, StudentEmotion, StudentActivity, AttentionState } from './src/types.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI on server-side with strict User-Agent headers
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Chat features will fallback helper mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ---------------------------------------------------------
// IN-MEMORY DATA STORE (SIMULATED REAL-TIME ENGINES)
// ---------------------------------------------------------

let currentSession: SessionConfig = {
  id: 'session_8927',
  name: 'Lecture Section A-1',
  classroomName: 'Newton Hall - Room 304',
  subject: 'Deep Learning & Neural Networks',
  topic: 'Backpropagation & Loss Optimization',
  startTime: new Date().toISOString(),
  isRunning: true
};

const initialStudents: string[] = [
  'Liam Johnson', 'Emma Smith', 'Noah Davis', 'Olivia Wilson',
  'William Martinez', 'Sophia Anderson', 'James Taylor', 'Ava Thomas',
  'Benjamin White', 'Isabella Harris', 'Lucas Martin', 'Mia Garcia'
];

let students: Student[] = initialStudents.map((name, index) => {
  const row = Math.floor(index / 4) + 1;
  const col = (index % 4) + 1;
  
  // Custom offset bounding boxes on our 16:9 webcam canvas
  const baseX = 5 + (col - 1) * 23;
  const baseY = 15 + (row - 1) * 28;

  return {
    id: `student_0${index + 1}`,
    name,
    row,
    col,
    attendanceStatus: 'Present',
    box: { x: baseX, y: baseY, w: 18, h: 22 },
    gazeVector: { x: 0, y: 0, z: -1 },
    attention: 'Looking at Board',
    attentionScore: 90,
    emotion: 'Interested',
    emotionScore: 85,
    activity: 'Listening',
    activityScore: 85,
    engagementScore: 88,
    lastUpdated: new Date().toISOString()
  };
});

let systemMetrics: SystemMetrics = {
  gpuUsage: 68,
  gpuTemp: 72,
  vramUsed: 7120, // MB
  vramTotal: 16160, // MB
  inferenceSpeedMs: 14.2,
  queueSize: 0,
  activeStreams: 2,
  cpuUsage: 22,
  ramUsage: 5.6
};

let confusionHistory: ConfusionEvent[] = [
  {
    id: 'conf_1',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    topic: 'Partial Derivatives chain-rule expansion',
    confusionLevel: 68,
    studentsAffected: 6,
    recommendation: 'Pause and perform a live diagrammatic sketch of the derivative flow.'
  },
  {
    id: 'conf_2',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    topic: 'Gradient Descent Landscape analogies',
    confusionLevel: 45,
    studentsAffected: 3,
    recommendation: 'Ask Olivia or Lucas to answer a peer review explanation question.'
  }
];

let camerasList: CameraConfig[] = [
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
];

// ---------------------------------------------------------
// REAL-TIME FLUCTUATION ENGINE (Updates every 1.5 seconds)
// ---------------------------------------------------------

function updateSimulation() {
  if (!currentSession.isRunning) return;

  const topicName = currentSession.topic;

  // Let's cycle emotions / activities dynamically
  students = students.map((std) => {
    // Random fluctuation offsets
    const deltaGaze = (Math.random() - 0.48) * 12;
    const deltaEmotion = (Math.random() - 0.5) * 15;
    const deltaActivity = (Math.random() - 0.52) * 15;

    let attentionScore = Math.max(10, Math.min(100, std.attentionScore + deltaGaze));
    let emotionScore = Math.max(10, Math.min(100, std.emotionScore + deltaEmotion));
    let activityScore = Math.max(10, Math.min(100, std.activityScore + deltaActivity));

    // Dynamic attention states
    let attention: AttentionState = std.attention;
    if (attentionScore > 80) attention = 'Looking at Board';
    else if (attentionScore > 65) attention = 'Looking at Teacher';
    else if (attentionScore > 40) attention = 'Looking Down';
    else attention = 'Looking Away';

    // Dynamic Gaze vectors
    const gX = attention === 'Looking Away' ? (Math.random() * 2 - 1) : 0.1;
    const gY = attention === 'Looking Down' ? 0.8 : -0.1;
    const gZ = attention === 'Looking at Board' ? -1 : -0.5;

    // Dynamic states triggers
    let emotion: StudentEmotion = std.emotion;
    let activity: StudentActivity = std.activity;

    // Trigger state changes based on random factors
    const rol = Math.random();
    if (rol < 0.12) {
      // Hand raise
      activity = 'Raising Hand';
      activityScore = 95;
      emotion = 'Interested';
      emotionScore = 90;
    } else if (rol < 0.20) {
      // Sleeping / Slumping
      activity = 'Sleeping';
      activityScore = 15;
      attentionScore = 10;
      emotion = 'Bored';
      emotionScore = 20;
    } else if (rol < 0.35) {
      // Using phone
      activity = 'Using Phone';
      activityScore = 30;
      attentionScore = 30;
      emotion = 'Neutral';
      emotionScore = 50;
    } else if (rol < 0.50) {
      // Confusion trigger
      emotion = 'Confused';
      emotionScore = 50;
      activity = 'Writing Notes';
      activityScore = 80;
    } else if (rol < 0.70) {
      activity = 'Participating';
      activityScore = 88;
      emotion = 'Happy';
      emotionScore = 85;
    } else if (rol < 0.85) {
      activity = 'Writing Notes';
      activityScore = 85;
      emotion = 'Interested';
    } else {
      activity = 'Listening';
      activityScore = 80;
      emotion = 'Neutral';
    }

    // Engagement custom score calculation:
    // (0.35 * gaze_score + 0.25 * head_pose_score + 0.20 * emotion_score + 0.20 * activity_score)
    // Here: (GazeScore is attentionScore, HeadPose is 100 for Board/Teacher, 50 for Down, 15 for Away)
    let headPoseScore = 100;
    if (attention === 'Looking Down') headPoseScore = 50;
    if (attention === 'Looking Away') headPoseScore = 15;

    const computedEngagement = Math.round(
      0.35 * attentionScore +
      0.25 * headPoseScore +
      0.20 * emotionScore +
      0.20 * activityScore
    );

    return {
      ...std,
      gazeVector: { x: gX, y: gY, z: gZ },
      attention,
      attentionScore: Math.round(attentionScore),
      emotion,
      emotionScore: Math.round(emotionScore),
      activity,
      activityScore: Math.round(activityScore),
      engagementScore: computedEngagement,
      lastUpdated: new Date().toISOString()
    };
  });

  // System metrics fluctuation
  systemMetrics.gpuUsage = Math.round(62 + Math.random() * 12);
  systemMetrics.gpuTemp = Math.round(68 + Math.random() * 6);
  systemMetrics.cpuUsage = Math.round(18 + Math.random() * 9);
  systemMetrics.inferenceSpeedMs = parseFloat((12.5 + Math.random() * 4).toFixed(1));
  systemMetrics.queueSize = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;

  // Track confusion triggers and notify historical alarms
  const confusedCount = students.filter(s => s.emotion === 'Confused').length;
  if (confusedCount >= 4 && Math.random() > 0.7) {
    const isAlreadyPresent = confusionHistory.some(c => 
      c.topic === topicName && (Date.now() - new Date(c.timestamp).getTime()) < 120000
    );
    if (!isAlreadyPresent) {
      confusionHistory.unshift({
        id: `conf_${Date.now()}`,
        timestamp: new Date().toISOString(),
        topic: topicName,
        confusionLevel: Math.round(60 + Math.random() * 30),
        studentsAffected: confusedCount,
        recommendation: `Spike in confusion during lectures on: \"${topicName}\". Break students into pairs for a 2-minute active retention discussion.`
      });
    }
  }

  // Broadcaster
  broadcastEvents();
}

// Start simulation ticker
setInterval(updateSimulation, 2200);

// ---------------------------------------------------------
// SERVER-SENT EVENTS CLIENT MANAGEMENT
// ---------------------------------------------------------

let clients: express.Response[] = [];

function broadcastEvents() {
  const payload = {
    type: 'telemetry_udpate',
    frame: getLatestFrame(),
    metrics: systemMetrics,
    confusion: confusionHistory,
    prediction: getAttentionDrift(),
    session: currentSession
  };

  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
}

function getLatestFrame(): LiveFrame {
  const avgEngage = Math.round(students.reduce((acc, s) => acc + s.engagementScore, 0) / students.length);
  const avgAttent = Math.round(students.reduce((acc, s) => acc + s.attentionScore, 0) / students.length);
  const handRaises = students.filter(s => s.activity === 'Raising Hand').length;
  const confused = students.filter(s => s.emotion === 'Confused').length;

  return {
    timestamp: new Date().toISOString(),
    sessionId: currentSession.id,
    classroomEngagement: avgEngage,
    classroomAttention: avgAttent,
    activeHandRaises: handRaises,
    confusedCount: confused,
    students
  };
}

// Predict attention drift based on current trajectory
function getAttentionDrift(): DriftPrediction {
  const sleepCount = students.filter(s => s.activity === 'Sleeping').length;
  const phoneCount = students.filter(s => s.activity === 'Using Phone').length;
  const confusedCount = students.filter(s => s.emotion === 'Confused').length;

  // Let's calculate hypothetical attention drift in the next 5 minutes
  let predictedDropPercent = 0;
  let reason = "Classroom attention is healthy and trending upward in a positive pattern.";

  if (sleepCount > 1 || phoneCount > 1 || confusedCount > 2) {
    predictedDropPercent = Math.round((sleepCount * 8) + (phoneCount * 6) + (confusedCount * 4));
    predictedDropPercent = Math.min(65, Math.max(5, predictedDropPercent));
    
    if (sleepCount > 0 && phoneCount > 0) {
      reason = `Engagement is likely to drift by -${predictedDropPercent}% in 5m due to active digital distraction (phones) and fatigue (napping) in Rows 2 & 3.`;
    } else if (sleepCount > 0) {
      reason = `Fatigue drift detected (-${predictedDropPercent}%): Multiple students showing indicators of deep microlearning fatigue. Intervention recommended.`;
    } else {
      reason = `Topic-drift alarm (-${predictedDropPercent}%): Rising confusion detected. Content comprehension trajectory heading below baseline.`;
    }
  }

  const avgEngage = Math.round(students.reduce((acc, s) => acc + s.engagementScore, 0) / students.length);

  return {
    timestamp: new Date().toISOString(),
    predictedDropPercent,
    predictedEngagementIn5Min: Math.max(0, avgEngage - predictedDropPercent),
    confidenceScore: 0.88,
    driftReason: reason
  };
}


// ---------------------------------------------------------
// EXPRESS ENDPOINTS (API ROUTES)
// ---------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Real-Time Event Stream
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);
  console.log(`[SSE] Dashboard client connected. Active: ${clients.length}`);

  // Send initial frame instantly
  const initialPayload = {
    type: 'init',
    frame: getLatestFrame(),
    metrics: systemMetrics,
    confusion: confusionHistory,
    prediction: getAttentionDrift(),
    session: currentSession,
    cameras: camerasList
  };
  res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
    console.log(`[SSE] Dashboard client disconnected. Active: ${clients.length}`);
  });
});

// Session control
app.get('/api/session/status', (req, res) => {
  res.json({ session: currentSession, frame: getLatestFrame() });
});

app.post('/api/session/start', (req, res) => {
  const { name, classroomName, subject, topic } = req.body;
  
  currentSession = {
    id: `session_${Math.floor(Math.random() * 10000)}`,
    name: name || 'Neural Net Lecture',
    classroomName: classroomName || 'Newton Hall - Rm 304',
    subject: subject || 'Computer Science',
    topic: topic || 'Backpropagation & Loss Optimization',
    startTime: new Date().toISOString(),
    isRunning: true
  };

  // Reset student states to interested/active
  students = students.map(s => ({
    ...s,
    attentionState: 'Looking at Board',
    attentionScore: 92,
    emotion: 'Interested',
    emotionScore: 88,
    activity: 'Listening',
    activityScore: 85,
    engagementScore: 90
  } as any));

  broadcastEvents();
  res.json({ success: true, message: 'Classroom session started successfully', session: currentSession });
});

app.post('/api/session/stop', (req, res) => {
  currentSession.isRunning = false;
  currentSession.endTime = new Date().toISOString();
  broadcastEvents();
  res.json({ success: true, message: 'Classroom session concluded', session: currentSession });
});

// Retrieve camera states
app.get('/api/cameras', (req, res) => {
  res.json({ cameras: camerasList });
});

// Conclude and update camera configurations
app.post('/api/cameras', (req, res) => {
  const { id, name, url, fps, resolution, gpuId } = req.body;
  if (id) {
    camerasList = camerasList.map(c => c.id === id ? { ...c, name, url, fps, resolution, gpuId } : c);
  } else {
    camerasList.push({
      id: `cam_0${camerasList.length + 1}`,
      name: name || 'New Wide Lens IP Cam',
      url: url || 'rtsp://admin:psw123@192.168.1.150:554/stream1',
      fps: fps || 30,
      resolution: resolution || '1920x1080',
      status: 'Online',
      gpuId: gpuId || 0
    });
  }
  broadcastEvents();
  res.json({ success: true, cameras: camerasList });
});

// Manual event triggers (for demonstrating rapid alerts in preview)
app.post('/api/simulate/handraise', (req, res) => {
  const presentStudents = students.filter(s => s.attendanceStatus === 'Present');
  if (presentStudents.length > 0) {
    const randomStudent = presentStudents[Math.floor(Math.random() * presentStudents.length)];
    students = students.map(s => s.id === randomStudent.id ? {
      ...s,
      activity: 'Raising Hand',
      activityScore: 99,
      attentionScore: 98,
      emotion: 'Interested',
      emotionScore: 95,
      engagementScore: 98
    } : s);
    
    broadcastEvents();
    res.json({ success: true, message: `${randomStudent.name} is raising their hand.` });
  } else {
    res.status(400).json({ error: 'No present students to raise hand' });
  }
});

// Simulating sleeping trigger
app.post('/api/simulate/sleep', (req, res) => {
  const presentStudents = students.filter(s => s.attendanceStatus === 'Present');
  if (presentStudents.length > 0) {
    const randomStudent = presentStudents[Math.floor(Math.random() * presentStudents.length)];
    students = students.map(s => s.id === randomStudent.id ? {
      ...s,
      activity: 'Sleeping',
      activityScore: 10,
      attentionScore: 5,
      emotion: 'Bored',
      emotionScore: 10,
      gazeVector: { x: 0, y: 0.9, z: 0 },
      attention: 'Looking Down',
      engagementScore: 12
    } : s);

    broadcastEvents();
    res.json({ success: true, message: `${randomStudent.name} has fallen asleep.` });
  } else {
    res.status(400).json({ error: 'No student available' });
  }
});

// Trigger a critical confusion event
app.post('/api/simulate/confusion', (req, res) => {
  // Turn 5 students into confused
  const sliceCount = Math.min(5, students.length);
  for (let i = 0; i < sliceCount; i++) {
    students[i] = {
      ...students[i],
      emotion: 'Confused',
      emotionScore: 88,
      attentionState: 'Looking down',
      attentionScore: 55,
      engagementScore: Math.round(students[i].engagementScore * 0.6)
    } as any;
  }

  confusionHistory.unshift({
    id: `conf_${Date.now()}`,
    timestamp: new Date().toISOString(),
    topic: currentSession.topic,
    confusionLevel: 82,
    studentsAffected: sliceCount,
    recommendation: 'Confusion spike detected on: "Derivative Backpropagation Matrix". Consider introducing an interactive flowchart visualizer or slow down execution pace.'
  });

  broadcastEvents();
  res.json({ success: true, message: 'Triggered classroom group confusion event.' });
});

// Download student reports (PDF/CSV/JSON)
app.get('/api/reports/download/:type', (req, res) => {
  const { type } = req.query;
  const isCSV = req.params.type === 'csv';

  if (isCSV) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=classroom_engagement_report.csv');
    
    let csvContent = 'StudentID,StudentName,DeskRow,DeskCol,AttentionScore,EmotionState,ActivityState,EngagementIndicator\n';
    students.forEach((s) => {
      csvContent += `${s.id},"${s.name}",${s.row},${s.col},${s.attentionScore},${s.emotion},${s.activity},${s.engagementScore}\n`;
    });
    return res.send(csvContent);
  } else {
    // Generate simulated print-friendly text report that looks fantastic
    res.setHeader('Content-Type', 'text/plain');
    let report = `==========================================================\n`;
    report += `              EDUVISION AI PLATFORM SESSION REPORT        \n`;
    report += `==========================================================\n`;
    report += `Session ID: ${currentSession.id}\n`;
    report += `Subject: ${currentSession.subject}\n`;
    report += `Lecturer Class: ${currentSession.name}\n`;
    report += `Topic Tracked: ${currentSession.topic}\n`;
    report += `Analytics Timestamp: ${new Date().toLocaleString()}\n`;
    report += `----------------------------------------------------------\n\n`;
    report += `KEY PERFORMANCE INDICATORS (KPIs):\n`;
    
    const avgEngage = Math.round(students.reduce((acc, s) => acc + s.engagementScore, 0) / students.length);
    const avgAtt = Math.round(students.reduce((acc, s) => acc + s.attentionScore, 0) / students.length);
    
    report += `- Class Engagement Average: ${avgEngage}%\n`;
    report += `- Gaze Attention Focus Metric: ${avgAtt}%\n`;
    report += `- Total Students Audited: ${students.length}\n`;
    report += `- Confused Students Log: ${students.filter(s => s.emotion === 'Confused').length}\n\n`;
    
    report += `DETAILED INDIVIDUAL STUDENT ATTENDANCE LOG:\n`;
    report += `----------------------------------------------------------\n`;
    report += `ID       | NAME              | SEATING | METRIC  | ACTIVITY\n`;
    report += `----------------------------------------------------------\n`;
    students.forEach((s) => {
      const namePad = s.name.padEnd(17, ' ');
      report += `${s.id} | ${namePad} | R${s.row} C${s.col}  | ${s.engagementScore}%    | ${s.activity}\n`;
    });
    report += `\n==========================================================\n`;
    return res.send(report);
  }
});


// ---------------------------------------------------------
// CO-PILOT CHAT INTERACTIVE ENDPOINT (GEMINI RAG ENGINE)
// ---------------------------------------------------------

app.post('/api/copilot/chat', async (req, res) => {
  const { messages, userQuery } = req.body;

  if (!userQuery) {
    return res.status(400).json({ error: 'Missing prompt query parameter.' });
  }

  const aiInstance = getGenAI();

  // Create RAG system context containing the exact, living student analytics and metrics
  const activeStudents = students.map(s => (
    `- ${s.name} (ID: ${s.id}): seated in Desk Row ${s.row}, Column ${s.col}. Attention Score: ${s.attentionScore}% (Status: "${s.attention}"). Emotion: "${s.emotion}" (Score: ${s.emotionScore}%). Active Activity: "${s.activity}". Computed Engagement Index: ${s.engagementScore}/100.`
  )).join('\n');

  const driftResult = getAttentionDrift();

  const systemPrompt = `You are "EduVision AI Copilot", an elite pedagogic AI counselor and classroom analytics super-advisor.
Your task is to analyze the following comprehensive, live telemetry data from active classroom video streams and provide profound, actionable, and friendly strategic advice to teachers.

CURRENT CLASSROOM STATUS:
- Active Session: ${currentSession.topic} (${currentSession.subject})
- Classroom: ${currentSession.classroomName}
- Global Class Average Engagement index: ${Math.round(students.reduce((a, s) => a + s.engagementScore, 0) / students.length)}/100
- Active Hand Raises count: ${students.filter(s => s.activity === 'Raising Hand').length}
- Students Exhibiting Confusion: ${students.filter(s => s.emotion === 'Confused').length}
- Students Sleeping: ${students.filter(s => s.activity === 'Sleeping').length}
- Students on Phones: ${students.filter(s => s.activity === 'Using Phone').length}

LIVE PREDICTIVE DEEP INTEL (LSTM Prediction):
- Predicted Engagement drop in next 5 mins: -${driftResult.predictedDropPercent}%
- Model Confidence Score: ${driftResult.confidenceScore * 100}%
- Predictor Drift Context: "${driftResult.driftReason}"

INDIVIDUAL STUDENTS LIVE DATA:
${activeStudents}

HISTORICAL REAL-TIME CONFUSION LOGS:
${JSON.stringify(confusionHistory, null, 2)}

INSTRUCTIONS:
1. Speak transparently, professionally, and warmly.
2. Directly answer the teacher's questions. 
3. Provide concrete student names for intervention. (For example, if Noah or Liam is sleeping or on their phone, call them out by name and suggest a custom pedagogic action!).
4. Avoid placeholders, boilerplate templates, or faking information. Use the numbers and diagnostics supplied to you above.
5. Refer to specific desks / locations (Rows and columns) to help teachers visually locate students.
6. Keep recommendations brief, easy to execute during a busy lesson (such as doing a quick slide recap, calling on a specific student, or starting a 1-minute whiteboard challenge).`;

  try {
    if (aiInstance) {
      // Call the valid Gemini model as per the skill specification
      // We will select '"gemini-3.5-flash"' for standard textual AI Reasoning
      const response = await aiInstance.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          { role: 'user', parts: [{ text: userQuery }] }
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.72,
        }
      });

      const replyText = response.text || "I apologize, I generated an empty report. Please try rephrasing your topic focus.";
      res.json({ success: true, reply: replyText });
    } else {
      // High-quality deterministic fallback in case GEMINI_API_KEY is not defined
      console.log("[GEMINI] Falling back to high-quality heuristic model due to missing API Key");
      let reply = "";
      
      const sleeping = students.filter(s => s.activity === 'Sleeping');
      const confused = students.filter(s => s.emotion === 'Confused');
      const phones = students.filter(s => s.activity === 'Using Phone');

      if (userQuery.toLowerCase().includes('struggling') || userQuery.toLowerCase().includes('who needs help') || userQuery.toLowerCase().includes('intervention')) {
        reply = `Based on current lowattention values, you should check on:
- **${sleeping.map(s => s.name).join(', ') || 'No fatigue triggers'}** who appear to be sleeping or resting in sitting position.
- **${confused.map(s => s.name).join(', ') || 'No confusion markers'}** who are showing high physical confusion indicators.
I recommend walking towards **Row 2/3** and starting an dynamic peer discussion to break up the lecture fatigue.`;
      } else if (userQuery.toLowerCase().includes('confusion') || userQuery.toLowerCase().includes('topic')) {
        reply = `Confusion analysis pinpointed **${confused.length} students** experiencing obstacles on **"${currentSession.topic}"**.
Particularly:
- Emma Smith (showing intense confusion expression)
- James Taylor (gazing away while holding pen)
Recommendation: Break down the current slide formulas into small block components and ask Mia or Benjamin for a retention demonstration.`;
      } else {
        reply = `Hello! I am EduVision AI Copilot. Here's your quick classroom rundown:
- **Class Engagement Index**: ${Math.round(students.reduce((a, s) => a + s.engagementScore, 0) / students.length)}%
- **Fatigue Alarm**: ${sleeping.length} students napping (Row 2).
- **Attention prediction**: ${driftResult.driftReason}
Ask me:
1. *"Which students are struggling?"*
2. *"Who needs active intervention?"*
3. *"Explain the drop in attention prediction."*`;
      }

      res.json({ success: true, reply });
    }
  } catch (err: any) {
    console.error("[GEMINI ERROR]", err);
    res.status(500).json({ success: false, error: err.message || 'Gemini processing failed' });
  }
});


// ---------------------------------------------------------
// VITE DEV SERVER HOOK & PORT BINDING
// ---------------------------------------------------------

async function startServer() {
  // Vite middleware for handling assets beautifully with full hot-reloads
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Standard static dist bundle server
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`[EDUVISION AI SERVER] Active On URL: http://0.0.0.0:${PORT}`);
    console.log(`[INTELLIGENT ENGINES] Simulated YOLO/arcFace stream pipelines online`);
    console.log(`[TELEMETRY ENDPOINTS] Event logs broadcasting active`);
    console.log(`================================================================`);
  });
}

startServer();
