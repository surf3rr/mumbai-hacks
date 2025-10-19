import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface AudioCaptureProps {
  onReady?: () => void;
  isRecording?: boolean;
  showVisualizer?: boolean;
}

export default function AudioCapture({ 
  onReady, 
  isRecording = false, 
  showVisualizer = true 
}: AudioCaptureProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    startAudioCapture();
    return () => {
      stopAudioCapture();
    };
  }, []);

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio context and analyser
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      
      setIsActive(true);
      setError(null);
      
      // Start audio level monitoring
      monitorAudioLevel();
      
      // Call onReady after a short delay
      setTimeout(() => {
        onReady?.();
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  const stopAudioCapture = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsActive(false);
    setAudioLevel(0);
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average audio level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedLevel = (average / 255) * 100;
      
      setAudioLevel(normalizedLevel);
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const getAudioLevelColor = (level: number) => {
    if (level < 20) return 'bg-gray-300';
    if (level < 50) return 'bg-green-500';
    if (level < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAudioLevelText = (level: number) => {
    if (level < 10) return 'Very Quiet';
    if (level < 30) return 'Quiet';
    if (level < 60) return 'Good';
    if (level < 80) return 'Loud';
    return 'Very Loud';
  };

  return (
    <Card className="p-6">
      {error ? (
        <div className="text-center space-y-4">
          <MicOff className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mic className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-medium">
                {isActive ? 'Microphone Active' : 'Microphone Inactive'}
              </span>
            </div>
            
            {isRecording && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}
          </div>

          {/* Audio Visualizer */}
          {showVisualizer && isActive && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Volume2 className="h-4 w-4 text-gray-600" />
                <div className="flex-1">
                  <Progress 
                    value={audioLevel} 
                    className={`h-3 ${getAudioLevelColor(audioLevel)}`}
                  />
                </div>
                <span className="text-sm text-gray-600 w-20">
                  {getAudioLevelText(audioLevel)}
                </span>
              </div>
              
              {/* Audio Level Bars */}
              <div className="flex items-end justify-center space-x-1 h-16">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 transition-all duration-100 ${
                      audioLevel > (i * 5) 
                        ? getAudioLevelColor(audioLevel)
                        : 'bg-gray-200'
                    }`}
                    style={{
                      height: `${Math.max(4, (audioLevel > (i * 5) ? audioLevel / 5 : 1))}px`
                    }}
                  />
                ))}
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Speak normally to test audio levels
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}