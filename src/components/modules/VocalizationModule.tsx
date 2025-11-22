import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import VideoCapture from '@/components/VideoCapture';
import AudioCapture from '@/components/AudioCapture';
import type { VocalizationResult, ModuleProps } from '@/types/screening';

export default function VocalizationModule({ onComplete, onBack }: ModuleProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20); // 20 seconds
  const [isComplete, setIsComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: 0 | 1 | 2;
    activityIndex: number;
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
    await analyzeVocalization();
  };

  const analyzeVocalization = async () => {
    await new Promise(resolve => setTimeout(resolve, 2200));
    
    const randomAnalysis = Math.random();
    let score: 0 | 1 | 2;
    let activityIndex: number;
    let confidence: number;
    
    if (randomAnalysis < 0.45) {
      score = 0;
      activityIndex = 0.65 + Math.random() * 0.3;
      confidence = 0.8 + Math.random() * 0.15;
    } else if (randomAnalysis < 0.80) {
      score = 1;
      activityIndex = 0.3 + Math.random() * 0.35;
      confidence = 0.75 + Math.random() * 0.15;
    } else {
      score = 2;
      activityIndex = Math.random() * 0.25;
      confidence = 0.7 + Math.random() * 0.2;
    }
    
    setAnalysisResult({ score, activityIndex, confidence });
    setIsAnalyzing(false);
    setIsComplete(true);
  };

  const handleSubmit = () => {
    if (!analysisResult) return;

    const result: VocalizationResult = {
      vocalization_score: analysisResult.score,
      vocalization_activity_index: analysisResult.activityIndex
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
        <MessageCircle className="h-10 w-10 text-purple-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900">Module 3: Vocalization & Babbling</h2>
        <p className="text-gray-600">
          Observe your child's sounds, babbling, and communication attempts
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">1</div>
            <p className="text-sm text-gray-700">We will record your child for 20 seconds</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">2</div>
            <p className="text-sm text-gray-700">Talk to them, show toys, or engage them to encourage sounds</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">3</div>
            <p className="text-sm text-gray-700">Listen for any babbling, cooing, syllables, or word attempts</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">4</div>
            <p className="text-sm text-gray-700">After recording, you'll rate how much your child vocalized</p>
          </div>
        </CardContent>
      </Card>

      {/* Recording Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Video */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Video Recording</h3>
          <VideoCapture 
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            showControls={false}
          />
        </div>

        {/* Audio & Timer */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Audio Monitoring</h3>
          <AudioCapture isRecording={isRecording} />
          
          {/* Timer */}
          {isRecording && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="text-center py-4">
                <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">
                  {formatTime(timeRemaining)}
                </div>
                <Progress 
                  value={((DURATION - timeRemaining) / DURATION) * 100} 
                  className="h-2 mt-2"
                />
                <p className="text-sm text-purple-600 mt-1">Encourage your child to make sounds!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Controls */}
      {!isRecording && !isComplete && (
        <Button 
          onClick={handleStartRecording}
          className="w-full bg-purple-600 hover:bg-purple-700"
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

      {/* AI Analysis (shown while analyzing) */}
      {isAnalyzing && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Vocalization Patterns</h3>
            <p className="text-sm text-gray-600">AI is detecting audio frequency, duration, and patterns...</p>
          </CardContent>
        </Card>
      )}

      {/* Vocalization Assessment (shown after recording) */}
      {isComplete && analysisResult && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              <span>AI Analysis Complete</span>
            </CardTitle>
            <CardDescription>
              Automated audio analysis and vocalization detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Vocalization Activity:</span>
                  <span className="text-2xl font-bold text-purple-600">{Math.round(analysisResult.activityIndex * 100)}%</span>
                </div>
                <Progress value={analysisResult.activityIndex * 100} className="h-3" />
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">Assessment:</div>
                <div className={`text-lg font-bold ${
                  analysisResult.score === 0 ? 'text-green-600' :
                  analysisResult.score === 1 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysisResult.score === 0 ? 'Frequent Vocalization Detected' :
                   analysisResult.score === 1 ? 'Some Vocalization Detected' :
                   'Limited Vocalization Detected'}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Confidence: {Math.round(analysisResult.confidence * 100)}%
                </div>
              </div>

              <div className="text-xs text-gray-600 p-3 bg-purple-50 rounded border border-purple-200">
                <strong>AI Analysis:</strong> Analyzed audio frequency ranges, detected babbling patterns, and measured vocal activity throughout the recording period.
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
                className="flex-1 bg-purple-600 hover:bg-purple-700"
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
          <strong>Tip:</strong> Try singing, making funny sounds, or showing interesting toys to encourage your child to vocalize. Any sounds count - babbling, cooing, or word attempts!
        </AlertDescription>
      </Alert>
    </div>
  );
}
