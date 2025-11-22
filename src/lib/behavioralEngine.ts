// NeuroLens Behavioral Logic Engine
// Educational prototype for observable behavioral pattern analysis
// NOT a medical or diagnostic tool

export interface RawMetrics {
  totalFrames: number;
  framesFaceDetected: number;
  framesSocialSide: number;
  framesGeometricSide: number;
  sideSwitchCount: number;
  startTime: number;
  endTime: number;
  durationSec: number;
}

export interface ComputedScores {
  engagementScore: number;
  socialPreference: number;
  geometricPreference: number;
  attentionShifts: number;
  dominantFocus: 'geometric' | 'social' | 'mixed';
  engagementLevel: 'high' | 'moderate' | 'low';
  attentionFlexibility: 'flexible' | 'moderate' | 'low';
}

export interface BehavioralAnalysisResult {
  metrics: RawMetrics;
  scores: ComputedScores;
  interpretation: string;
  isValid: boolean;
  validationMessage?: string;
}

export class BehavioralEngine {
  private metrics: RawMetrics;
  private lastSide: 'social' | 'geometric' | null = null;
  private consecutiveMissingFrames = 0;
  private rapidSwitchBuffer: ('social' | 'geometric')[] = [];
  private videoWidth: number;

  constructor(videoWidth: number = 640) {
    this.videoWidth = videoWidth;
    this.metrics = {
      totalFrames: 0,
      framesFaceDetected: 0,
      framesSocialSide: 0,
      framesGeometricSide: 0,
      sideSwitchCount: 0,
      startTime: Date.now(),
      endTime: 0,
      durationSec: 0
    };
  }

  /**
   * Process a single observation frame (called every 200-300ms)
   */
  processFrame(faceDetected: boolean, faceCenterX?: number): void {
    this.metrics.totalFrames++;

    if (!faceDetected || faceCenterX === undefined) {
      this.consecutiveMissingFrames++;
      return;
    }

    // Face detected
    this.metrics.framesFaceDetected++;
    this.consecutiveMissingFrames = 0;

    // Determine which side the face is on
    const currentSide: 'social' | 'geometric' = 
      faceCenterX < this.videoWidth / 2 ? 'social' : 'geometric';

    // Update side counters
    if (currentSide === 'social') {
      this.metrics.framesSocialSide++;
    } else {
      this.metrics.framesGeometricSide++;
    }

    // Track attention shifts with constraints
    this.trackAttentionShift(currentSide);
  }

  /**
   * Track attention shifts with anti-jitter logic
   */
  private trackAttentionShift(currentSide: 'social' | 'geometric'): void {
    // Add to buffer for jitter detection
    this.rapidSwitchBuffer.push(currentSide);
    if (this.rapidSwitchBuffer.length > 3) {
      this.rapidSwitchBuffer.shift();
    }

    // Only count as real switch if:
    // 1. Last side was set
    // 2. Current side is different
    // 3. Not during rapid jitter period
    // 4. Not during face missing period
    if (this.lastSide && 
        currentSide !== this.lastSide && 
        this.consecutiveMissingFrames <= 3 &&
        !this.isRapidJitter()) {
      
      this.metrics.sideSwitchCount++;
      
      // Cap at 40 to avoid runaway counts
      if (this.metrics.sideSwitchCount > 40) {
        this.metrics.sideSwitchCount = 40;
      }
    }

    this.lastSide = currentSide;
  }

  /**
   * Detect rapid jittery movements (ignore as real shifts)
   */
  private isRapidJitter(): boolean {
    if (this.rapidSwitchBuffer.length < 3) return false;
    
    // If alternating rapidly within 3 frames, it's jitter
    const [a, b, c] = this.rapidSwitchBuffer.slice(-3);
    return (a !== b && b !== c && a === c);
  }

  /**
   * Finalize the test and compute results
   */
  finalize(): BehavioralAnalysisResult {
    this.metrics.endTime = Date.now();
    this.metrics.durationSec = (this.metrics.endTime - this.metrics.startTime) / 1000;

    // Validate data quality
    const validation = this.validateMetrics();
    if (!validation.isValid) {
      return {
        metrics: this.metrics,
        scores: this.getEmptyScores(),
        interpretation: validation.message,
        isValid: false,
        validationMessage: validation.message
      };
    }

    // Compute scores
    const scores = this.computeScores();

    // Generate interpretation
    const interpretation = this.generateInterpretation(scores);

    return {
      metrics: this.metrics,
      scores,
      interpretation,
      isValid: true
    };
  }

  /**
   * Validate metrics meet minimum requirements
   */
  private validateMetrics(): { isValid: boolean; message: string } {
    // Minimum samples required
    if (this.metrics.totalFrames < 40) {
      return {
        isValid: false,
        message: 'Insufficient data collected. Please ensure the participant stays within camera frame and retry the demo.'
      };
    }

    // Face rarely detected
    if (this.metrics.framesFaceDetected < 10) {
      return {
        isValid: false,
        message: 'Face was rarely detected during the demo. Please ensure good lighting and stay within the camera frame.'
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Compute behavioral scores from raw metrics
   */
  private computeScores(): ComputedScores {
    const { totalFrames, framesFaceDetected, framesSocialSide, framesGeometricSide, sideSwitchCount } = this.metrics;

    // Engagement Score (0.0 - 1.0)
    const engagementScore = framesFaceDetected / totalFrames;

    // Visual Preference Scores (0.0 - 1.0)
    const socialPreference = framesFaceDetected > 0 
      ? framesSocialSide / framesFaceDetected 
      : 0;
    const geometricPreference = framesFaceDetected > 0 
      ? framesGeometricSide / framesFaceDetected 
      : 0;

    // Attention Shifts (raw count)
    const attentionShifts = sideSwitchCount;

    // Dominant Visual Focus
    let dominantFocus: 'geometric' | 'social' | 'mixed';
    if (geometricPreference > 0.7) {
      dominantFocus = 'geometric';
    } else if (socialPreference > 0.7) {
      dominantFocus = 'social';
    } else {
      dominantFocus = 'mixed';
    }

    // Engagement Classification
    let engagementLevel: 'high' | 'moderate' | 'low';
    if (engagementScore > 0.8) {
      engagementLevel = 'high';
    } else if (engagementScore > 0.5) {
      engagementLevel = 'moderate';
    } else {
      engagementLevel = 'low';
    }

    // Attention Flexibility
    let attentionFlexibility: 'flexible' | 'moderate' | 'low';
    if (attentionShifts >= 5) {
      attentionFlexibility = 'flexible';
    } else if (attentionShifts >= 2) {
      attentionFlexibility = 'moderate';
    } else {
      attentionFlexibility = 'low';
    }

    return {
      engagementScore,
      socialPreference,
      geometricPreference,
      attentionShifts,
      dominantFocus,
      engagementLevel,
      attentionFlexibility
    };
  }

  /**
   * Generate neutral interpretation summary
   */
  private generateInterpretation(scores: ComputedScores): string {
    let summary = '';

    // A. Preference Patterns
    if (scores.geometricPreference > 0.7) {
      summary += 'In this demo, the participant looked more at geometric visual patterns compared to social visuals. ';
    } else if (scores.socialPreference > 0.7) {
      summary += 'In this demo, the participant showed more focus on social visual content compared to geometric patterns. ';
    } else {
      summary += 'The participant showed a balanced interest between social and geometric visuals. ';
    }

    // B. Engagement Interpretation
    if (scores.engagementScore > 0.8) {
      summary += 'Engagement level was consistently high throughout the demo. ';
    } else if (scores.engagementScore > 0.5) {
      summary += 'Engagement level was moderate with occasional periods of disengagement. ';
    } else {
      summary += 'Engagement was relatively low, with several periods where the participant was not detected in the camera frame. ';
    }

    // C. Attention Shifting Interpretation
    if (scores.attentionShifts >= 5) {
      summary += 'Frequent visual shifts were observed between the two types of content. ';
    } else if (scores.attentionShifts >= 2) {
      summary += 'Some natural shifting of visual attention was observed. ';
    } else {
      summary += 'Very few attention shifts were observed during the demo. ';
    }

    // D. Final Neutral Summary Line
    summary += 'This demo reflects only momentary behavior during a short session and is not a diagnostic tool. For real behavioral concerns, consult a qualified professional.';

    return summary;
  }

  /**
   * Get empty scores for invalid results
   */
  private getEmptyScores(): ComputedScores {
    return {
      engagementScore: 0,
      socialPreference: 0,
      geometricPreference: 0,
      attentionShifts: 0,
      dominantFocus: 'mixed',
      engagementLevel: 'low',
      attentionFlexibility: 'low'
    };
  }

  /**
   * Reset engine for new test
   */
  reset(): void {
    this.metrics = {
      totalFrames: 0,
      framesFaceDetected: 0,
      framesSocialSide: 0,
      framesGeometricSide: 0,
      sideSwitchCount: 0,
      startTime: Date.now(),
      endTime: 0,
      durationSec: 0
    };
    this.lastSide = null;
    this.consecutiveMissingFrames = 0;
    this.rapidSwitchBuffer = [];
  }

  /**
   * Get current metrics (for real-time display)
   */
  getCurrentMetrics(): RawMetrics {
    return { ...this.metrics };
  }
}

/**
 * Utility function to simulate behavioral engine analysis
 * This simulates what the real engine would produce
 */
export function simulateBehavioralAnalysis(durationSec: number = 60): BehavioralAnalysisResult {
  const engine = new BehavioralEngine();

  // Simulate realistic behavioral patterns
  const framesPerSec = 4; // ~250ms per frame
  const totalFrames = Math.floor(durationSec * framesPerSec);
  
  // Random but realistic distribution
  const engagementRate = 0.7 + Math.random() * 0.25; // 70-95%
  const socialPreferenceBase = Math.random(); // 0-1
  
  for (let i = 0; i < totalFrames; i++) {
    const faceDetected = Math.random() < engagementRate;
    const faceCenterX = faceDetected 
      ? (socialPreferenceBase > 0.5 ? 200 + Math.random() * 120 : 400 + Math.random() * 120)
      : undefined;
    
    engine.processFrame(faceDetected, faceCenterX);
  }

  return engine.finalize();
}
