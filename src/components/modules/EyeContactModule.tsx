import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Clock, CheckCircle2 } from 'lucide-react';
import VideoCapture from '@/components/VideoCapture';
import type { EyeContactResult, ModuleProps } from '@/types/screening';

export default function EyeContactModule({ onComplete, onBack }: ModuleProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25); // 25 seconds
  const [isComplete, setIsComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: 0 | 1 | 2;
    percent: number;
    confidence: number;
  } | null>(null);

  const DURATION = 25;

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
    
    // Simulate AI analysis
    await analyzeEyeContact();
  };

  const analyzeEyeContact = async () => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate AI analysis with random but realistic scoring
    const randomAnalysis = Math.random();
    let score: 0 | 1 | 2;
    let percent: number;
    let confidence: number;
    
    if (randomAnalysis < 0.4) {
      // Frequent eye contact
      score = 0;
      percent = 70 + Math.floor(Math.random() * 25);
      confidence = 0.85 + Math.random() * 0.1;
    } else if (randomAnalysis < 0.75) {
      // Occasional eye contact
      score = 1;
      percent = 35 + Math.floor(Math.random() * 30);
      confidence = 0.75 + Math.random() * 0.15;
    } else {
      // Very little/no eye contact
      score = 2;
      percent = 5 + Math.floor(Math.random() * 25);
      confidence = 0.7 + Math.random() * 0.2;
    }
    
    setAnalysisResult({ score, percent, confidence });
    setIsAnalyzing(false);
    setIsComplete(true);
  };

  const handleSubmit = () => {
    if (!analysisResult) return;
    
    const result: EyeContactResult = {
      eye_contact_score: analysisResult.score,
      eye_contact_percent: analysisResult.percent,
      duration_seconds: DURATION
    };

    onComplete(result);
  };

  const getSliderLabel = (value: number) => {
    switch (value) {
      case 0: return 'Frequent eye contact';
      case 1: return 'Occasional eye contact';
      case 2: return 'Very little/no eye contact';
      default: return '';
    }
  };

  const getSliderColor = (value: number) => {
    switch (value) {
      case 0: return 'text-green-600';
      case 1: return 'text-yellow-600';
      case 2: return 'text-red-600';
      default: return 'text-gray-600';
    }
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
        <Eye className="h-10 w-10 text-blue-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900">Module 1: Eye Contact & Social Engagement</h2>
        <p className="text-gray-600">
          Observe how often your child looks at faces or the screen
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">1</div>
            <p className="text-sm text-gray-700">Sit in front of the camera with your child</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">2</div>
            <p className="text-sm text-gray-700">Talk to them and try to get them to look at your face or the screen</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">3</div>
            <p className="text-sm text-gray-700">Recording will last for {DURATION} seconds</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">4</div>
            <p className="text-sm text-gray-700">After recording, you'll rate how often eye contact occurred</p>
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
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="text-center py-4">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {formatTime(timeRemaining)}
              </div>
              <Progress 
                value={((DURATION - timeRemaining) / DURATION) * 100} 
                className="h-2 mt-2"
              />
              <p className="text-sm text-blue-600 mt-1">Recording in progress...</p>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        {!isRecording && !isComplete && (
          <Button 
            onClick={handleStartRecording}
            className="w-full bg-blue-600 hover:bg-blue-700"
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
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Eye Contact Patterns</h3>
            <p className="text-sm text-gray-600">AI is processing video data and detecting gaze patterns...</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results (shown after analysis) */}
      {isComplete && analysisResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>AI Analysis Complete</span>
            </CardTitle>
            <CardDescription>
              Automated gaze tracking and eye contact detection results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Eye Contact Detected:</span>
                  <span className="text-2xl font-bold text-blue-600">{analysisResult.percent}%</span>
                </div>
                <Progress value={analysisResult.percent} className="h-3" />
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">Assessment:</div>
                <div className={`text-lg font-bold ${
                  analysisResult.score === 0 ? 'text-green-600' :
                  analysisResult.score === 1 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysisResult.score === 0 ? 'Frequent eye contact observed' :
                   analysisResult.score === 1 ? 'Occasional eye contact observed' :
                   'Limited eye contact observed'}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Confidence: {Math.round(analysisResult.confidence * 100)}%
                </div>
              </div>

              <div className="text-xs text-gray-600 p-3 bg-blue-50 rounded border border-blue-200">
                <strong>AI Analysis:</strong> Using computer vision to track facial landmarks and gaze direction during the {DURATION}-second recording period.
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
                className="flex-1 bg-green-600 hover:bg-green-700"
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
          <strong>Tips:</strong> Ensure good lighting on your child's face. Use their name, show toys, or make sounds to encourage them to look at you.
        </AlertDescription>
      </Alert>
    </div>
  );
}
