import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Smartphone, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MpesaPaymentProps {
  amount: number;
  bookingId: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

export function MpesaPayment({ amount, bookingId, onPaymentSuccess, onPaymentError }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiated' | 'checking' | 'success' | 'failed'>('idle');
  const { toast } = useToast();

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Convert to international format
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    return formatted.length === 12 && formatted.startsWith('254');
  };

  const initiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (e.g., 0700000000)",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('initiated');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          booking_id: bookingId,
          amount: amount,
          phone: formattedPhone,
          status: 'pending'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Call M-Pesa STK Push via edge function
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: formattedPhone,
          amount: amount,
          account_reference: payment.id,
          transaction_desc: `Therapy Session Payment - ${bookingId}`
        }
      });

      if (error) throw error;

      if (data.success) {
        setPaymentStatus('checking');
        toast({
          title: "Payment Initiated",
          description: "Please check your phone and enter your M-Pesa PIN to complete the payment.",
        });

        // Start polling for payment status
        pollPaymentStatus(payment.id);
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('failed');
      onPaymentError(error.message || 'Failed to initiate payment');
      toast({
        title: "Payment Failed",
        description: error.message || 'Failed to initiate payment',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const { data: payment, error } = await supabase
          .from('payments')
          .select('status, mpesa_receipt')
          .eq('id', paymentId)
          .single();

        if (error) throw error;

        if (payment.status === 'completed') {
          setPaymentStatus('success');
          onPaymentSuccess(paymentId);
          toast({
            title: "Payment Successful",
            description: `Payment completed. Receipt: ${payment.mpesa_receipt}`,
          });
          return;
        } else if (payment.status === 'failed') {
          setPaymentStatus('failed');
          onPaymentError('Payment was cancelled or failed');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          setPaymentStatus('failed');
          onPaymentError('Payment timeout - please try again');
        }
      } catch (error: any) {
        console.error('Status check error:', error);
        setPaymentStatus('failed');
        onPaymentError('Failed to check payment status');
      }
    };

    checkStatus();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          M-Pesa Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            KES {amount.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Therapy Session Payment</p>
        </div>

        {paymentStatus === 'idle' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0700000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Enter your M-Pesa registered phone number
              </p>
            </div>

            <Button 
              onClick={initiatePayment}
              disabled={isProcessing || !phoneNumber}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay with M-Pesa'
              )}
            </Button>
          </>
        )}

        {paymentStatus === 'initiated' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Initiating M-Pesa payment request...
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'checking' && (
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Payment request sent to your phone. Please check your phone and enter your M-Pesa PIN to complete the payment.
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment completed successfully! Your session is now confirmed.
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'failed' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Payment failed or was cancelled. Please try again.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => {
                setPaymentStatus('idle');
                setPhoneNumber('');
              }}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          <Shield className="h-3 w-3 inline mr-1" />
          Secure payment powered by Safaricom M-Pesa
        </div>
      </CardContent>
    </Card>
  );
}