// Constraint Tracking System
// Tracks all testing constraints and generates compliance reports

export interface ConstraintCheck {
  id: string;
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  actualValue?: number | string;
  expectedValue?: string;
  message: string;
}

export interface ConstraintReport {
  testTimestamp: number;
  totalConstraints: number;
  passedConstraints: number;
  failedConstraints: number;
  warningConstraints: number;
  checks: ConstraintCheck[];
  overallStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  summary: string;
}

export class ConstraintTracker {
  private checks: ConstraintCheck[] = [];

  /**
   * Check: Test Duration
   */
  checkDuration(actualDuration: number, targetDuration: number = 60): void {
    const tolerance = 5; // ±5 seconds
    const diff = Math.abs(actualDuration - targetDuration);
    
    if (diff <= tolerance) {
      this.checks.push({
        id: 'DURATION',
        name: 'Test Duration',
        description: 'Test must run for fixed duration (60s)',
        status: 'PASS',
        actualValue: actualDuration.toFixed(1),
        expectedValue: `${targetDuration}s ±${tolerance}s`,
        message: `Test duration was ${actualDuration.toFixed(1)}s (within tolerance)`
      });
    } else {
      this.checks.push({
        id: 'DURATION',
        name: 'Test Duration',
        description: 'Test must run for fixed duration (60s)',
        status: 'WARNING',
        actualValue: actualDuration.toFixed(1),
        expectedValue: `${targetDuration}s ±${tolerance}s`,
        message: `Test duration ${actualDuration.toFixed(1)}s outside tolerance range`
      });
    }
  }

  /**
   * Check: Minimum Samples
   */
  checkMinimumSamples(totalFrames: number, minimum: number = 40): void {
    if (totalFrames >= minimum) {
      this.checks.push({
        id: 'MIN_SAMPLES',
        name: 'Minimum Samples',
        description: 'At least 40 observation frames required',
        status: 'PASS',
        actualValue: totalFrames,
        expectedValue: `≥ ${minimum}`,
        message: `${totalFrames} frames collected (sufficient)`
      });
    } else {
      this.checks.push({
        id: 'MIN_SAMPLES',
        name: 'Minimum Samples',
        description: 'At least 40 observation frames required',
        status: 'FAIL',
        actualValue: totalFrames,
        expectedValue: `≥ ${minimum}`,
        message: `Only ${totalFrames} frames collected (insufficient data)`
      });
    }
  }

  /**
   * Check: Face Detection Rate
   */
  checkFaceDetection(framesFaceDetected: number, totalFrames: number, minimum: number = 10): void {
    const detectionRate = totalFrames > 0 ? (framesFaceDetected / totalFrames) * 100 : 0;
    
    if (framesFaceDetected >= minimum) {
      this.checks.push({
        id: 'FACE_DETECTION',
        name: 'Face Detection',
        description: 'Face must be detected in at least 10 frames',
        status: 'PASS',
        actualValue: `${framesFaceDetected} (${detectionRate.toFixed(0)}%)`,
        expectedValue: `≥ ${minimum} frames`,
        message: `Face detected in ${framesFaceDetected} frames (${detectionRate.toFixed(0)}% rate)`
      });
    } else {
      this.checks.push({
        id: 'FACE_DETECTION',
        name: 'Face Detection',
        description: 'Face must be detected in at least 10 frames',
        status: 'FAIL',
        actualValue: `${framesFaceDetected} (${detectionRate.toFixed(0)}%)`,
        expectedValue: `≥ ${minimum} frames`,
        message: `Face rarely detected (only ${framesFaceDetected} frames)`
      });
    }
  }

  /**
   * Check: Attention Switch Cap
   */
  checkAttentionSwitchCap(switchCount: number, maxAllowed: number = 40): void {
    if (switchCount <= maxAllowed) {
      this.checks.push({
        id: 'SWITCH_CAP',
        name: 'Attention Switch Cap',
        description: 'Side switches capped at 40 to prevent runaway counts',
        status: 'PASS',
        actualValue: switchCount,
        expectedValue: `≤ ${maxAllowed}`,
        message: `${switchCount} attention shifts (within cap)`
      });
    } else {
      this.checks.push({
        id: 'SWITCH_CAP',
        name: 'Attention Switch Cap',
        description: 'Side switches capped at 40 to prevent runaway counts',
        status: 'FAIL',
        actualValue: switchCount,
        expectedValue: `≤ ${maxAllowed}`,
        message: `Switch count ${switchCount} exceeds maximum allowed`
      });
    }
  }

  /**
   * Check: Jitter Filtering
   */
  checkJitterFiltering(wasFiltered: boolean): void {
    this.checks.push({
      id: 'JITTER_FILTER',
      name: 'Jitter Filtering',
      description: 'Rapid jittery detections should be ignored',
      status: wasFiltered ? 'PASS' : 'WARNING',
      actualValue: wasFiltered ? 'Active' : 'Not triggered',
      expectedValue: 'Active when needed',
      message: wasFiltered 
        ? 'Jitter filtering was applied to remove noise'
        : 'No rapid jitters detected (filtering not needed)'
    });
  }

  /**
   * Check: Engagement Threshold
   */
  checkEngagementThreshold(engagementScore: number, minThreshold: number = 0.25): void {
    if (engagementScore >= minThreshold) {
      this.checks.push({
        id: 'ENGAGEMENT',
        name: 'Engagement Threshold',
        description: 'Participant must show minimum engagement',
        status: 'PASS',
        actualValue: `${(engagementScore * 100).toFixed(0)}%`,
        expectedValue: `≥ ${(minThreshold * 100).toFixed(0)}%`,
        message: `Engagement score ${(engagementScore * 100).toFixed(0)}% meets minimum`
      });
    } else {
      this.checks.push({
        id: 'ENGAGEMENT',
        name: 'Engagement Threshold',
        description: 'Participant must show minimum engagement',
        status: 'WARNING',
        actualValue: `${(engagementScore * 100).toFixed(0)}%`,
        expectedValue: `≥ ${(minThreshold * 100).toFixed(0)}%`,
        message: `Low engagement (${(engagementScore * 100).toFixed(0)}%) may affect reliability`
      });
    }
  }

  /**
   * Check: Data Quality
   */
  checkDataQuality(metrics: {
    framesFaceDetected: number;
    totalFrames: number;
    sideSwitchCount: number;
  }): void {
    const detectionRate = metrics.totalFrames > 0 
      ? metrics.framesFaceDetected / metrics.totalFrames 
      : 0;
    
    const switchRate = metrics.framesFaceDetected > 0
      ? metrics.sideSwitchCount / metrics.framesFaceDetected
      : 0;
    
    // Good quality: high detection rate, reasonable switch rate
    const isGoodQuality = detectionRate >= 0.5 && switchRate < 0.5;
    
    if (isGoodQuality) {
      this.checks.push({
        id: 'DATA_QUALITY',
        name: 'Overall Data Quality',
        description: 'Data must be reliable for analysis',
        status: 'PASS',
        actualValue: 'High quality',
        expectedValue: 'Sufficient for analysis',
        message: 'Data quality is sufficient for behavioral analysis'
      });
    } else {
      this.checks.push({
        id: 'DATA_QUALITY',
        name: 'Overall Data Quality',
        description: 'Data must be reliable for analysis',
        status: 'WARNING',
        actualValue: 'Marginal quality',
        expectedValue: 'Sufficient for analysis',
        message: 'Data quality is marginal - results may be less reliable'
      });
    }
  }

  /**
   * Generate final report
   */
  generateReport(): ConstraintReport {
    const passed = this.checks.filter(c => c.status === 'PASS').length;
    const failed = this.checks.filter(c => c.status === 'FAIL').length;
    const warnings = this.checks.filter(c => c.status === 'WARNING').length;
    
    let overallStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
    let summary: string;
    
    if (failed === 0 && warnings === 0) {
      overallStatus = 'COMPLIANT';
      summary = 'All testing constraints met. Data is valid and reliable.';
    } else if (failed === 0) {
      overallStatus = 'PARTIAL';
      summary = `${warnings} warning(s) present. Data is usable but may have quality concerns.`;
    } else {
      overallStatus = 'NON_COMPLIANT';
      summary = `${failed} critical constraint(s) failed. Data may not be reliable.`;
    }
    
    return {
      testTimestamp: Date.now(),
      totalConstraints: this.checks.length,
      passedConstraints: passed,
      failedConstraints: failed,
      warningConstraints: warnings,
      checks: this.checks,
      overallStatus,
      summary
    };
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.checks = [];
  }
}

/**
 * Utility: Generate human-readable constraint report
 */
export function formatConstraintReport(report: ConstraintReport): string {
  let output = '=== CONSTRAINT TRACKING REPORT ===\n\n';
  output += `Timestamp: ${new Date(report.testTimestamp).toLocaleString()}\n`;
  output += `Overall Status: ${report.overallStatus}\n`;
  output += `Summary: ${report.summary}\n\n`;
  
  output += `Results: ${report.passedConstraints}/${report.totalConstraints} PASSED`;
  if (report.warningConstraints > 0) {
    output += `, ${report.warningConstraints} WARNING(S)`;
  }
  if (report.failedConstraints > 0) {
    output += `, ${report.failedConstraints} FAILED`;
  }
  output += '\n\n';
  
  output += 'Detailed Checks:\n';
  output += '─'.repeat(60) + '\n';
  
  report.checks.forEach(check => {
    const icon = check.status === 'PASS' ? '✓' : 
                 check.status === 'WARNING' ? '⚠' : '✗';
    
    output += `${icon} [${check.status}] ${check.name}\n`;
    output += `  Expected: ${check.expectedValue}\n`;
    output += `  Actual: ${check.actualValue}\n`;
    output += `  ${check.message}\n\n`;
  });
  
  return output;
}
