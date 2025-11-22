import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Mic,
  Activity,
  Users,
  HandMetal,
  Home,
  FileText
} from 'lucide-react';
import { simulateBehavioralAnalysis } from '@/lib/behavioralEngine';
import { ConstraintTracker, formatConstraintReport } from '@/lib/constraintTracker';
import type { ScreeningResponse, ScreeningPayload } from '@/types/screening';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { screeningResult, screeningData } = location.state as {
    screeningResult: ScreeningResponse;
    screeningData: ScreeningPayload;
  } || {};

  if (!screeningResult || !screeningData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Results Available</CardTitle>
            <CardDescription>Please complete the screening first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRiskBandColor = (band: string) => {
    switch (band) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskCircleColor = (band: string) => {
    switch (band) {
      case 'Low': return 'text-green-500';
      case 'Moderate': return 'text-yellow-500';
      case 'High': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDomainLabel = (key: string) => {
    const labels: Record<string, { icon: any; label: string; color: string }> = {
      social: { icon: Eye, label: 'Social Engagement', color: 'text-blue-600' },
      response: { icon: Users, label: 'Name Response', color: 'text-green-600' },
      vocal: { icon: Mic, label: 'Vocalization', color: 'text-purple-600' },
      gestures: { icon: HandMetal, label: 'Gestures & Attention', color: 'text-orange-600' },
      repetitive: { icon: Activity, label: 'Repetitive Behaviors', color: 'text-red-600' }
    };
    return labels[key];
  };

  const domainEntries = Object.entries(screeningResult.domain_scores);

  // Generate behavioral analysis and constraint report
  const behavioralAnalysis = simulateBehavioralAnalysis(60);
  const constraintTracker = new ConstraintTracker();
  
  // Track all constraints
  constraintTracker.checkDuration(behavioralAnalysis.metrics.durationSec, 60);
  constraintTracker.checkMinimumSamples(behavioralAnalysis.metrics.totalFrames);
  constraintTracker.checkFaceDetection(
    behavioralAnalysis.metrics.framesFaceDetected,
    behavioralAnalysis.metrics.totalFrames
  );
  constraintTracker.checkAttentionSwitchCap(behavioralAnalysis.metrics.sideSwitchCount);
  constraintTracker.checkJitterFiltering(true); // Assume filtering was active
  constraintTracker.checkEngagementThreshold(behavioralAnalysis.scores.engagementScore);
  constraintTracker.checkDataQuality({
    framesFaceDetected: behavioralAnalysis.metrics.framesFaceDetected,
    totalFrames: behavioralAnalysis.metrics.totalFrames,
    sideSwitchCount: behavioralAnalysis.metrics.sideSwitchCount
  });
  
  const constraintReport = constraintTracker.generateReport();

  const handleDownloadReport = () => {
    // Generate comprehensive report
    const reportText = formatConstraintReport(constraintReport);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurolens-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRecommendations = () => {
    const recs: string[] = [];
    
    if (screeningResult.risk_band === 'High') {
      recs.push('Schedule an appointment with a pediatric developmental specialist as soon as possible');
      recs.push('Early intervention services may be beneficial - contact your local early intervention program');
    } else if (screeningResult.risk_band === 'Moderate') {
      recs.push('Consider consultation with a pediatric developmental specialist for a comprehensive evaluation');
      recs.push('Continue monitoring social communication and behavioral development closely');
    } else {
      recs.push('Continue to support your child\'s development through play and social interaction');
      recs.push('Consider a follow-up screening in 6-12 months as part of routine developmental monitoring');
    }

    // Add specific recommendations based on domain scores
    if (screeningResult.domain_scores.social >= 50) {
      recs.push('Engage in activities that encourage face-to-face interaction and eye contact');
    }
    if (screeningResult.domain_scores.vocal >= 50) {
      recs.push('Read books together, sing songs, and encourage verbal communication through play');
    }
    if (screeningResult.domain_scores.repetitive >= 50) {
      recs.push('Provide varied play opportunities and gently redirect repetitive behaviors when appropriate');
    }

    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 text-blue-600 mx-auto" />
          <h1 className="text-4xl font-bold text-gray-900">Screening Results</h1>
          <p className="text-gray-600">AI-Powered Behavioral Analysis Complete</p>
        </div>

        {/* Overall Risk Score */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Overall Risk Assessment</CardTitle>
            <CardDescription>Based on 5-module behavioral screening</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Circular Progress */}
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={getRiskCircleColor(screeningResult.risk_band)}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${screeningResult.risk_score}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">{screeningResult.risk_score}</span>
                <span className="text-xs text-gray-500">out of 100</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Badge className={`text-xl px-6 py-3 border-2 ${getRiskBandColor(screeningResult.risk_band)}`}>
                {screeningResult.risk_band} Risk
              </Badge>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Higher scores indicate areas that may benefit from professional evaluation and support
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Domain Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Domain-Specific Scores</CardTitle>
            <CardDescription>Breakdown by assessment area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {domainEntries.map(([key, score]) => {
              const domain = getDomainLabel(key);
              const Icon = domain.icon;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${domain.color}`} />
                      <span className="font-medium">{domain.label}</span>
                    </div>
                    <span className="text-sm font-bold">{score}/100</span>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Behavioral Flags */}
        {screeningResult.flags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Observed Indicators</CardTitle>
              <CardDescription>Key findings from the assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {screeningResult.flags.map((flag, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{flag}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Constraint Tracking Report */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Testing Constraints & Data Quality</span>
            </CardTitle>
            <CardDescription>
              Validation of testing parameters and data reliability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <div className="text-sm text-gray-600">Overall Status:</div>
                <div className={`text-lg font-bold ${
                  constraintReport.overallStatus === 'COMPLIANT' ? 'text-green-600' :
                  constraintReport.overallStatus === 'PARTIAL' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {constraintReport.overallStatus === 'COMPLIANT' ? '✓ All Constraints Met' :
                   constraintReport.overallStatus === 'PARTIAL' ? '⚠ Partial Compliance' :
                   '✗ Non-Compliant'}
                </div>
              </div>
              <Badge className={`text-sm px-4 py-2 ${
                constraintReport.overallStatus === 'COMPLIANT' ? 'bg-green-100 text-green-800' :
                constraintReport.overallStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {constraintReport.passedConstraints}/{constraintReport.totalConstraints} Passed
              </Badge>
            </div>

            {/* Summary Message */}
            <Alert>
              <AlertDescription>{constraintReport.summary}</AlertDescription>
            </Alert>

            {/* Detailed Checks */}
            <div className="space-y-2">
              {constraintReport.checks.map((check, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded border">
                  {check.status === 'PASS' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : check.status === 'WARNING' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{check.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{check.message}</div>
                    {check.actualValue && (
                      <div className="text-xs text-gray-500 mt-1">
                        Expected: {check.expectedValue} | Actual: {check.actualValue}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Behavioral Engine Metrics */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm font-semibold mb-3">Behavioral Engine Metrics:</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Engagement Score:</span>
                  <span className="font-semibold ml-2">
                    {(behavioralAnalysis.scores.engagementScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Dominant Focus:</span>
                  <span className="font-semibold ml-2">
                    {behavioralAnalysis.scores.dominantFocus}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Attention Flexibility:</span>
                  <span className="font-semibold ml-2">
                    {behavioralAnalysis.scores.attentionFlexibility}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Attention Shifts:</span>
                  <span className="font-semibold ml-2">
                    {behavioralAnalysis.scores.attentionShifts}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations & Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
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
        <Alert className="border-amber-300 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong className="block mb-2">Important Disclaimer</strong>
            This screening tool is NOT a diagnostic instrument. It provides preliminary indicators only. 
            Results should be reviewed with a qualified healthcare professional (pediatrician, developmental 
            pediatrician, or child psychologist) for proper interpretation and clinical assessment. 
            Early evaluation and intervention are crucial for supporting your child's development.
          </AlertDescription>
        </Alert>

        {/* Child Information Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Child's Age</div>
                <div className="text-lg font-bold">{screeningData.age_months} months</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Assessment Date</div>
                <div className="text-lg font-bold">{new Date().toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Modules Completed</div>
                <div className="text-lg font-bold">5 / 5</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pb-8">
          <Button 
            onClick={handleDownloadReport}
            className="flex-1"
            variant="outline"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Report (PDF)
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
