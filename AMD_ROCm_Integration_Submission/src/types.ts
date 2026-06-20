/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemMetrics {
  gpuUsage: number;
  gpuTemp: number;
  vramUsed: number; // in MB
  vramTotal: number; // in MB
  inferenceSpeedMs: number;
  queueSize: number;
  activeStreams: number;
  cpuUsage: number;
  ramUsage: number; // in GB
}

export type StudentActivity = 'Writing Notes' | 'Raising Hand' | 'Sleeping' | 'Using Phone' | 'Participating' | 'Listening';
export type StudentEmotion = 'Interested' | 'Confused' | 'Neutral' | 'Bored' | 'Happy' | 'Frustrated';
export type AttentionState = 'Looking at Board' | 'Looking at Teacher' | 'Looking Down' | 'Looking Away';

export interface Student {
  id: string;
  name: string;
  row: number;
  col: number;
  attendanceStatus: 'Present' | 'Absent';
  box: { x: number; y: number; w: number; h: number }; // Relative percentage coordinates on stream
  gazeVector: { x: number; y: number; z: number };
  attention: AttentionState;
  attentionScore: number; // 0 - 100
  emotion: StudentEmotion;
  emotionScore: number;
  activity: StudentActivity;
  activityScore: number;
  engagementScore: number; // 0 - 100
  lastUpdated: string;
}

export interface LiveFrame {
  timestamp: string;
  sessionId: string;
  classroomEngagement: number; // average
  classroomAttention: number; // average
  activeHandRaises: number;
  confusedCount: number;
  students: Student[];
}

export interface ConfusionEvent {
  id: string;
  timestamp: string;
  topic: string;
  confusionLevel: number; // 0 - 100
  studentsAffected: number;
  recommendation: string;
}

export interface DriftPrediction {
  timestamp: string;
  predictedDropPercent: number;
  predictedEngagementIn5Min: number;
  confidenceScore: number; // 0.85
  driftReason: string;
}

export interface SessionConfig {
  id: string;
  name: string;
  classroomName: string;
  subject: string;
  topic: string;
  startTime: string;
  endTime?: string;
  isRunning: boolean;
}

export interface CameraConfig {
  id: string;
  name: string;
  url: string;
  fps: number;
  resolution: string;
  status: 'Online' | 'Offline' | 'Connecting';
  gpuId: number;
}
