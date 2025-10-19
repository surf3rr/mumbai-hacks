import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Eye,
  Mic,
  Activity,
  Users
} from 'lucide-react';

interface BehavioralFlag {
  category: string;
  status: 'normal' | 'attention' | 'concern';
  message: string;
}

interface AnalysisDetail {
  score: number;
  details: string;
}

interface AssessmentResults {
  riskScore: number;
  riskLevel: string;
  riskColor: string;
  flags: BehavioralFlag[];
  analysis: {
    gazeTracking: AnalysisDetail;
    audioAnalysis: AnalysisDetail;
    behaviorPatterns: AnalysisDetail;
    socialInteraction: AnalysisDetail;
  };
  recommendations: string[];
}

export default function Results() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const navigate = useNavigate();

  // Simulate AI analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setResults({
        riskScore: 72,
        riskLevel: 'Moderate',
        riskColor: 'amber',
        flags: [
          { category: 'Gaze Patterns', status: 'attention', message: 'Reduced eye contact during name calling' },
          { category: 'Social Engagement', status: 'normal', message: 'Appropriate response to toy presentation' },
          { category: 'Communication', status: 'attention', message: 'Limited vocalization patterns observed' },
          { category: 'Motor Behaviors', status: 'normal', message: 'Typical movement and coordination' }
        ],
        analysis: {
          gazeTracking: {
            score: 65,
            details: 'Eye contact initiated 40% of the time when name was called. Gaze duration averaged 2.3 seconds.'
          },
          audioAnalysis: {
            score: 70,
            details: 'Vocalization frequency below typical range. Response latency to auditory stimuli: 3.2 seconds average.'
          },
          behaviorPatterns: {
            score: 80,
            details: 'Play behaviors show good exploration and object manipulation. No significant repetitive behaviors observed.'
          },
          socialInteraction: {
            score: 75,
            details: 'Some attempts at social engagement. Responds to presence of others but with reduced frequency.'
          }
        },
        recommendations: [
          'Consider consultation with a pediatric developmental specialist',
          'Continue monitoring social communication development',
          'Engage in structured play activities that encourage eye contact',
          'Follow up assessment in 3-6 months to track progress'
        ]
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadReport = () => {
    // In a real implementation, this would generate and download a PDF
    alert('Report download functionality would be implemented here');
  };

  const handleRetakeTest = () => {
    navigate('/');
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'moderate': return 'text-amber-700 bg-amber-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'attention': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'concern': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto space-y-8 pt-20">
          <div className="text-center space-y-4">
            <Brain className="h-16 w-16 text-blue-600 mx-auto animate-pulse" />
            <h1 className="text-3xl font-bold text-gray-900">Analyzing Assessment Data</h1>
            <p className="text-gray-600">Our AI system is processing the behavioral observations...</p>
          </div>

          <Card>
            <CardContent className="py-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing video analysis</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-2">
                    <Eye className="h-6 w-6 text-blue-600 mx-auto" />
                    <p className="text-sm text-gray-600">Gaze Tracking</p>
                  </div>
                  <div className="space-y-2">
                    <Mic className="h-6 w-6 text-green-600 mx-auto" />
                    <p className="text-sm text-gray-600">Audio Analysis</p>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-500">
                  This may take a few moments. Please wait...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <Brain className="h-10 w-10 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
          <p className="text-gray-600">AI-powered behavioral analysis complete</p>
        </div>

        {/* Risk Score */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle>Overall Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${results.riskScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{results.riskScore}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge className={`text-lg px-4 py-2 ${getRiskLevelColor(results.riskLevel)}`}>
                {results.riskLevel} Risk Level
              </Badge>
              <p className="text-sm text-gray-600">
                Score range: 0-100 (higher scores indicate areas requiring attention)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Behavioral Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.flags.map((flag: BehavioralFlag, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                {getStatusIcon(flag.status)}
                <div className="flex-1">
                  <h4 className="font-semibold">{flag.category}</h4>
                  <p className="text-sm text-gray-600">{flag.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Gaze Tracking</h4>
                  <Badge variant="outline">{results.analysis.gazeTracking.score}/100</Badge>
                </div>
                <p className="text-sm text-gray-600">{results.analysis.gazeTracking.details}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mic className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Audio Analysis</h4>
                  <Badge variant="outline">{results.analysis.audioAnalysis.score}/100</Badge>
                </div>
                <p className="text-sm text-gray-600">{results.analysis.audioAnalysis.details}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold">Behavior Patterns</h4>
                  <Badge variant="outline">{results.analysis.behaviorPatterns.score}/100</Badge>
                </div>
                <p className="text-sm text-gray-600">{results.analysis.behaviorPatterns.details}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold">Social Interaction</h4>
                  <Badge variant="outline">{results.analysis.socialInteraction.score}/100</Badge>
                </div>
                <p className="text-sm text-gray-600">{results.analysis.socialInteraction.details}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {results.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This assessment is a screening tool and not a diagnostic instrument. 
            These results should be discussed with a qualified healthcare professional for proper interpretation 
            and next steps. Early intervention and professional evaluation are key to supporting your child's development.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pb-8">
          <Button 
            onClick={handleDownloadReport}
            className="flex-1"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Detailed Report
          </Button>
          <Button 
            onClick={handleRetakeTest}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Take Assessment Again
          </Button>
        </div>
      </div>
    </div>
  );
}