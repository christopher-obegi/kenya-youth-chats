import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck } from 'lucide-react';

// PHQ-9 Questions for Depression Screening
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

// PHQ-7 Questions (subset of PHQ-9)
const PHQ7_QUESTIONS = PHQ9_QUESTIONS.slice(0, 7);

const RESPONSE_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" }
];

interface PHQQuestionnaireProps {
  type: 'phq7' | 'phq9';
  onComplete: (results: any) => void;
  onSkip: () => void;
}

export function PHQQuestionnaire({ type, onComplete, onSkip }: PHQQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);

  const questions = type === 'phq9' ? PHQ9_QUESTIONS : PHQ7_QUESTIONS;
  const maxScore = questions.length * 3;
  const title = type === 'phq9' ? 'Depression Screening (PHQ-9)' : 'Depression Screening (PHQ-7)';
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);

    // Auto advance to next question
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => calculateResults(newResponses), 300);
    }
  };

  const calculateResults = (finalResponses: number[]) => {
    const totalScore = finalResponses.reduce((sum, score) => sum + score, 0);
    
    let severity: string;
    let recommendations: string[];

    if (type === 'phq9') {
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
      } else if (totalScore <= 19) {
        severity = 'Moderately Severe';
        recommendations = [
          'Your responses suggest moderately severe depression symptoms.',
          'We strongly recommend professional mental health support.',
          'Treatment can significantly improve your quality of life.'
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
      // PHQ-7 scoring
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
    }

    const results = {
      type: type,
      score: totalScore,
      severity,
      responses: finalResponses,
      recommendations,
      interpretation: `Score: ${totalScore}/${maxScore} - ${severity} depression symptoms`,
      completedAt: new Date().toISOString()
    };

    onComplete(results);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ClipboardCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-muted-foreground">
            Over the last 2 weeks, how often have you been bothered by any of the following problems?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-relaxed">
              {questions[currentQuestion]}
            </h3>

            <RadioGroup 
              value={responses[currentQuestion]?.toString() || ''} 
              onValueChange={(value) => handleResponse(parseInt(value))}
              className="space-y-3"
            >
              {RESPONSE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem 
                    value={option.value.toString()} 
                    id={`phq_${currentQuestion}_${option.value}`}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={`phq_${currentQuestion}_${option.value}`}
                    className="flex-1 leading-relaxed cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                onClick={onSkip}
              >
                Skip Assessment
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {responses[currentQuestion] !== undefined ? 'Click to continue automatically' : 'Select an answer to continue'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}