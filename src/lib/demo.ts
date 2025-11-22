/**
 * Behavioral Engine Demo Script
 * Demonstrates the full logic engine in action
 */

import { BehavioralEngine, simulateBehavioralAnalysis } from './behavioralEngine';
import { ConstraintTracker, formatConstraintReport } from './constraintTracker';

console.log('🧠 NeuroLens Behavioral Engine Demo\n');
console.log('═'.repeat(60));

// Demo 1: Typical High-Engagement Session
console.log('\n📊 DEMO 1: High Engagement Session\n');

const engine1 = new BehavioralEngine(640);

// Simulate 60 seconds at 4fps (240 frames)
for (let i = 0; i < 240; i++) {
  // 90% face detection rate
  const faceDetected = Math.random() < 0.9;
  // Balanced social/geometric preference
  const centerX = faceDetected ? (Math.random() < 0.55 ? 250 : 450) : undefined;
  engine1.processFrame(faceDetected, centerX);
}

const result1 = engine1.finalize();

console.log('Metrics:', {
  totalFrames: result1.metrics.totalFrames,
  faceDetected: result1.metrics.framesFaceDetected,
  socialSide: result1.metrics.framesSocialSide,
  geometricSide: result1.metrics.framesGeometricSide,
  attentionShifts: result1.metrics.sideSwitchCount
});

console.log('\nScores:', {
  engagement: `${(result1.scores.engagementScore * 100).toFixed(0)}%`,
  socialPref: `${(result1.scores.socialPreference * 100).toFixed(0)}%`,
  geometricPref: `${(result1.scores.geometricPreference * 100).toFixed(0)}%`,
  dominantFocus: result1.scores.dominantFocus,
  flexibility: result1.scores.attentionFlexibility
});

console.log('\nInterpretation:');
console.log(result1.interpretation);

// Demo 2: Low Engagement Session
console.log('\n\n📊 DEMO 2: Low Engagement Session\n');

const engine2 = new BehavioralEngine(640);

// Simulate poor engagement (only 30% face detection)
for (let i = 0; i < 240; i++) {
  const faceDetected = Math.random() < 0.3;
  const centerX = faceDetected ? 300 : undefined;
  engine2.processFrame(faceDetected, centerX);
}

const result2 = engine2.finalize();

console.log('Valid:', result2.isValid);
if (!result2.isValid) {
  console.log('Validation Message:', result2.validationMessage);
}

// Demo 3: Strong Geometric Preference
console.log('\n\n📊 DEMO 3: Strong Geometric Preference\n');

const engine3 = new BehavioralEngine(640);

// 85% looking at geometric side
for (let i = 0; i < 240; i++) {
  const faceDetected = Math.random() < 0.85;
  const centerX = faceDetected ? (Math.random() < 0.85 ? 500 : 200) : undefined;
  engine3.processFrame(faceDetected, centerX);
}

const result3 = engine3.finalize();

console.log('Dominant Focus:', result3.scores.dominantFocus);
console.log('Geometric Preference:', `${(result3.scores.geometricPreference * 100).toFixed(0)}%`);
console.log('\nInterpretation:');
console.log(result3.interpretation);

// Demo 4: Constraint Tracking
console.log('\n\n📊 DEMO 4: Constraint Tracking Report\n');

const behavioralAnalysis = simulateBehavioralAnalysis(60);
const tracker = new ConstraintTracker();

tracker.checkDuration(behavioralAnalysis.metrics.durationSec, 60);
tracker.checkMinimumSamples(behavioralAnalysis.metrics.totalFrames);
tracker.checkFaceDetection(
  behavioralAnalysis.metrics.framesFaceDetected,
  behavioralAnalysis.metrics.totalFrames
);
tracker.checkAttentionSwitchCap(behavioralAnalysis.metrics.sideSwitchCount);
tracker.checkJitterFiltering(true);
tracker.checkEngagementThreshold(behavioralAnalysis.scores.engagementScore);
tracker.checkDataQuality({
  framesFaceDetected: behavioralAnalysis.metrics.framesFaceDetected,
  totalFrames: behavioralAnalysis.metrics.totalFrames,
  sideSwitchCount: behavioralAnalysis.metrics.sideSwitchCount
});

const report = tracker.generateReport();

console.log(formatConstraintReport(report));

console.log('\n✅ Demo Complete! All systems operational.\n');

export {};
