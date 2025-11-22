// Validation Test Suite for Behavioral Engine
// Tests all constraints and edge cases

import { BehavioralEngine, simulateBehavioralAnalysis } from './behavioralEngine';

/**
 * Test Suite 1: Minimum Sample Constraint
 */
export function testMinimumSamples(): { passed: boolean; message: string } {
  const engine = new BehavioralEngine();
  
  // Only process 30 frames (below threshold of 40)
  for (let i = 0; i < 30; i++) {
    engine.processFrame(true, 300);
  }
  
  const result = engine.finalize();
  
  const passed = !result.isValid && 
    result.validationMessage?.includes('Insufficient data');
  
  return {
    passed,
    message: passed 
      ? '✓ Minimum sample constraint working' 
      : '✗ Failed: Should reject < 40 frames'
  };
}

/**
 * Test Suite 2: Face Detection Constraint
 */
export function testFaceDetectionConstraint(): { passed: boolean; message: string } {
  const engine = new BehavioralEngine();
  
  // Process 50 frames but only 8 with face detected
  for (let i = 0; i < 50; i++) {
    engine.processFrame(i < 8, i < 8 ? 300 : undefined);
  }
  
  const result = engine.finalize();
  
  const passed = !result.isValid && 
    result.validationMessage?.includes('rarely detected');
  
  return {
    passed,
    message: passed 
      ? '✓ Face detection constraint working' 
      : '✗ Failed: Should reject < 10 face detections'
  };
}

/**
 * Test Suite 3: Side Switch Cap
 */
export function testSideSwitchCap(): { passed: boolean; message: string } {
  const engine = new BehavioralEngine();
  
  // Alternate sides 100 times
  for (let i = 0; i < 100; i++) {
    const side = i % 2 === 0 ? 200 : 400;
    engine.processFrame(true, side);
  }
  
  const result = engine.finalize();
  
  const passed = result.scores.attentionShifts <= 40;
  
  return {
    passed,
    message: passed 
      ? `✓ Side switch capped at ${result.scores.attentionShifts}` 
      : `✗ Failed: Switch count ${result.scores.attentionShifts} exceeds 40`
  };
}

/**
 * Test Suite 4: Jitter Detection
 */
export function testJitterDetection(): { passed: boolean; message: string } {
  const engine = new BehavioralEngine();
  
  // Create jittery pattern: 200, 400, 200, 400 (rapid alternation)
  const pattern = [200, 400, 200, 400, 200, 400];
  for (const x of pattern) {
    engine.processFrame(true, x);
  }
  
  const result = engine.finalize();
  
  // Should detect fewer switches due to jitter filtering
  const passed = result.scores.attentionShifts < pattern.length - 1;
  
  return {
    passed,
    message: passed 
      ? '✓ Jitter filtering active' 
      : '✗ Failed: Not filtering rapid jitters'
  };
}

/**
 * Test Suite 5: Engagement Score Calculation
 */
export function testEngagementScore(): { passed: boolean; message: string } {
  const engine = new BehavioralEngine();
  
  // 80 frames total, 64 with face detected
  for (let i = 0; i < 80; i++) {
    engine.processFrame(i < 64, i < 64 ? 300 : undefined);
  }
  
  const result = engine.finalize();
  const expectedScore = 64 / 80;
  const actualScore = result.scores.engagementScore;
  
  const passed = Math.abs(actualScore - expectedScore) < 0.01;
  
  return {
    passed,
    message: passed 
      ? `✓ Engagement score correct: ${actualScore.toFixed(2)}` 
      : `✗ Failed: Expected ${expectedScore}, got ${actualScore}`
  };
}

/**
 * Test Suite 6: Preference Calculation
 */
export function testPreferenceCalculation(): { passed: boolean; message: string } {
  const engine = new BehavioralEngine(640);
  
  // 100 frames: 75 on left (social), 25 on right (geometric)
  for (let i = 0; i < 100; i++) {
    const x = i < 75 ? 200 : 400;
    engine.processFrame(true, x);
  }
  
  const result = engine.finalize();
  
  const passed = 
    result.scores.socialPreference > 0.7 &&
    result.scores.dominantFocus === 'social';
  
  return {
    passed,
    message: passed 
      ? `✓ Preference calculation correct: ${(result.scores.socialPreference * 100).toFixed(0)}% social` 
      : '✗ Failed: Preference not calculated correctly'
  };
}

/**
 * Test Suite 7: Interpretation Generation
 */
export function testInterpretationGeneration(): { passed: boolean; message: string } {
  const result = simulateBehavioralAnalysis(60);
  
  const interpretation = result.interpretation;
  
  // Check for forbidden words
  const forbiddenWords = ['autism', 'disorder', 'clinical', 'diagnosis', 'severe', 'moderate', 'mild'];
  const hasForbiddenWords = forbiddenWords.some(word => 
    interpretation.toLowerCase().includes(word)
  );
  
  // Check for required elements
  const hasRequiredElements = 
    interpretation.includes('demo') &&
    interpretation.includes('not a diagnostic tool') &&
    interpretation.includes('professional');
  
  const passed = !hasForbiddenWords && hasRequiredElements;
  
  return {
    passed,
    message: passed 
      ? '✓ Interpretation follows language constraints' 
      : '✗ Failed: Interpretation violates language rules'
  };
}

/**
 * Test Suite 8: Duration Tracking
 */
export function testDurationTracking(): { passed: boolean; message: string } {
  const engine = new BehavioralEngine();
  
  // Simulate frames over time
  for (let i = 0; i < 60; i++) {
    engine.processFrame(true, 300);
  }
  
  const result = engine.finalize();
  
  const passed = result.metrics.durationSec > 0;
  
  return {
    passed,
    message: passed 
      ? `✓ Duration tracked: ${result.metrics.durationSec.toFixed(2)}s` 
      : '✗ Failed: Duration not tracked'
  };
}

/**
 * Run all tests
 */
export function runAllTests(): void {
  console.log('🧪 Running Behavioral Engine Test Suite...\n');
  
  const tests = [
    testMinimumSamples,
    testFaceDetectionConstraint,
    testSideSwitchCap,
    testJitterDetection,
    testEngagementScore,
    testPreferenceCalculation,
    testInterpretationGeneration,
    testDurationTracking
  ];
  
  const results = tests.map(test => test());
  const passedCount = results.filter(r => r.passed).length;
  
  results.forEach(result => {
    console.log(result.message);
  });
  
  console.log(`\n📊 Results: ${passedCount}/${results.length} tests passed`);
  
  if (passedCount === results.length) {
    console.log('✅ All tests passed! Engine is ready.');
  } else {
    console.log('❌ Some tests failed. Review implementation.');
  }
}
