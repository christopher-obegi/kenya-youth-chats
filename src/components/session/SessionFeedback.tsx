import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Heart, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SessionFeedbackProps {
  appointmentId: string;
  therapistId: string;
  therapistName: string;
  onFeedbackSubmitted: () => void;
}

export function SessionFeedback({ 
  appointmentId, 
  therapistId, 
  therapistName, 
  onFeedbackSubmitted 
}: SessionFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create feedback record (you'll need to create this table)
      const { error: feedbackError } = await supabase
        .from('session_feedback')
        .insert({
          appointment_id: appointmentId,
          therapist_id: therapistId,
          rating: rating,
          feedback: feedback.trim() || null
        });

      if (feedbackError) throw feedbackError;

      // Update appointment status to completed
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (appointmentError) throw appointmentError;

      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully",
      });

      onFeedbackSubmitted();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>How was your session?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your feedback helps us improve our services and helps other clients find the right therapist.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium mb-2">Session with {therapistName}</p>
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor - Not satisfied"}
              {rating === 2 && "Fair - Below expectations"}
              {rating === 3 && "Good - Met expectations"}
              {rating === 4 && "Very Good - Exceeded expectations"}
              {rating === 5 && "Excellent - Outstanding experience"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback">Additional Comments (Optional)</Label>
          <Textarea
            id="feedback"
            placeholder="Share your experience, what went well, or suggestions for improvement..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onFeedbackSubmitted}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            onClick={submitFeedback}
            disabled={isSubmitting || rating === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}