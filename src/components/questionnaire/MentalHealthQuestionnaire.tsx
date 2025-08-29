import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PHQQuestionnaire } from './PHQQuestionnaire';
import { GADQuestionnaire } from './GADQuestionnaire';
import { WHOAssistQuestionnaire } from './WHOAssistQuestionnaire';

export type QuestionnaireType = 'phq7' | 'phq9' | 'gad7' | 'who_assist';

export interface QuestionnaireResults {
  type: string;
  score: number;
  severity: string;
  responses: any;
  interpretation?: string;
  recommendations?: string[];
  completedAt?: string;
}

interface MentalHealthQuestionnaireProps {
  type: QuestionnaireType;
  onComplete: (results: QuestionnaireResults) => void;
  onSkip?: () => void;
}

export function MentalHealthQuestionnaire({ type, onComplete, onSkip }: MentalHealthQuestionnaireProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleComplete = async (results: any) => {
    // Save results to database
    if (user) {
      try {
        const { error } = await supabase
          .from('questionnaire_responses')
          .insert({
            user_id: user.id,
            questionnaire_type: results.type,
            responses: results.responses,
            score: results.score,
            severity: results.severity
          });

        if (error) throw error;
        
        toast({
          title: "Assessment Completed",
          description: "Your responses have been saved successfully.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to save questionnaire results",
          variant: "destructive"
        });
      }
    }

    onComplete(results);
  };

  const renderQuestionnaire = () => {
    switch (type) {
      case 'phq7':
      case 'phq9':
        return <PHQQuestionnaire onComplete={handleComplete} onSkip={onSkip} type={type} />;
      case 'gad7':
        return <GADQuestionnaire onComplete={handleComplete} onSkip={onSkip} />;
      case 'who_assist':
        return <WHOAssistQuestionnaire onComplete={handleComplete} onSkip={onSkip} />;
      default:
        return <PHQQuestionnaire onComplete={handleComplete} onSkip={onSkip} type="phq9" />;
    }
  };

  return renderQuestionnaire();
}