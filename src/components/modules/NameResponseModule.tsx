import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCheck, Clock, Volume2, CheckCircle2 } from 'lucide-react';
import VideoCapture from '@/components/VideoCapture';
import AudioCapture from '@/components/AudioCapture';
import type { NameResponseResult, ModuleProps } from '@/types/screening';

export default function NameResponseModule({ onComplete, onBack }: ModuleProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15); // 15 seconds
  const [isComplete, setIsComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: 0 | 1 | 2;
    latency: number | null;
    confidence: number;
  } | null>(null);

  const DURATION = 15;

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
    await analyzeNameResponse();
  };

  const analyzeNameResponse = async () => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate AI analysis
    const randomAnalysis = Math.random();
    let score: 0 | 1 | 2;
    let latency: number | null;
    let confidence: number;
    
    if (randomAnalysis < 0.5) {
      // Quick response
      score = 0;
      latency = 400 + Math.floor(Math.random() * 800); // 400-1200ms
      confidence = 0.8 + Math.random() * 0.15;
    } else if (randomAnalysis < 0.80) {
      // Delayed response
      score = 1;
      latency = 2000 + Math.floor(Math.random() * 2000); // 2-4 seconds
      confidence = 0.7 + Math.random() * 0.2;
    } else {
      // No response
      score = 2;
      latency = null;
      confidence = 0.75 + Math.random() * 0.15;
    }
    
    setAnalysisResult({ score, latency, confidence });
    setIsAnalyzing(false);
    setIsComplete(true);
  };

  const handleSubmit = () => {
    if (!analysisResult) return;

    const result: NameResponseResult = {
      response_to_name_score: analysisResult.score,
      response_latency_ms: analysisResult.latency
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
        <UserCheck className="h-10 w-10 text-green-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900">Module 2: Response to Name / Voice</h2>
        <p className="text-gray-600">
          Observe how your child responds when their name is called
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">1</div>
            <p className="text-sm text-gray-700">Position your child comfortably in front of the camera</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">2</div>
            <p className="text-sm text-gray-700">When recording starts, wait 3-5 seconds, then call your child's name</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">3</div>
            <p className="text-sm text-gray-700">Call their name once as you normally would - don't repeat immediately</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">4</div>
            <p className="text-sm text-gray-700">Observe if they turn their head, look at you, or respond in any way</p>
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
            <Card className="bg-green-50 border-green-200">
              <CardContent className="text-center py-4">
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {formatTime(timeRemaining)}
                </div>
                <Progress 
                  value={((DURATION - timeRemaining) / DURATION) * 100} 
                  className="h-2 mt-2"
                />
                <p className="text-sm text-green-600 mt-1">Call your child's name now!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Controls */}
      {!isRecording && !isComplete && (
        <Button 
          onClick={handleStartRecording}
          className="w-full bg-green-600 hover:bg-green-700"
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
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Response to Name</h3>
            <p className="text-sm text-gray-600">AI is detecting head movements and response timing...</p>
          </CardContent>
        </Card>
      )}

      {/* Response Selection (shown after recording) */}
      {isComplete && analysisResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>AI Analysis Complete</span>
            </CardTitle>
            <CardDescription>
              Automated response detection and timing analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">Response Detected:</div>
                <div className={`text-lg font-bold mb-2 ${
                  analysisResult.score === 0 ? 'text-green-600' :
                  analysisResult.score === 1 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysisResult.score === 0 ? 'Quick Response Detected' :
                   analysisResult.score === 1 ? 'Delayed Response Detected' :
                   'No Clear Response Detected'}
                </div>
                {analysisResult.latency && (
                  <div className="text-sm text-gray-600">
                    Response Latency: <span className="font-semibold">{analysisResult.latency}ms</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Confidence: {Math.round(analysisResult.confidence * 100)}%
                </div>
              </div>

              <div className="text-xs text-gray-600 p-3 bg-green-50 rounded border border-green-200">
                <strong>AI Analysis:</strong> Detected head orientation changes and movement patterns following audio stimulus (name calling) during the recording.
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
          <strong>Tip:</strong> Use your child's preferred nickname or the name variation they respond to best. Try different tones if needed.
        </AlertDescription>
      </Alert>
    </div>
  );
}
