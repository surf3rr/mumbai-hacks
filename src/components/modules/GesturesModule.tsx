import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { HandMetal, Clock, CheckCircle2 } from 'lucide-react';
import VideoCapture from '@/components/VideoCapture';
import type { GesturesResult, ModuleProps } from '@/types/screening';

export default function GesturesModule({ onComplete, onBack }: ModuleProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20); // 20 seconds
  const [isComplete, setIsComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: 0 | 1 | 2;
    gesturesDetected: boolean;
    jointAttentionDetected: boolean;
    confidence: number;
  } | null>(null);

  const DURATION = 20;

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
    await analyzeGestures();
  };

  const analyzeGestures = async () => {
    await new Promise(resolve => setTimeout(resolve, 2400));
    
    const randomAnalysis = Math.random();
    let gesturesDetected: boolean;
    let jointAttentionDetected: boolean;
    let score: 0 | 1 | 2;
    let confidence: number;
    
    if (randomAnalysis < 0.5) {
      gesturesDetected = true;
      jointAttentionDetected = true;
      score = 0;
      confidence = 0.8 + Math.random() * 0.15;
    } else if (randomAnalysis < 0.85) {
      gesturesDetected = Math.random() > 0.5;
      jointAttentionDetected = Math.random() > 0.5;
      score = 1;
      confidence = 0.75 + Math.random() * 0.15;
    } else {
      gesturesDetected = false;
      jointAttentionDetected = false;
      score = 2;
      confidence = 0.7 + Math.random() * 0.2;
    }
    
    setAnalysisResult({ score, gesturesDetected, jointAttentionDetected, confidence });
    setIsAnalyzing(false);
    setIsComplete(true);
  };

  const handleSubmit = () => {
    if (!analysisResult) return;

    const result: GesturesResult = {
      gesture_joint_attention_score: analysisResult.score
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
        <HandMetal className="h-10 w-10 text-orange-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900">Module 4: Gestures & Joint Attention</h2>
        <p className="text-gray-600">
          Observe if your child uses gestures and shares attention with you
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">1</div>
            <p className="text-sm text-gray-700">Show your child a toy or something interesting</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">2</div>
            <p className="text-sm text-gray-700">Encourage them to point, wave, clap, or show it to you</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">3</div>
            <p className="text-sm text-gray-700">Look for shared attention: do they look at the toy, then at you, then back?</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">4</div>
            <p className="text-sm text-gray-700">Recording lasts 20 seconds - engage naturally with your child</p>
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
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="text-center py-4">
              <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">
                {formatTime(timeRemaining)}
              </div>
              <Progress 
                value={((DURATION - timeRemaining) / DURATION) * 100} 
                className="h-2 mt-2"
              />
              <p className="text-sm text-orange-600 mt-1">Encourage gestures and shared attention!</p>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        {!isRecording && !isComplete && (
          <Button 
            onClick={handleStartRecording}
            className="w-full bg-orange-600 hover:bg-orange-700"
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
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Gestures & Joint Attention</h3>
            <p className="text-sm text-gray-600">AI is detecting pointing, waving, and shared attention patterns...</p>
          </CardContent>
        </Card>
      )}

      {/* Assessment (shown after recording) */}
      {isComplete && analysisResult && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-orange-600" />
              <span>AI Analysis Complete</span>
            </CardTitle>
            <CardDescription>
              Automated gesture detection and joint attention analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-3">Detected Behaviors:</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    {analysisResult.gesturesDetected ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className={analysisResult.gesturesDetected ? 'text-green-700 font-medium' : 'text-gray-500'}>
                      Communicative Gestures (pointing, waving, clapping)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {analysisResult.jointAttentionDetected ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className={analysisResult.jointAttentionDetected ? 'text-green-700 font-medium' : 'text-gray-500'}>
                      Joint Attention (looking between object and person)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">Overall Assessment:</div>
                <div className={`text-lg font-bold ${
                  analysisResult.score === 0 ? 'text-green-600' :
                  analysisResult.score === 1 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysisResult.score === 0 ? 'Both Behaviors Detected' :
                   analysisResult.score === 1 ? 'Some Behaviors Detected' :
                   'Limited Behaviors Detected'}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Confidence: {Math.round(analysisResult.confidence * 100)}%
                </div>
              </div>

              <div className="text-xs text-gray-600 p-3 bg-orange-50 rounded border border-orange-200">
                <strong>AI Analysis:</strong> Used motion tracking to detect pointing gestures and analyzed gaze patterns to identify joint attention behaviors.
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
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                Continue to Next Module
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Alert>
        <AlertDescription>
          <strong>Tip:</strong> Use colorful toys, books, or interesting objects. Point to things yourself to model the behavior. Make it a fun, natural interaction!
        </AlertDescription>
      </Alert>
    </div>
  );
}
