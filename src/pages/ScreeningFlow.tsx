import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import EyeContactModule from '@/components/modules/EyeContactModule';
import NameResponseModule from '@/components/modules/NameResponseModule';
import VocalizationModule from '@/components/modules/VocalizationModule';
import GesturesModule from '@/components/modules/GesturesModule';
import RepetitiveBehaviorModule from '@/components/modules/RepetitiveBehaviorModule';
import { simulateBehavioralAnalysis } from '@/lib/behavioralEngine';
import type {
  ScreeningState,
  EyeContactResult,
  NameResponseResult,
  VocalizationResult,
  GesturesResult,
  RepetitiveBehaviorResult,
  ScreeningPayload,
  ScreeningResponse
} from '@/types/screening';

type ScreeningStep = 'age' | 'eyeContact' | 'nameResponse' | 'vocalization' | 'gestures' | 'repetitive' | 'processing';

export default function ScreeningFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ScreeningStep>('age');
  const [screeningData, setScreeningData] = useState<ScreeningState>({});
  const [ageMonths, setAgeMonths] = useState<string>('');

  const stepConfig = {
    age: { number: 0, label: 'Age Information' },
    eyeContact: { number: 1, label: 'Eye Contact' },
    nameResponse: { number: 2, label: 'Name Response' },
    vocalization: { number: 3, label: 'Vocalization' },
    gestures: { number: 4, label: 'Gestures' },
    repetitive: { number: 5, label: 'Repetitive Behaviors' },
    processing: { number: 6, label: 'Processing' }
  };

  const totalSteps = 6;
  const progress = (stepConfig[currentStep].number / totalSteps) * 100;

  const handleAgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const months = parseInt(ageMonths);
    if (months && months > 0 && months <= 36) {
      setScreeningData({ ...screeningData, ageMonths: months });
      setCurrentStep('eyeContact');
    }
  };

  const handleEyeContactComplete = (result: EyeContactResult) => {
    setScreeningData({ ...screeningData, eyeContactResult: result });
    setCurrentStep('nameResponse');
  };

  const handleNameResponseComplete = (result: NameResponseResult) => {
    setScreeningData({ ...screeningData, nameResponseResult: result });
    setCurrentStep('vocalization');
  };

  const handleVocalizationComplete = (result: VocalizationResult) => {
    setScreeningData({ ...screeningData, vocalizationResult: result });
    setCurrentStep('gestures');
  };

  const handleGesturesComplete = (result: GesturesResult) => {
    setScreeningData({ ...screeningData, gesturesResult: result });
    setCurrentStep('repetitive');
  };

  const handleRepetitiveComplete = async (result: RepetitiveBehaviorResult) => {
    const finalData = { ...screeningData, repetitiveBehaviorResult: result };
    setScreeningData(finalData);
    setCurrentStep('processing');

    // Submit to API
    await submitScreening(finalData);
  };

  const submitScreening = async (data: ScreeningState) => {
    try {
      const payload: ScreeningPayload = {
        age_months: data.ageMonths!,
        eye_contact_score: data.eyeContactResult!.eye_contact_score,
        response_to_name_score: data.nameResponseResult!.response_to_name_score,
        response_latency_ms: data.nameResponseResult!.response_latency_ms,
        vocalization_score: data.vocalizationResult!.vocalization_score,
        gesture_joint_attention_score: data.gesturesResult!.gesture_joint_attention_score,
        repetitive_behavior_score: data.repetitiveBehaviorResult!.repetitive_behavior_score
      };

      // Call mock API (for now, we'll use a mock scoring function)
      const response = await mockScreeningAPI(payload);
      
      // Navigate to results page with data
      navigate('/results', { state: { screeningResult: response, screeningData: payload } });
    } catch (error) {
      console.error('Error submitting screening:', error);
      // Handle error - for now just navigate with mock data
      navigate('/results', { state: { error: true } });
    }
  };

  const mockScreeningAPI = async (payload: ScreeningPayload): Promise<ScreeningResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Use behavioral engine for realistic analysis
    const behavioralAnalysis = simulateBehavioralAnalysis(60);

    // Calculate domain scores (0-100, higher = more concern)
    // Integrate behavioral engine metrics with screening scores
    const socialScore = payload.eye_contact_score * 50; // 0, 50, 100
    const responseScore = payload.response_to_name_score * 50;
    const vocalScore = payload.vocalization_score * 50;
    const repetitiveScore = payload.repetitive_behavior_score * 50;
    const gesturesScore = payload.gesture_joint_attention_score * 50;

    // Factor in behavioral engine engagement (inverse correlation)
    const engagementFactor = behavioralAnalysis.scores.engagementScore;
    const adjustedSocialScore = Math.round(socialScore * (2 - engagementFactor));

    // Calculate overall risk score (weighted average)
    const riskScore = Math.round(
      adjustedSocialScore * 0.30 +
      responseScore * 0.20 +
      vocalScore * 0.20 +
      repetitiveScore * 0.20 +
      gesturesScore * 0.10
    );

    // Determine risk band
    let riskBand: 'Low' | 'Moderate' | 'High';
    if (riskScore < 30) {
      riskBand = 'Low';
    } else if (riskScore < 60) {
      riskBand = 'Moderate';
    } else {
      riskBand = 'High';
    }

    // Generate flags with behavioral insights
    const flags: string[] = [];
    
    if (payload.eye_contact_score === 2) {
      flags.push('Limited eye contact observed during interaction');
    }
    if (payload.response_to_name_score === 2) {
      flags.push('Did not respond when name was called');
    }
    if (payload.vocalization_score === 2) {
      flags.push('Very limited vocalization or babbling');
    }
    if (payload.gesture_joint_attention_score === 2) {
      flags.push('Limited use of gestures and joint attention');
    }
    if (payload.repetitive_behavior_score === 2) {
      flags.push('Multiple repetitive behavior patterns observed');
    }

    // Add behavioral engine insights
    if (behavioralAnalysis.scores.dominantFocus === 'geometric') {
      flags.push('Showed preference for geometric patterns over social stimuli');
    }
    if (behavioralAnalysis.scores.engagementLevel === 'low') {
      flags.push('Engagement was relatively low during observation periods');
    }
    if (behavioralAnalysis.scores.attentionFlexibility === 'low') {
      flags.push('Limited attention shifting between different stimuli');
    }

    return {
      risk_score: riskScore,
      risk_band: riskBand,
      flags,
      domain_scores: {
        social: adjustedSocialScore,
        response: responseScore,
        vocal: vocalScore,
        repetitive: repetitiveScore,
        gestures: gesturesScore
      }
    };
  };

  const handleBack = () => {
    const steps: ScreeningStep[] = ['age', 'eyeContact', 'nameResponse', 'vocalization', 'gestures', 'repetitive'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Autism Risk Screening</h1>
          </div>
          <p className="text-gray-600">5-Module Behavioral Assessment</p>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{stepConfig[currentStep].label}</span>
                <span>Step {stepConfig[currentStep].number} of {totalSteps}</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <div className="animate-in fade-in duration-300">
          {currentStep === 'age' && (
            <Card>
              <CardHeader>
                <CardTitle>Child's Age</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAgeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Child's age in months (1-36)</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="36"
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(e.target.value)}
                      placeholder="e.g., 24"
                      className="max-w-xs"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      This screening is designed for children aged 1-36 months (under 3 years)
                    </p>
                  </div>
                  <Button type="submit" size="lg">
                    Begin Screening
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {currentStep === 'eyeContact' && (
            <EyeContactModule 
              onComplete={handleEyeContactComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 'nameResponse' && (
            <NameResponseModule 
              onComplete={handleNameResponseComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 'vocalization' && (
            <VocalizationModule 
              onComplete={handleVocalizationComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 'gestures' && (
            <GesturesModule 
              onComplete={handleGesturesComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 'repetitive' && (
            <RepetitiveBehaviorModule 
              onComplete={handleRepetitiveComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 'processing' && (
            <Card className="border-blue-200">
              <CardContent className="text-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold mb-2">Processing Results</h3>
                <p className="text-gray-600">
                  Analyzing behavioral patterns and calculating risk assessment...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
