import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, File, X, CheckCircle } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  file?: File;
  url?: string;
  uploaded: boolean;
}

interface DocumentUploadStepProps {
  isSubmitting: boolean;
  onDocumentsChange: (documents: Document[]) => void;
}

const REQUIRED_DOCUMENTS = [
  {
    id: 'license',
    name: 'Professional License',
    description: 'Valid professional counseling or therapy license',
    required: true
  },
  {
    id: 'degree',
    name: 'Educational Certificate',
    description: 'Degree certificate in psychology, counseling, or related field',
    required: true
  },
  {
    id: 'id',
    name: 'Government ID',
    description: 'National ID or passport for identity verification',
    required: true
  },
  {
    id: 'cv',
    name: 'Curriculum Vitae',
    description: 'Updated CV with relevant experience',
    required: false
  }
];

export default function DocumentUploadStep({ 
  isSubmitting,
  onDocumentsChange 
}: DocumentUploadStepProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (documentType: string, file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, JPEG, or PNG files only",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(documentType);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload documents",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('therapist-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('therapist-documents')
        .getPublicUrl(fileName);

      const newDocument: Document = {
        id: documentType,
        name: file.name,
        type: documentType,
        file,
        url: publicUrl,
        uploaded: true
      };

      const updatedDocuments = documents.filter(doc => doc.id !== documentType);
      updatedDocuments.push(newDocument);
      setDocuments(updatedDocuments);
      onDocumentsChange(updatedDocuments);

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully`,
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const removeDocument = async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    try {
      // Remove from storage if uploaded
      if (document.url) {
        const fileName = document.url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('therapist-documents')
            .remove([fileName]);
        }
      }

      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocuments);
      onDocumentsChange(updatedDocuments);

      toast({
        title: "Document removed",
        description: "Document has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive"
      });
    }
  };

  const canProceed = () => {
    const requiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.required);
    const uploadedRequiredDocs = documents.filter(doc => 
      doc.uploaded && requiredDocs.some(req => req.id === doc.id)
    );
    return uploadedRequiredDocs.length === requiredDocs.length;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Upload Documents</h2>
        <p className="text-muted-foreground mt-2">
          Please upload the required documents for verification
        </p>
      </div>

      <Alert>
        <AlertDescription>
          All documents must be clear, legible, and in PDF, JPEG, or PNG format. 
          Maximum file size is 5MB per document.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {REQUIRED_DOCUMENTS.map((docType) => {
          const uploadedDoc = documents.find(doc => doc.id === docType.id);
          const isUploading = uploading === docType.id;

          return (
            <Card key={docType.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {docType.name}
                      {docType.required && (
                        <span className="text-destructive text-sm">*</span>
                      )}
                      {uploadedDoc?.uploaded && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                    </CardTitle>
                    <CardDescription>{docType.description}</CardDescription>
                  </div>
                  {uploadedDoc && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(docType.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!uploadedDoc ? (
                  <div className="space-y-2">
                    <Label htmlFor={`file-${docType.id}`}>
                      Choose file to upload
                    </Label>
                    <Input
                      id={`file-${docType.id}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(docType.id, file);
                        }
                      }}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <File className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{uploadedDoc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded successfully
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}