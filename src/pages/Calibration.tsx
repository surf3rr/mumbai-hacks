import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Camera, Mic, CheckCircle, XCircle, Settings } from 'lucide-react';
import VideoCapture from '@/components/VideoCapture';
import AudioCapture from '@/components/AudioCapture';

export default function Calibration() {
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setCameraPermission('granted');
      setMicPermission('granted');
      
      // Stop the stream after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setTimeout(() => setCalibrationStep(1), 1000);
    } catch (error) {
      console.error('Permission denied:', error);
      setCameraPermission('denied');
      setMicPermission('denied');
    }
  };

  const handleCalibrationComplete = () => {
    setIsReady(true);
    setTimeout(() => {
      navigate('/task-a');
    }, 2000);
  };

  const PermissionStatus = ({ permission, icon: Icon, label }: {
    permission: 'pending' | 'granted' | 'denied';
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => (
    <div className="flex items-center space-x-3 p-3 rounded-lg border">
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
      <div className="ml-auto">
        {permission === 'pending' && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
        {permission === 'granted' && <CheckCircle className="h-5 w-5 text-green-600" />}
        {permission === 'denied' && <XCircle className="h-5 w-5 text-red-600" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <Settings className="h-10 w-10 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Setup & Calibration</h1>
          <p className="text-gray-600">Let's make sure everything is working properly</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Setup Progress</span>
            <span>{Math.round((calibrationStep / 3) * 100)}%</span>
          </div>
          <Progress value={(calibrationStep / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Permissions */}
        {calibrationStep >= 0 && (
          <Card className={calibrationStep === 0 ? 'border-blue-300 bg-blue-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ${
                  calibrationStep > 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  1
                </div>
                <span>Camera & Microphone Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PermissionStatus permission={cameraPermission} icon={Camera} label="Camera Access" />
              <PermissionStatus permission={micPermission} icon={Mic} label="Microphone Access" />
              
              {(cameraPermission === 'denied' || micPermission === 'denied') && (
                <Alert>
                  <AlertDescription>
                    Please enable camera and microphone permissions in your browser settings and refresh the page.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Camera Test */}
        {calibrationStep >= 1 && (
          <Card className={calibrationStep === 1 ? 'border-blue-300 bg-blue-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ${
                  calibrationStep > 1 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  2
                </div>
                <span>Camera Test</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Please position your child in front of the camera. Make sure they are clearly visible.
              </p>
              <VideoCapture onReady={() => setTimeout(() => setCalibrationStep(2), 2000)} />
              {calibrationStep === 1 && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Checking camera quality...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Audio Test */}
        {calibrationStep >= 2 && (
          <Card className={calibrationStep === 2 ? 'border-blue-300 bg-blue-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ${
                  calibrationStep > 2 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  3
                </div>
                <span>Audio Test</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Speak normally or make sounds. We'll test the audio quality.
              </p>
              <AudioCapture onReady={() => setTimeout(() => setCalibrationStep(3), 2000)} />
              {calibrationStep === 2 && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Testing audio levels...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ready to Start */}
        {calibrationStep >= 3 && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">Setup Complete!</h3>
              <p className="text-green-700 mb-6">
                Everything is working properly. We're ready to begin the assessment.
              </p>
              <Button 
                onClick={handleCalibrationComplete}
                className="bg-green-600 hover:bg-green-700"
                disabled={isReady}
              >
                {isReady ? 'Starting Assessment...' : 'Begin Assessment'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}