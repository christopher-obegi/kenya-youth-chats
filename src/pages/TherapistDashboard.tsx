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
  Users,
  CheckCircle,
  AlertCircle,
  Settings,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface TherapistProfile {
  id: string;
  is_verified: boolean;
  is_available: boolean;
  specialization: string[];
  years_experience: number;
  hourly_rate: number;
  bio: string;
}

const TherapistDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
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
      
      // Redirect if not therapist
      if (profileData.role !== 'therapist') {
        navigate('/dashboard');
        return;
      }
      
      setProfile(profileData);

      // Fetch therapist profile
      const { data: therapistData, error: therapistError } = await supabase
        .from('therapists')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (therapistError && therapistError.code === 'PGRST116') {
        // No therapist profile found, redirect to registration
        navigate('/therapist-registration');
        return;
      } else if (therapistError) {
        throw therapistError;
      }

      setTherapistProfile(therapistData);

      // Fetch therapist appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Fetch unique patients
      const patientIds = [...new Set(appointmentsData?.map(apt => apt.patient_id) || [])];
      if (patientIds.length > 0) {
        const { data: patientsData, error: patientsError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', patientIds);

        if (!patientsError) {
          setPatients(patientsData || []);
        }
      }

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

  const todayAppointments = appointments.filter(apt => {
    const today = new Date();
    const appointmentDate = new Date(apt.scheduled_at);
    return appointmentDate.toDateString() === today.toDateString() && apt.status !== 'cancelled';
  });

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
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome, Dr. {profile?.first_name}!
                </h1>
                <p className="text-muted-foreground">
                  Ready to help your patients today
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={therapistProfile?.is_verified ? "default" : "secondary"}
                  className={therapistProfile?.is_verified ? "bg-green-100 text-green-800" : ""}
                >
                  {therapistProfile?.is_verified ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending Verification
                    </>
                  )}
                </Badge>
                <Badge 
                  variant={therapistProfile?.is_available ? "default" : "secondary"}
                  className={therapistProfile?.is_available ? "bg-blue-100 text-blue-800" : ""}
                >
                  {therapistProfile?.is_available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Verification Alert */}
          {!therapistProfile?.is_verified && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Account Under Review</h3>
                    <p className="text-muted-foreground mb-4">
                      Your account is currently being reviewed by our admin team. You'll receive an email once 
                      your credentials have been verified and your account is approved.
                    </p>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Application Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{todayAppointments.length}</p>
                    <p className="text-sm text-muted-foreground">Today's Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patients.length}</p>
                    <p className="text-sm text-muted-foreground">Active Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{therapistProfile?.years_experience || 0}</p>
                    <p className="text-sm text-muted-foreground">Years Experience</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-6">
              {/* Today's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No sessions scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.map((appointment) => {
                        const { date, time } = formatDateTime(appointment.scheduled_at);
                        const patient = patients.find(p => p.id === appointment.patient_id);
                        
                        return (
                          <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarFallback>
                                  {patient ? `${patient.first_name?.[0]}${patient.last_name?.[0]}` : 'P'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {patient ? `${patient.first_name} ${patient.last_name}` : 'Patient'}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  {time}
                                  <span className="ml-2">{appointment.duration} min</span>
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

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No upcoming sessions</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.slice(0, 5).map((appointment) => {
                        const { date, time } = formatDateTime(appointment.scheduled_at);
                        const patient = patients.find(p => p.id === appointment.patient_id);
                        
                        return (
                          <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm">
                                  {patient ? `${patient.first_name?.[0]}${patient.last_name?.[0]}` : 'P'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {patient ? `${patient.first_name} ${patient.last_name}` : 'Patient'}
                                </p>
                                <p className="text-xs text-muted-foreground">{date} at {time}</p>
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

            <TabsContent value="patients">
              <Card>
                <CardHeader>
                  <CardTitle>Your Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  {patients.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No patients assigned yet</p>
                  ) : (
                    <div className="space-y-3">
                      {patients.map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={patient.avatar_url} />
                              <AvatarFallback>
                                {patient.first_name?.[0]}{patient.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                              <p className="text-sm text-muted-foreground">{patient.email}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            View Notes
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {therapistProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Specializations</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {therapistProfile.specialization?.map((spec, index) => (
                              <Badge key={index} variant="secondary">{spec}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Hourly Rate</label>
                          <p className="text-lg font-semibold">KES {therapistProfile.hourly_rate}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bio</label>
                        <p className="text-sm mt-1">{therapistProfile.bio || 'No bio provided'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Profile information not available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics & Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TherapistDashboard;