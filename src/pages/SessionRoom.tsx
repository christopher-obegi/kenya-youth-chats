import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { SessionFeedback } from '@/components/session/SessionFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  Video, 
  MessageCircle, 
  PhoneOff, 
  VideoOff, 
  Mic, 
  MicOff,
  Settings,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionData {
  id: string;
  patient_id: string;
  therapist_id: string;
  scheduled_at: string;
  duration: number;
  status: string;
  notes?: string;
  session_type?: 'chat' | 'video' | 'audio';
  therapist?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  patient?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const SessionRoom = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!appointmentId) {
      navigate('/dashboard');
      return;
    }
    fetchSessionData();
  }, [appointmentId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStartTime && !sessionEnded) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStartTime, sessionEnded]);

  const fetchSessionData = async () => {
    if (!appointmentId) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Session Not Found",
          description: "The requested session could not be found",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Check if user is authorized to access this session
      if (data.patient_id !== user?.id && data.therapist_id !== user?.id) {
        toast({
          title: "Access Denied",
          description: "You are not authorized to access this session",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Get therapist and patient names separately if needed
      let therapistData = null;
      let patientData = null;

      if (data.therapist_id) {
        const { data: therapistProfile } = await supabase
          .from('therapists')
          .select(`
            profiles!therapists_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('user_id', data.therapist_id)
          .single();
        
        therapistData = therapistProfile?.profiles;
      }

      if (data.patient_id) {
        const { data: patientProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', data.patient_id)
          .single();
        
        patientData = patientProfile;
      }

      setSessionData({
        ...data,
        session_type: (data.session_type || 'chat') as 'chat' | 'video' | 'audio',
        therapist: therapistData,
        patient: patientData
      });
      
      // Auto-start session if it's time
      const sessionTime = new Date(data.scheduled_at);
      const now = new Date();
      const timeDiff = sessionTime.getTime() - now.getTime();
      
      if (timeDiff <= 5 * 60 * 1000 && timeDiff >= -5 * 60 * 1000) { // Within 5 minutes
        setSessionStartTime(new Date());
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    if (!sessionData) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'in_progress' })
        .eq('id', sessionData.id);

      if (error) throw error;

      setSessionStartTime(new Date());
      toast({
        title: "Session Started",
        description: "Your therapy session has begun",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive"
      });
    }
  };

  const endSession = async () => {
    if (!sessionData) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          notes: `Session duration: ${Math.floor(elapsedTime / 60)} minutes`
        })
        .eq('id', sessionData.id);

      if (error) throw error;

      setSessionEnded(true);
      setShowFeedback(true);
      
      toast({
        title: "Session Ended",
        description: "Thank you for your session",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Session not found</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showFeedback) {
  const isPatient = user?.id === sessionData.patient_id;
  const therapistName = sessionData.therapist ? `${sessionData.therapist.first_name} ${sessionData.therapist.last_name}` : 'Therapist';
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SessionFeedback
        appointmentId={sessionData.id}
        therapistId={sessionData.therapist_id}
        therapistName={therapistName}
        onFeedbackSubmitted={() => navigate('/dashboard')}
      />
    </div>
  );
  }

  const isPatient = user?.id === sessionData.patient_id;
  const otherPerson = isPatient ? sessionData.therapist : sessionData.patient;
  const sessionType = sessionData.session_type || 'chat';

  return (
    <div className="min-h-screen bg-background">
      {/* Session Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {sessionType === 'chat' ? 'Text Session' : sessionType === 'video' ? 'Video Call' : 'Voice Call'}
            </Badge>
            {sessionStartTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatTime(elapsedTime)}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {sessionType !== 'chat' && (
              <>
                <Button
                  variant={isAudioEnabled ? "default" : "destructive"}
                  size="icon"
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                >
                  {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                
                {sessionType === 'video' && (
                  <Button
                    variant={isVideoEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                )}
              </>
            )}
            
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            
            {sessionStartTime ? (
              <Button variant="destructive" onClick={endSession}>
                <PhoneOff className="h-4 w-4 mr-2" />
                End Session
              </Button>
            ) : (
              <Button onClick={startSession}>
                {sessionType === 'video' ? <Video className="h-4 w-4 mr-2" /> : 
                 sessionType === 'audio' ? <Phone className="h-4 w-4 mr-2" /> : 
                 <MessageCircle className="h-4 w-4 mr-2" />}
                Start Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Session Content */}
      <div className="container mx-auto px-4 py-6">
        {!sessionStartTime ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Session Ready</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your session with {otherPerson?.first_name || 'Unknown'} {otherPerson?.last_name || ''} is ready to begin.
              </p>
              <Alert>
                <AlertDescription>
                  Sessions are confidential and secure. Please ensure you're in a private space.
                </AlertDescription>
              </Alert>
              <Button onClick={startSession} className="w-full">
                Start Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            {sessionType === 'chat' ? (
              <ChatInterface
                appointmentId={sessionData.id}
                therapistId={sessionData.therapist_id}
                patientId={sessionData.patient_id}
                therapistName={sessionData.therapist ? `${sessionData.therapist.first_name} ${sessionData.therapist.last_name}` : 'Therapist'}
                patientName={sessionData.patient ? `${sessionData.patient.first_name} ${sessionData.patient.last_name}` : 'Patient'}
                sessionType={sessionType}
                onEndSession={endSession}
              />
            ) : (
              <Card className="h-[600px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4">
                      {sessionType === 'video' ? (
                        <Video className="h-16 w-16 text-primary mx-auto" />
                      ) : (
                        <Phone className="h-16 w-16 text-primary mx-auto" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {sessionType === 'video' ? 'Video Call' : 'Voice Call'} Active
                    </h3>
                    <p className="text-muted-foreground">
                      Connected with {otherPerson?.first_name || 'Unknown'} {otherPerson?.last_name || ''}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Duration: {formatTime(elapsedTime)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionRoom;