import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  MessageCircle, 
  Clock, 
  Star, 
  User, 
  Heart,
  TrendingUp,
  BookOpen,
  Phone,
  Video
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MentalHealthQuestionnaire, QuestionnaireResults } from '@/components/questionnaire/MentalHealthQuestionnaire';

interface Appointment {
  id: string;
  scheduled_at: string;
  duration: number;
  status: string;
  notes?: string;
  therapist_id: string;
  patient_id: string;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

const Dashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireType, setQuestionnaireType] = useState<'phq7' | 'gad7'>('phq7');
  const [questionnaireResults, setQuestionnaireResults] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch appointments based on user role
      let appointmentsQuery = supabase
        .from('appointments')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (profileData.role === 'patient') {
        appointmentsQuery = appointmentsQuery.eq('patient_id', user.id);
      } else if (profileData.role === 'therapist') {
        appointmentsQuery = appointmentsQuery.eq('therapist_id', user.id);
      }

      const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery;
      if (appointmentsError) throw appointmentsError;
      
      setAppointments(appointmentsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = (results: any) => {
    setQuestionnaireResults(results);
    setShowQuestionnaire(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.scheduled_at) > new Date() && apt.status !== 'cancelled'
  );

  const recentAppointments = appointments.filter(apt => 
    new Date(apt.scheduled_at) <= new Date() || apt.status === 'completed'
  ).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showQuestionnaire) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <MentalHealthQuestionnaire
              type={questionnaireType}
              onComplete={handleQuestionnaireComplete}
              onSkip={() => setShowQuestionnaire(false)}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {profile?.first_name}!
                </h1>
                <p className="text-muted-foreground">
                  {profile?.role === 'patient' ? 'Your mental health journey continues here' : 'Ready to help your clients today'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{recentAppointments.length}</p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="wellness">Wellness Tools</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-6">
              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                      {profile?.role === 'patient' && (
                        <Button onClick={() => navigate('/therapists')}>
                          Book a Session
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => {
                        const { date, time } = formatDateTime(appointment.scheduled_at);
                        // For now, just show the appointment without names
                        const displayName = profile?.role === 'patient' 
                          ? 'Your Therapist' 
                          : 'Your Patient';
                        
                        return (
                          <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                               <Avatar>
                                 <AvatarFallback>
                                   {displayName[0]}
                                 </AvatarFallback>
                               </Avatar>
                               <div>
                                 <p className="font-medium">
                                   {displayName}
                                 </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  {date} at {time}
                                  <Clock className="h-4 w-4 ml-2" />
                                  {appointment.duration} min
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                              <Button size="sm">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Join Session
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No recent sessions</p>
                  ) : (
                    <div className="space-y-3">
                      {recentAppointments.map((appointment) => {
                        const { date, time } = formatDateTime(appointment.scheduled_at);
                        const displayName = profile?.role === 'patient' 
                          ? 'Your Therapist' 
                          : 'Your Patient';
                        
                        return (
                          <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                               <Avatar className="h-10 w-10">
                                 <AvatarFallback className="text-sm">
                                   {displayName[0]}
                                 </AvatarFallback>
                               </Avatar>
                               <div>
                                 <p className="font-medium text-sm">
                                   {displayName}
                                 </p>
                                <p className="text-xs text-muted-foreground">{date}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(appointment.status)} variant="secondary">
                              {appointment.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wellness" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mental Health Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Take a quick assessment to understand your current mental health status.
                    </p>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => {
                          setQuestionnaireType('phq7');
                          setShowQuestionnaire(true);
                        }}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Depression Screening (PHQ-7)
                      </Button>
                      <Button 
                        onClick={() => {
                          setQuestionnaireType('gad7');
                          setShowQuestionnaire(true);
                        }}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Anxiety Screening (GAD-7)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Crisis Hotline: 0800 720 000
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Emergency Video Call
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/therapists')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Find a Therapist
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Progress tracking features coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardHeader>
                  <CardTitle>Mental Health Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Educational resources and self-help tools coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;