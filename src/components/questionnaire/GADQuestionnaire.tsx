import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck } from 'lucide-react';

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

interface GADQuestionnaireProps {
  onComplete: (results: any) => void;
  onSkip: () => void;
}

export function GADQuestionnaire({ onComplete, onSkip }: GADQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);

  const progress = ((currentQuestion + 1) / GAD7_QUESTIONS.length) * 100;

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);

    // Auto advance to next question
    if (currentQuestion < GAD7_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => calculateResults(newResponses), 300);
    }
  };

  const calculateResults = (finalResponses: number[]) => {
    const totalScore = finalResponses.reduce((sum, score) => sum + score, 0);
    
    let severity: string;
    let recommendations: string[];

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

    const results = {
      type: 'gad7',
      score: totalScore,
      severity,
      responses: finalResponses,
      recommendations,
      interpretation: `Score: ${totalScore}/21 - ${severity} anxiety symptoms`,
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
          <CardTitle className="text-2xl">Anxiety Screening (GAD-7)</CardTitle>
          <p className="text-muted-foreground">
            Over the last 2 weeks, how often have you been bothered by the following problems?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {GAD7_QUESTIONS.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-relaxed">
              {GAD7_QUESTIONS[currentQuestion]}
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
                    id={`gad_${currentQuestion}_${option.value}`}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={`gad_${currentQuestion}_${option.value}`}
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