import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck } from 'lucide-react';

const questions = [
  {
    id: 'tobacco',
    text: 'In your life, which of the following substances have you ever used? (NON-MEDICAL USE ONLY) - Tobacco products (cigarettes, chewing tobacco, cigars, etc.)',
    options: [
      { value: 0, label: 'No, never' },
      { value: 3, label: 'Yes, in the past 3 months' },
      { value: 1, label: 'Yes, but not in the past 3 months' }
    ]
  },
  {
    id: 'alcohol',
    text: 'In your life, which of the following substances have you ever used? - Alcoholic beverages (beer, wine, spirits, etc.)',
    options: [
      { value: 0, label: 'No, never' },
      { value: 3, label: 'Yes, in the past 3 months' },
      { value: 1, label: 'Yes, but not in the past 3 months' }
    ]
  },
  {
    id: 'cannabis',
    text: 'In your life, which of the following substances have you ever used? - Cannabis (marijuana, pot, grass, hash, etc.)',
    options: [
      { value: 0, label: 'No, never' },
      { value: 3, label: 'Yes, in the past 3 months' },
      { value: 1, label: 'Yes, but not in the past 3 months' }
    ]
  },
  {
    id: 'cocaine',
    text: 'In your life, which of the following substances have you ever used? - Cocaine (coke, crack, etc.)',
    options: [
      { value: 0, label: 'No, never' },
      { value: 3, label: 'Yes, in the past 3 months' },
      { value: 1, label: 'Yes, but not in the past 3 months' }
    ]
  },
  {
    id: 'stimulants',
    text: 'In your life, which of the following substances have you ever used? - Amphetamine type stimulants (speed, diet pills, ecstasy, etc.)',
    options: [
      { value: 0, label: 'No, never' },
      { value: 3, label: 'Yes, in the past 3 months' },
      { value: 1, label: 'Yes, but not in the past 3 months' }
    ]
  },
  {
    id: 'frequency_tobacco',
    text: 'During the past three months, how often have you used tobacco products?',
    options: [
      { value: 0, label: 'Never' },
      { value: 2, label: 'Once or twice' },
      { value: 3, label: 'Monthly' },
      { value: 4, label: 'Weekly' },
      { value: 6, label: 'Daily or almost daily' }
    ],
    dependsOn: 'tobacco',
    showIf: (responses: any) => responses.tobacco === 3
  },
  {
    id: 'frequency_alcohol',
    text: 'During the past three months, how often have you used alcoholic beverages?',
    options: [
      { value: 0, label: 'Never' },
      { value: 2, label: 'Once or twice' },
      { value: 3, label: 'Monthly' },
      { value: 4, label: 'Weekly' },
      { value: 6, label: 'Daily or almost daily' }
    ],
    dependsOn: 'alcohol',
    showIf: (responses: any) => responses.alcohol === 3
  },
  {
    id: 'urge',
    text: 'During the past three months, how often have you had a strong desire or urge to use any substance?',
    options: [
      { value: 0, label: 'Never' },
      { value: 3, label: 'Once or twice' },
      { value: 4, label: 'Monthly' },
      { value: 5, label: 'Weekly' },
      { value: 6, label: 'Daily or almost daily' }
    ]
  },
  {
    id: 'problems',
    text: 'During the past three months, how often has your use of substances led to health, social, legal or financial problems?',
    options: [
      { value: 0, label: 'Never' },
      { value: 4, label: 'Once or twice' },
      { value: 5, label: 'Monthly' },
      { value: 6, label: 'Weekly' },
      { value: 7, label: 'Daily or almost daily' }
    ]
  },
  {
    id: 'failure',
    text: 'During the past three months, how often have you failed to do what was normally expected of you because of substance use?',
    options: [
      { value: 0, label: 'Never' },
      { value: 5, label: 'Once or twice' },
      { value: 6, label: 'Monthly' },
      { value: 7, label: 'Weekly' },
      { value: 8, label: 'Daily or almost daily' }
    ]
  }
];

interface WHOAssistQuestionnaireProps {
  onComplete: (results: any) => void;
  onSkip: () => void;
}

export function WHOAssistQuestionnaire({ onComplete, onSkip }: WHOAssistQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});

  const visibleQuestions = questions.filter(q => 
    !q.showIf || q.showIf(responses)
  );

  const currentQ = visibleQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / visibleQuestions.length) * 100;

  const handleResponse = (value: number) => {
    const newResponses = { ...responses, [currentQ.id]: value };
    setResponses(newResponses);

    if (currentQuestion < visibleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score and complete
      const totalScore = Object.values(newResponses).reduce((sum, score) => sum + score, 0);
      
      let riskLevel = 'Low risk';
      if (totalScore >= 27) {
        riskLevel = 'High risk';
      } else if (totalScore >= 11) {
        riskLevel = 'Moderate risk';
      }

      const results = {
        type: 'who_assist',
        score: totalScore,
        severity: riskLevel,
        responses: newResponses,
        interpretation: getInterpretation(totalScore),
        completedAt: new Date().toISOString()
      };

      onComplete(results);
    }
  };

  const getInterpretation = (score: number) => {
    if (score >= 27) {
      return 'High risk of substance-related problems. Professional intervention is strongly recommended.';
    } else if (score >= 11) {
      return 'Moderate risk of substance-related problems. Brief intervention and continued monitoring recommended.';
    } else {
      return 'Low risk of substance-related problems. Continue with healthy lifestyle choices.';
    }
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
          <CardTitle className="text-2xl">WHO ASSIST Screening</CardTitle>
          <p className="text-muted-foreground">
            Alcohol, Smoking and Substance Involvement Screening Test
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {visibleQuestions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-relaxed">
              {currentQ.text}
            </h3>

            <RadioGroup 
              value={responses[currentQ.id]?.toString() || ''} 
              onValueChange={(value) => handleResponse(parseInt(value))}
              className="space-y-3"
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem 
                    value={option.value.toString()} 
                    id={`${currentQ.id}_${option.value}`}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={`${currentQ.id}_${option.value}`}
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
              {responses[currentQ.id] !== undefined ? 'Click to continue automatically' : 'Select an answer to continue'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}