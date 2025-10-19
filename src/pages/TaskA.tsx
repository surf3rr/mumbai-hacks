import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Clock, ArrowRight } from 'lucide-react';
import VideoCapture from '@/components/VideoCapture';
import AudioCapture from '@/components/AudioCapture';

export default function TaskA() {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds
  const [currentStep, setCurrentStep] = useState(0);
  const [taskComplete, setTaskComplete] = useState(false);
  const navigate = useNavigate();

  const instructions = [
    "Position your child comfortably in front of the camera",
    "Call your child's name clearly and observe their response",
    "Try different tones and volumes if needed",
    "Observe eye contact and attention patterns"
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRecording(false);
            setTaskComplete(true);
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
    setCurrentStep(1);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setTaskComplete(true);
  };

  const handleNextTask = () => {
    navigate('/task-b');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <User className="h-10 w-10 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Task 1: Name Response</h1>
          <p className="text-gray-600">Observing response to name calling and attention-seeking</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Assessment Progress</span>
            <span>Task 1 of 3</span>
          </div>
          <Progress value={33} className="h-2" />
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ${
                    currentStep > index ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{instruction}</p>
                </div>
              ))}
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
              showControls={!taskComplete}
            />
          </div>

          {/* Audio & Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Audio Monitoring</h3>
            <AudioCapture isRecording={isRecording} />
            
            {/* Timer */}
            {isRecording && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="text-center py-6">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-700">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-sm text-blue-600">Recording in progress</p>
                </CardContent>
              </Card>
            )}

            {/* Controls */}
            <div className="space-y-4">
              {!isRecording && !taskComplete && (
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
                  Stop Recording
                </Button>
              )}

              {taskComplete && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Task 1 completed successfully! The system has captured behavioral patterns 
                      during name response interactions.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleNextTask}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    Continue to Task 2
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <h4 className="font-semibold text-amber-800 mb-2">Tips for Best Results:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Ensure good lighting on your child's face</li>
              <li>• Call their name from different directions</li>
              <li>• Use their preferred nickname or variations</li>
              <li>• Stay calm and patient throughout the process</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}