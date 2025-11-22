import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Play, RotateCcw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { BehavioralEngine } from '@/lib/behavioralEngine';
import { ConstraintTracker, formatConstraintReport } from '@/lib/constraintTracker';
import type { BehavioralAnalysisResult } from '@/lib/behavioralEngine';
import type { ConstraintReport } from '@/lib/constraintTracker';

export default function BehavioralDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BehavioralAnalysisResult | null>(null);
  const [constraintReport, setConstraintReport] = useState<ConstraintReport | null>(null);

  const runSimulation = async (scenarioType: 'high' | 'low' | 'geometric' | 'social') => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);
    setConstraintReport(null);

    const engine = new BehavioralEngine(640);
    const totalFrames = 240; // 60 seconds at 4fps
    const frameDelay = 250; // 250ms between frames

    for (let i = 0; i < totalFrames; i++) {
      // Simulate different scenarios
      let faceDetected = false;
      let centerX: number | undefined;

      switch (scenarioType) {
        case 'high':
          // High engagement, balanced preference
          faceDetected = Math.random() < 0.9;
          centerX = faceDetected ? (Math.random() < 0.5 ? 250 : 450) : undefined;
          break;
        case 'low':
          // Low engagement
          faceDetected = Math.random() < 0.3;
          centerX = faceDetected ? 300 : undefined;
          break;
        case 'geometric':
          // Strong geometric preference
          faceDetected = Math.random() < 0.85;
          centerX = faceDetected ? (Math.random() < 0.85 ? 500 : 200) : undefined;
          break;
        case 'social':
          // Strong social preference
          faceDetected = Math.random() < 0.85;
          centerX = faceDetected ? (Math.random() < 0.85 ? 200 : 500) : undefined;
          break;
      }

      engine.processFrame(faceDetected, centerX);

      // Update progress every 10 frames
      if (i % 10 === 0) {
        setProgress((i / totalFrames) * 100);
        await new Promise(resolve => setTimeout(resolve, frameDelay / 10)); // Speed up for demo
      }
    }

    // Finalize and get results
    const analysisResult = engine.finalize();
    setResult(analysisResult);

    // Generate constraint report
    if (analysisResult.isValid) {
      const tracker = new ConstraintTracker();
      tracker.checkDuration(analysisResult.metrics.durationSec, 60);
      tracker.checkMinimumSamples(analysisResult.metrics.totalFrames);
      tracker.checkFaceDetection(
        analysisResult.metrics.framesFaceDetected,
        analysisResult.metrics.totalFrames
      );
      tracker.checkAttentionSwitchCap(analysisResult.metrics.sideSwitchCount);
      tracker.checkJitterFiltering(true);
      tracker.checkEngagementThreshold(analysisResult.scores.engagementScore);
      tracker.checkDataQuality({
        framesFaceDetected: analysisResult.metrics.framesFaceDetected,
        totalFrames: analysisResult.metrics.totalFrames,
        sideSwitchCount: analysisResult.metrics.sideSwitchCount
      });
      setConstraintReport(tracker.generateReport());
    }

    setProgress(100);
    setIsRunning(false);
  };

  const reset = () => {
    setProgress(0);
    setResult(null);
    setConstraintReport(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-10 w-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Behavioral Engine Demo</h1>
          </div>
          <p className="text-gray-600">
            Interactive demonstration of the NeuroLens behavioral logic engine
          </p>
        </div>

        {/* Scenario Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Run Simulation</CardTitle>
            <CardDescription>
              Select a scenario to test the behavioral analysis engine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => runSimulation('high')}
                disabled={isRunning}
                className="h-20 flex flex-col"
              >
                <Play className="h-5 w-5 mb-1" />
                <span>High Engagement</span>
                <span className="text-xs opacity-80">90% detection</span>
              </Button>
              <Button
                onClick={() => runSimulation('low')}
                disabled={isRunning}
                className="h-20 flex flex-col"
                variant="secondary"
              >
                <Play className="h-5 w-5 mb-1" />
                <span>Low Engagement</span>
                <span className="text-xs opacity-80">30% detection</span>
              </Button>
              <Button
                onClick={() => runSimulation('geometric')}
                disabled={isRunning}
                className="h-20 flex flex-col"
                variant="outline"
              >
                <Play className="h-5 w-5 mb-1" />
                <span>Geometric Focus</span>
                <span className="text-xs opacity-80">85% geometric</span>
              </Button>
              <Button
                onClick={() => runSimulation('social')}
                disabled={isRunning}
                className="h-20 flex flex-col"
                variant="outline"
              >
                <Play className="h-5 w-5 mb-1" />
                <span>Social Focus</span>
                <span className="text-xs opacity-80">85% social</span>
              </Button>
            </div>

            {isRunning && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Processing frames...</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {result && (
              <div className="mt-4">
                <Button onClick={reset} variant="ghost" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <>
            {/* Validation Status */}
            <Card className={result.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {result.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Analysis Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.isValid ? (
                  <p className="text-green-800">
                    ✓ Analysis completed successfully. Data is valid and reliable.
                  </p>
                ) : (
                  <Alert className="bg-white">
                    <AlertDescription className="text-red-800">
                      {result.validationMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Raw Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Raw Metrics</CardTitle>
                <CardDescription>Frame-by-frame observation data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{result.metrics.totalFrames}</div>
                    <div className="text-sm text-gray-600">Total Frames</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{result.metrics.framesFaceDetected}</div>
                    <div className="text-sm text-blue-600">Face Detected</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{result.metrics.framesSocialSide}</div>
                    <div className="text-sm text-purple-600">Social Side</div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-900">{result.metrics.framesGeometricSide}</div>
                    <div className="text-sm text-indigo-600">Geometric Side</div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-900">{result.metrics.sideSwitchCount}</div>
                    <div className="text-sm text-amber-600">Attention Shifts</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{result.metrics.durationSec.toFixed(1)}s</div>
                    <div className="text-sm text-green-600">Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Computed Scores */}
            {result.isValid && (
              <Card>
                <CardHeader>
                  <CardTitle>Computed Scores</CardTitle>
                  <CardDescription>Derived behavioral indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <Badge>{(result.scores.engagementScore * 100).toFixed(0)}%</Badge>
                    </div>
                    <Progress value={result.scores.engagementScore * 100} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Social Preference</span>
                      <Badge variant="outline">{(result.scores.socialPreference * 100).toFixed(0)}%</Badge>
                    </div>
                    <Progress value={result.scores.socialPreference * 100} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Geometric Preference</span>
                      <Badge variant="outline">{(result.scores.geometricPreference * 100).toFixed(0)}%</Badge>
                    </div>
                    <Progress value={result.scores.geometricPreference * 100} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-gray-50 rounded text-center">
                      <div className="text-xs text-gray-600">Dominant Focus</div>
                      <div className="font-semibold capitalize">{result.scores.dominantFocus}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded text-center">
                      <div className="text-xs text-gray-600">Engagement Level</div>
                      <div className="font-semibold capitalize">{result.scores.engagementLevel}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded text-center">
                      <div className="text-xs text-gray-600">Attention Flexibility</div>
                      <div className="font-semibold capitalize">{result.scores.attentionFlexibility}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interpretation */}
            {result.isValid && (
              <Card>
                <CardHeader>
                  <CardTitle>Behavioral Interpretation</CardTitle>
                  <CardDescription>Neutral, educational summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{result.interpretation}</p>
                </CardContent>
              </Card>
            )}

            {/* Constraint Report */}
            {constraintReport && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle>Constraint Tracking Report</CardTitle>
                  <CardDescription>
                    Validation of testing parameters and data quality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">Overall Status:</div>
                      <div className={`text-lg font-bold ${
                        constraintReport.overallStatus === 'COMPLIANT' ? 'text-green-600' :
                        constraintReport.overallStatus === 'PARTIAL' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {constraintReport.overallStatus}
                      </div>
                    </div>
                    <Badge className={`text-sm px-4 py-2 ${
                      constraintReport.overallStatus === 'COMPLIANT' ? 'bg-green-100 text-green-800' :
                      constraintReport.overallStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {constraintReport.passedConstraints}/{constraintReport.totalConstraints} Passed
                    </Badge>
                  </div>

                  <Alert className="bg-white">
                    <AlertDescription>{constraintReport.summary}</AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    {constraintReport.checks.map((check, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded">
                        {check.status === 'PASS' ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : check.status === 'WARNING' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{check.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{check.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
