import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MpesaPayment } from '@/components/payment/MpesaPayment';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, MessageCircle, Video, Phone, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Therapist {
  id: string;
  user_id: string;
  bio: string;
  education: string;
  hourly_rate: number;
  years_experience: number;
  location: string;
  specialization: string[];
  languages: string[];
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapist: Therapist;
  onBookingConfirm: (bookingData: BookingData) => void;
}

export interface BookingData {
  therapistId: string;
  date: Date;
  timeSlot: string;
  sessionType: 'chat' | 'video' | 'audio';
  duration: number;
  notes: string;
  totalAmount: number;
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const SESSION_TYPES = [
  { value: 'chat', label: 'Text Chat', icon: MessageCircle, description: 'Secure text messaging' },
  { value: 'video', label: 'Video Call', icon: Video, description: 'Face-to-face session' },
  { value: 'audio', label: 'Voice Call', icon: Phone, description: 'Audio-only session' }
];

export function BookingModal({ isOpen, onClose, therapist, onBookingConfirm }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState<'chat' | 'video' | 'audio'>('chat');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalAmount = (therapist.hourly_rate * duration) / 60;
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // Create appointment record
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          therapist_id: therapist.user_id,
          scheduled_at: scheduledDateTime.toISOString(),
          duration: duration,
          status: 'pending',
          notes: notes || null,
          session_type: sessionType
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      setBookingId(appointment.id);
      setShowPayment(true);

    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create appointment",
        variant: "destructive"
      });
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    toast({
      title: "Payment Successful",
      description: "Your session has been booked successfully!",
    });
    onClose();
    // Optionally redirect to dashboard or session page
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    });
  };

  const totalAmount = selectedDate && selectedTime ? (therapist.hourly_rate * duration) / 60 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {showPayment ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
            </DialogHeader>
            <MpesaPayment
              amount={totalAmount}
              bookingId={bookingId}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </>
        ) : (
          <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5" />
            Book Session with {therapist.profiles?.first_name} {therapist.profiles?.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Therapist Info */}
          <Card className="bg-gradient-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">
                    {therapist.profiles?.first_name?.[0]}{therapist.profiles?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">
                    {therapist.profiles?.first_name} {therapist.profiles?.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    KES {therapist.hourly_rate}/hour • {therapist.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Time</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="h-12"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Session Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Session Type</Label>
            <RadioGroup value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
              <div className="grid gap-3">
                {SESSION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label 
                        htmlFor={type.value} 
                        className="flex items-center gap-3 flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Session Duration</Label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-medium">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Share any specific concerns or topics you'd like to discuss..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Payment Summary */}
          {totalAmount > 0 && (
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-medium">Total Amount</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    KES {totalAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedDate && format(selectedDate, 'EEEE, MMMM do')} at {selectedTime} • {duration} minutes
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}