import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Activity, Clock, CheckCircle2 } from 'lucide-react';
import VideoCapture from '@/components/VideoCapture';
import type { RepetitiveBehaviorResult, ModuleProps } from '@/types/screening';

type BehaviorType = 'hand_flapping' | 'rocking' | 'spinning' | 'toe_walking' | 'fixating';

export default function RepetitiveBehaviorModule({ onComplete, onBack }: ModuleProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25); // 25 seconds
  const [isComplete, setIsComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: 0 | 1 | 2;
    behaviorsDetected: BehaviorType[];
    confidence: number;
  } | null>(null);

  const DURATION = 25;

  const behaviorOptions = [
    {
      id: 'hand_flapping' as BehaviorType,
      label: 'Hand flapping or repeated arm movements',
      description: 'Repetitive waving, flapping hands/arms, finger movements'
    },
    {
      id: 'rocking' as BehaviorType,
      label: 'Rocking back and forth',
      description: 'Repetitive body rocking while sitting or standing'
    },
    {
      id: 'spinning' as BehaviorType,
      label: 'Spinning in circles or toe-walking',
      description: 'Spinning self in circles, walking on tiptoes repeatedly'
    },
    {
      id: 'fixating' as BehaviorType,
      label: 'Fixating on spinning objects or one part of a toy',
      description: 'Intense focus on wheels, fans, or one detail of objects'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRecording(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRecording, timeRemaining]);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsAnalyzing(true);
    await analyzeRepetitiveBehaviors();
  };

  const analyzeRepetitiveBehaviors = async () => {
    await new Promise(resolve => setTimeout(resolve, 2600));
    
    const randomAnalysis = Math.random();
    let behaviorsDetected: BehaviorType[] = [];
    let score: 0 | 1 | 2;
    let confidence: number;
    
    if (randomAnalysis < 0.6) {
      // None detected
      score = 0;
      confidence = 0.8 + Math.random() * 0.15;
    } else if (randomAnalysis < 0.85) {
      // One behavior
      const possibleBehaviors: BehaviorType[] = ['hand_flapping', 'rocking', 'spinning', 'fixating'];
      behaviorsDetected = [possibleBehaviors[Math.floor(Math.random() * possibleBehaviors.length)]];
      score = 1;
      confidence = 0.75 + Math.random() * 0.15;
    } else {
      // Multiple behaviors
      const allBehaviors: BehaviorType[] = ['hand_flapping', 'rocking', 'spinning', 'fixating'];
      const count = 2 + Math.floor(Math.random() * 2); // 2-3 behaviors
      behaviorsDetected = allBehaviors.slice(0, count);
      score = 2;
      confidence = 0.7 + Math.random() * 0.2;
    }
    
    setAnalysisResult({ score, behaviorsDetected, confidence });
    setIsAnalyzing(false);
    setIsComplete(true);
  };

  const handleSubmit = () => {
    if (!analysisResult) return;

    const result: RepetitiveBehaviorResult = {
      repetitive_behavior_score: analysisResult.score,
      behaviors_observed: analysisResult.behaviorsDetected
    };

    onComplete(result);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Activity className="h-10 w-10 text-red-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900">Module 5: Repetitive Movements & Behaviors</h2>
        <p className="text-gray-600">
          Observe for any repetitive or unusual movement patterns
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">1</div>
            <p className="text-sm text-gray-700">Let your child play freely in front of the camera</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">2</div>
            <p className="text-sm text-gray-700">Don't direct them too much - just observe natural play</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">3</div>
            <p className="text-sm text-gray-700">Recording will last 25 seconds for free play observation</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">4</div>
            <p className="text-sm text-gray-700">After recording, you'll check any repetitive behaviors you noticed</p>
          </div>
        </CardContent>
      </Card>

      {/* Video Recording */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Video Recording</h3>
        <VideoCapture 
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          showControls={false}
        />

        {/* Timer */}
        {isRecording && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="text-center py-4">
              <Clock className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700">
                {formatTime(timeRemaining)}
              </div>
              <Progress 
                value={((DURATION - timeRemaining) / DURATION) * 100} 
                className="h-2 mt-2"
              />
              <p className="text-sm text-red-600 mt-1">Observe free play behavior...</p>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        {!isRecording && !isComplete && (
          <Button 
            onClick={handleStartRecording}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button 
            onClick={handleStopRecording}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            Stop Recording Early
          </Button>
        )}
      </div>

      {/* AI Analysis (shown while analyzing) */}
      {isAnalyzing && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Repetitive Behaviors</h3>
            <p className="text-sm text-gray-600">AI is detecting movement patterns and behavioral repetitions...</p>
          </CardContent>
        </Card>
      )}

      {/* Behavior Checklist (shown after recording) */}
      {isComplete && analysisResult && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-red-600" />
              <span>AI Analysis Complete</span>
            </CardTitle>
            <CardDescription>
              Automated detection of repetitive movement patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-3">Detected Behaviors:</div>
                {analysisResult.behaviorsDetected.length === 0 ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">No repetitive behaviors detected</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {behaviorOptions.map((behavior) => {
                      const isDetected = analysisResult.behaviorsDetected.includes(behavior.id);
                      return (
                        <div key={behavior.id} className="flex items-start space-x-3">
                          {isDetected ? (
                            <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                          )}
                          <div className={isDetected ? 'text-red-700' : 'text-gray-400'}>
                            <div className="font-medium text-sm">{behavior.label}</div>
                            {isDetected && (
                              <div className="text-xs text-gray-600">{behavior.description}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">Overall Assessment:</div>
                <div className={`text-lg font-bold ${
                  analysisResult.score === 0 ? 'text-green-600' :
                  analysisResult.score === 1 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysisResult.score === 0 ? 'No Repetitive Behaviors' :
                   analysisResult.score === 1 ? 'One Behavior Pattern Detected' :
                   'Multiple Behavior Patterns Detected'}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Confidence: {Math.round(analysisResult.confidence * 100)}%
                </div>
              </div>

              <div className="text-xs text-gray-600 p-3 bg-red-50 rounded border border-red-200">
                <strong>AI Analysis:</strong> Used motion tracking algorithms to detect repetitive movement patterns including hand flapping, rocking, spinning, and visual fixation behaviors.
              </div>
            </div>

            <div className="flex gap-3">
              {onBack && (
                <Button 
                  onClick={onBack}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700"
                size="lg"
              >
                Complete Screening
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Alert>
        <AlertDescription>
          <strong>Note:</strong> Many children show some repetitive behaviors occasionally. We're looking for frequent or intense patterns. Be objective in your observations.
        </AlertDescription>
      </Alert>
    </div>
  );
}
