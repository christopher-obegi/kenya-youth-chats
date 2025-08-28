import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// PHQ-7 Questions for Depression Screening
const PHQ7_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things, such as reading or watching television"
];

// GAD-7 Questions for Anxiety Screening
const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

const RESPONSE_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" }
];

interface QuestionnaireProps {
  type: 'phq7' | 'gad7';
  onComplete: (results: QuestionnaireResults) => void;
  onSkip?: () => void;
}

interface QuestionnaireResults {
  score: number;
  severity: string;
  responses: number[];
  recommendations: string[];
}

export function MentalHealthQuestionnaire({ type, onComplete, onSkip }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const questions = type === 'phq7' ? PHQ7_QUESTIONS : GAD7_QUESTIONS;
  const title = type === 'phq7' ? 'Depression Screening (PHQ-7)' : 'Anxiety Screening (GAD-7)';
  const description = type === 'phq7' 
    ? 'Over the last 2 weeks, how often have you been bothered by any of the following problems?'
    : 'Over the last 2 weeks, how often have you been bothered by the following problems?';

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = async () => {
    const totalScore = responses.reduce((sum, score) => sum + score, 0);
    
    let severity: string;
    let recommendations: string[];

    if (type === 'phq7') {
      if (totalScore <= 4) {
        severity = 'Minimal';
        recommendations = [
          'Your responses suggest minimal depression symptoms.',
          'Continue with healthy lifestyle habits.',
          'Consider speaking with a counselor for general wellness.'
        ];
      } else if (totalScore <= 9) {
        severity = 'Mild';
        recommendations = [
          'Your responses suggest mild depression symptoms.',
          'Consider speaking with a mental health professional.',
          'Regular exercise and social connection can help.'
        ];
      } else if (totalScore <= 14) {
        severity = 'Moderate';
        recommendations = [
          'Your responses suggest moderate depression symptoms.',
          'We recommend speaking with a therapist or counselor.',
          'Professional support can make a significant difference.'
        ];
      } else {
        severity = 'Severe';
        recommendations = [
          'Your responses suggest severe depression symptoms.',
          'Please consider speaking with a mental health professional immediately.',
          'You deserve support - help is available.'
        ];
      }
    } else {
      if (totalScore <= 4) {
        severity = 'Minimal';
        recommendations = [
          'Your responses suggest minimal anxiety symptoms.',
          'Continue with stress management techniques.',
          'Consider mindfulness or relaxation practices.'
        ];
      } else if (totalScore <= 9) {
        severity = 'Mild';
        recommendations = [
          'Your responses suggest mild anxiety symptoms.',
          'Consider speaking with a mental health professional.',
          'Breathing exercises and regular exercise can help.'
        ];
      } else if (totalScore <= 14) {
        severity = 'Moderate';
        recommendations = [
          'Your responses suggest moderate anxiety symptoms.',
          'We recommend speaking with a therapist or counselor.',
          'Professional support can help you manage anxiety effectively.'
        ];
      } else {
        severity = 'Severe';
        recommendations = [
          'Your responses suggest severe anxiety symptoms.',
          'Please consider speaking with a mental health professional immediately.',
          'Effective treatments are available to help you feel better.'
        ];
      }
    }

    const results: QuestionnaireResults = {
      score: totalScore,
      severity,
      responses,
      recommendations
    };

    // Save results to database
    if (user) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('questionnaire_responses')
          .insert({
            user_id: user.id,
            questionnaire_type: type,
            responses: responses,
            score: totalScore,
            severity: severity
          });

        if (error) throw error;
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to save questionnaire results",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }

    onComplete(results);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Progress value={progress} className="mt-4" />
        <p className="text-xs text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-relaxed">
            {questions[currentQuestion]}
          </h3>
          
          <RadioGroup
            value={responses[currentQuestion]?.toString()}
            onValueChange={(value) => handleResponse(parseInt(value))}
          >
            {RESPONSE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Skip Assessment
              </Button>
            )}
            <Button
              onClick={nextQuestion}
              disabled={responses[currentQuestion] === undefined || isSubmitting}
            >
              {currentQuestion === questions.length - 1 ? (
                isSubmitting ? 'Calculating...' : 'Complete Assessment'
              ) : (
                'Next Question'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Results Display Component
interface QuestionnaireResultsProps {
  results: QuestionnaireResults;
  type: 'phq7' | 'gad7';
  onFindTherapist: () => void;
  onRetakeAssessment: () => void;
}

export function QuestionnaireResults({ 
  results, 
  type, 
  onFindTherapist, 
  onRetakeAssessment 
}: QuestionnaireResultsProps) {
  const title = type === 'phq7' ? 'Depression Assessment Results' : 'Anxiety Assessment Results';
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minimal': return 'text-green-600 bg-green-50 border-green-200';
      case 'mild': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'severe': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getSeverityColor(results.severity)}`}>
            <span className="font-semibold">
              {results.severity} ({results.score}/{type === 'phq7' ? '21' : '21'})
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Recommendations:</h3>
          <ul className="space-y-2">
            {results.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> This assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing thoughts of self-harm, please contact emergency services immediately.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onRetakeAssessment} className="flex-1">
            Retake Assessment
          </Button>
          <Button onClick={onFindTherapist} className="flex-1">
            Find a Therapist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}