import { useEffect, useState } from "react";
import { Link, useNavigate, useLoaderData, redirect } from "react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, Calendar, Clock, Loader2, FileText, CheckCircle, XCircle, AlertCircle, Building2, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authService } from "@/server/auth-service.server";
import { submissionService } from "@/server/submission-service.server";

type Submission = {
  id: string;
  topicTitle: string;
  description: string;
  institution: string;
  status: "pending" | "approved" | "rejected";
  date: string; // ISO string
  time: string;
  createdAt: string;
};

export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader?.split(";").find((c) => c.trim().startsWith("token="))?.split("=")[1];

  if (!token) return redirect("/login");

  const user = await authService.verifyToken(token);
  if (!user) return redirect("/login");

  const submissions = await submissionService.getSpeakerSubmissions(user.email);
  
  const serializedSubmissions = submissions.map(sub => ({
    ...sub,
    date: sub.eventDate ? new Date(sub.eventDate).toISOString() : null,
    eventDate: undefined,
    time: sub.eventTime?.substring(0, 5) || "",
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  }));

  return { submissions: serializedSubmissions };
}

export default function SpeakerDashboard() {
  const { user } = useAuth();
  const { submissions } = useLoaderData() as { submissions: Submission[] };
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const getStatusBadge = (status: Submission["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Diterima
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Menunggu
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container px-4 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Halo, {user?.name}</h1>
            <p className="text-muted-foreground">Kelola pendaftaran materi Anda di sini.</p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/register-speaker">
              <Plus className="w-4 h-4 mr-2" />
              Daftar Materi Baru
            </Link>
          </Button>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Belum ada materi</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Anda belum mendaftarkan materi apapun. Mulai berkontribusi dengan mendaftarkan topik menarik.
            </p>
            <Button asChild variant="outline">
              <Link to="/register-speaker">
                Mulai Daftar Sekarang
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <div 
                key={submission.id}
                className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between md:justify-start gap-3">
                      <h3 className="text-xl font-bold text-foreground line-clamp-1">{submission.topicTitle}</h3>
                      <div className="md:hidden">
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {submission.date ? format(new Date(submission.date), "EEEE, d MMMM yyyy", { locale: id }) : "-"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {submission.time} WIB
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    {getStatusBadge(submission.status)}
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Diajukan pada: {format(new Date(submission.createdAt), "d MMM yyyy, HH:mm", { locale: id })}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pendaftaran</DialogTitle>
            <DialogDescription>
              Informasi lengkap mengenai topik yang Anda ajukan.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 pt-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                <div>{getStatusBadge(selectedSubmission.status)}</div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Judul Materi</h4>
                <p className="font-semibold text-foreground text-lg">{selectedSubmission.topicTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Tanggal
                  </h4>
                  <p className="text-foreground">
                    {selectedSubmission.date ? format(new Date(selectedSubmission.date), "d MMM yyyy", { locale: id }) : "-"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Waktu
                  </h4>
                  <p className="text-foreground">{selectedSubmission.time} WIB</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Institusi
                </h4>
                <p className="text-foreground">{selectedSubmission.institution || "-"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5" /> Deskripsi
                </h4>
                <p className="text-foreground text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                  {selectedSubmission.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}