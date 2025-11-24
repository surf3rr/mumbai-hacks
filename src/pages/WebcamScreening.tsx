import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, WebcamIcon, RotateCcw, Play, Square, BarChart3 } from 'lucide-react';

interface ScreeningResult {
  autism_risk_score: number;
  risk_category: 'Low' | 'Moderate' | 'High';
  risk_color: 'green' | 'yellow' | 'red';
  metrics: {
    eye_contact: string;
    head_movement: string;
    facial_expression: string;
    attention: string;
  };
  recommendation: string;
  data_quality: {
    total_frames: number;
    frames_with_face: number;
    detection_rate: number;
  };
}

const WebcamScreening: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes
  const [progress, setProgress] = useState<number>(0);
  const [backendStatus, setBackendStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  
  // Check backend connection
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/');
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };
    
    checkBackend();
  }, []);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        setProgress(((120 - timeLeft) / 120) * 100);
      }, 1000);
    } else if (timeLeft === 0) {
      stopScreening();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAnalyzing, timeLeft]);
  
  // Initialize webcam
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      alert('Could not access webcam. Please ensure you have granted permission.');
    }
  };
  
  // Capture and send frame to backend
  const captureAndSendFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Draw video frame to canvas
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    
    try {
      const response = await fetch('http://localhost:5000/api/process_frame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: imageData
        })
      });
      
      const result = await response.json();
      console.log('Frame processed:', result);
    } catch (error) {
      console.error('Error sending frame to backend:', error);
    }
  };
  
  // Start the screening process
  const startScreening = async () => {
    await startWebcam();
    
    setIsAnalyzing(true);
    setTimeLeft(120);
    setProgress(0);
    setScreeningResult(null);
    
    // Start capturing frames every 500ms (2 fps)
    const frameInterval = setInterval(() => {
      if (isAnalyzing) {
        captureAndSendFrame();
      }
    }, 500);
    
    // Clear interval when screening stops
    return () => clearInterval(frameInterval);
  };
  
  // Stop the screening process
  const stopScreening = async () => {
    setIsAnalyzing(false);
    
    // Stop webcam stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Get final results from backend
    try {
      const response = await fetch('http://localhost:5000/api/get_results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const result: ScreeningResult = await response.json();
      setScreeningResult(result);
    } catch (error) {
      console.error('Error getting results from backend:', error);
      alert('Error getting results. Please check that the Python backend is running.');
    }
  };
  
  // Reset the screening
  const resetScreening = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsAnalyzing(false);
    setScreeningResult(null);
    setTimeLeft(120);
    setProgress(0);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get risk badge variant
  const getRiskVariant = () => {
    if (!screeningResult) return 'default';
    switch (screeningResult.risk_category) {
      case 'Low': return 'success';
      case 'Moderate': return 'secondary';
      case 'High': return 'destructive';
      default: return 'default';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Real-time Autism Screening</h1>
          </div>
          <p className="text-gray-600">Webcam-based behavioral analysis with Python backend</p>
          
          {/* Backend Status */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${
              backendStatus === 'connected' ? 'bg-green-500' : 
              backendStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {backendStatus === 'connected' ? 'Connected to Python backend' : 
               backendStatus === 'error' ? 'Backend connection error' : 'Backend not running'}
            </span>
          </div>
        </div>
        
        {/* Stimulus Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Stimulus Display</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Social Stimulus (Left) */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Social Stimulus</h3>
                <div className="bg-blue-100 rounded aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                    <p className="mt-2 text-sm text-gray-600">Faces & Social Cues</p>
                  </div>
                </div>
              </div>
              
              {/* Geometric Stimulus (Right) */}
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">Geometric Patterns</h3>
                <div className="bg-purple-100 rounded aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                    <p className="mt-2 text-sm text-gray-600">Shapes & Patterns</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Webcam Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <WebcamIcon className="h-5 w-5" />
              <span>Webcam Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full max-w-md border-2 border-gray-300 rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Position child in front of camera, facing the screen
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Timer and Progress */}
              <div className="w-full max-w-md">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Time remaining</span>
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Control Buttons */}
              <div className="flex space-x-4">
                {!isAnalyzing ? (
                  <Button 
                    onClick={startScreening}
                    disabled={backendStatus !== 'connected'}
                    className="flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Screening (2 min)</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={stopScreening}
                    variant="destructive"
                    className="flex items-center space-x-2"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop Screening</span>
                  </Button>
                )}
                
                <Button 
                  onClick={resetScreening}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Results */}
        {screeningResult && (
          <Card className="border-2 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Screening Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Score */}
              <div className="text-center">
                <div className={`text-6xl font-bold ${
                  screeningResult.risk_color === 'green' ? 'text-green-600' :
                  screeningResult.risk_color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {screeningResult.autism_risk_score}
                </div>
                <div className="mt-2">
                  <Badge variant={getRiskVariant()}>
                    {screeningResult.risk_category} Risk
                  </Badge>
                </div>
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Eye Contact</h4>
                  <p className="text-gray-700">{screeningResult.metrics.eye_contact}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Head Movement</h4>
                  <p className="text-gray-700">{screeningResult.metrics.head_movement}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Facial Expression</h4>
                  <p className="text-gray-700">{screeningResult.metrics.facial_expression}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Attention</h4>
                  <p className="text-gray-700">{screeningResult.metrics.attention}</p>
                </div>
              </div>
              
              {/* Recommendation */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">Recommendation</h4>
                <p className="text-gray-700">{screeningResult.recommendation}</p>
              </div>
              
              {/* Data Quality */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Data Quality</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Total Frames:</span>
                    <span className="ml-1 font-medium">{screeningResult.data_quality.total_frames}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Frames with Face:</span>
                    <span className="ml-1 font-medium">{screeningResult.data_quality.frames_with_face}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Detection Rate:</span>
                    <span className="ml-1 font-medium">{screeningResult.data_quality.detection_rate}%</span>
                  </div>
                </div>
              </div>
              
              {/* Important Notice */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Important Notice</h4>
                <p className="text-sm text-red-700">
                  This is a prototype screening tool for demonstration purposes only. 
                  It is NOT a diagnostic instrument. Results should be reviewed with 
                  a qualified healthcare professional.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WebcamScreening;