import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, CheckCircle, XCircle, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TherapistApplication {
  id: string;
  user_id: string;
  license_number: string;
  years_experience: number;
  bio: string;
  specialization: string[];
  hourly_rate: number;
  location: string;
  education: string;
  certifications: string[];
  languages: string[];
  is_verified: boolean;
  is_available: boolean;
  documents?: any[];
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<TherapistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    setUser(session.user);

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchApplications();
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (therapistId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('therapists')
        .update({ 
          is_verified: isVerified,
          is_available: isVerified // Make available when verified
        })
        .eq('id', therapistId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Therapist ${isVerified ? 'approved' : 'rejected'}`,
      });

      fetchApplications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const downloadDocument = async (documentPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('therapist-documents')
        .download(documentPath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentPath.split('/').pop() || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            Checking admin privileges...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => !app.is_verified);
  const approvedApplications = applications.filter(app => app.is_verified);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage therapist applications</p>
          </div>
          <div className="flex gap-4">
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{pendingApplications.length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </Card>
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{approvedApplications.length}</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Applications</TabsTrigger>
            <TabsTrigger value="approved">Approved Therapists</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading applications...</div>
            ) : pendingApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No pending applications</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Applications</CardTitle>
                  <CardDescription>Review and approve therapist applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Specializations</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            {application.profiles?.first_name} {application.profiles?.last_name}
                          </TableCell>
                          <TableCell>{application.profiles?.email}</TableCell>
                          <TableCell>{application.license_number}</TableCell>
                          <TableCell>{application.years_experience} years</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {application.specialization.slice(0, 2).map((spec, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {application.specialization.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{application.specialization.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {application.documents?.map((doc: any, index: number) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadDocument(doc.path)}
                                  className="h-auto p-1 justify-start"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  {doc.name}
                                </Button>
                              ))}
                              {(!application.documents || application.documents.length === 0) && (
                                <span className="text-sm text-muted-foreground">No documents</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateVerificationStatus(application.id, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateVerificationStatus(application.id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approved Therapists</CardTitle>
                <CardDescription>Currently verified therapists on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specializations</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedApplications.map((therapist) => (
                      <TableRow key={therapist.id}>
                        <TableCell>
                          {therapist.profiles?.first_name} {therapist.profiles?.last_name}
                        </TableCell>
                        <TableCell>{therapist.profiles?.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {therapist.specialization.slice(0, 2).map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {therapist.specialization.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{therapist.specialization.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>KSh {therapist.hourly_rate}/hr</TableCell>
                        <TableCell>
                          <Badge variant={therapist.is_available ? "default" : "secondary"}>
                            {therapist.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(therapist.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}