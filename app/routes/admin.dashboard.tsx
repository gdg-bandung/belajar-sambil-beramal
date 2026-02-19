import { useEffect, useState } from "react";
import { useNavigate, useLoaderData, useFetcher, redirect } from "react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Building2,
  AlignLeft,
  Search,
  Filter,
  UserPlus,
  Trash2,
  FileText,
  MoreHorizontal,
  Tag,
  User,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/server/auth-service.server";
import { submissionService } from "@/server/submission-service.server";
import { cn } from "@/lib/utils";

type Submission = {
  id: string;
  fullName: string;
  email?: string;
  whatsapp?: string;
  role?: string;
  topicCategory?: string;
  topicTitle: string;
  description: string;
  biography?: string;
  institution: string;
  photo?: string;
  status: "pending" | "approved" | "rejected";
  date: string | null;
  time: string;
  createdAt: string;
  rejectionReason?: string;
};

type Donation = {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  message: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin" | "speaker";
};

export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader?.split(";").find((c) => c.trim().startsWith("token="))?.split("=")[1];

  if (!token) return redirect("/login");

  const user = await authService.verifyToken(token);
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return redirect("/login");
  }

  const submissions = await submissionService.getAllSubmissions();
  
  // Format dates for client side since Date objects cannot be passed directly
  const serializedSubmissions = submissions.map(sub => ({
    ...sub,
    date: sub.eventDate ? new Date(sub.eventDate).toISOString() : null,
    eventDate: undefined, // remove raw date
    time: sub.eventTime?.substring(0, 5) || "",
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  })) as Submission[];

  // Only superadmin can fetch other admins
  let admins: AdminUser[] = [];
  if (user.role === "superadmin") {
    admins = await authService.getAllAdmins() as AdminUser[];
  }

  return { submissions: serializedSubmissions, admins, currentUserRole: user.role };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateStatus") {
    const id = formData.get("id") as string;
    const status = formData.get("status") as "approved" | "rejected";
    const rejectionReason = formData.get("rejectionReason") as string;

    await submissionService.updateSubmissionStatus(id, status, rejectionReason);
    return { success: true };
  }

  if (intent === "addAdmin") {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const errors: Record<string, string> = {};

    if (!name) errors.name = "Nama wajib diisi";
    if (!email) errors.email = "Email wajib diisi";
    if (!password) errors.password = "Password wajib diisi";
    if (!confirmPassword) errors.confirmPassword = "Konfirmasi password wajib diisi";

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    if (password !== confirmPassword) {
      return { success: false, errors: { confirmPassword: "Password tidak sama" } };
    }

    if (password.length < 8) {
      return { success: false, errors: { password: "Password minimal 8 karakter" } };
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
      return { 
        success: false, 
        errors: { password: "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol" }
      };
    }
    
    try {
      await authService.createAdmin(email, password, name, "admin");
      return { success: true, message: "Admin berhasil ditambahkan" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add admin";
      return { success: false, message: errorMessage };
    }
  }

  if (intent === "deleteAdmin") {
    const id = formData.get("id") as string;
    try {
      await authService.deleteUser(id);
      return { success: true, message: "Admin berhasil dihapus" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus admin";
      return { success: false, message: errorMessage };
    }
  }

  return { success: false };
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { submissions: loadedSubmissions, admins: loadedAdmins, currentUserRole } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // New Admin Form State
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});

  // Rejection State
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submissionToReject, setSubmissionToReject] = useState<string | null>(null);

  const clearAdminError = (field: string) => {
    if (adminErrors[field]) {
      setAdminErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  useEffect(() => {
    if (loadedSubmissions) {
      setSubmissions(loadedSubmissions);
    }
    if (loadedAdmins) {
      setAdmins(loadedAdmins);
    }
  }, [loadedSubmissions, loadedAdmins]);

  useEffect(() => {
    // Check for action success message
    if (fetcher.state === "idle" && fetcher.data) {
      const data = fetcher.data as { success: boolean; message?: string; errors?: Record<string, string> };
      if (data.message) {
        toast({
          title: data.success ? "Berhasil" : "Gagal",
          description: data.message,
          variant: data.success ? "default" : "destructive",
        });
      }

      if (data.errors) {
        setAdminErrors(data.errors);
      }

      // Close admin dialog on success
      if (data.success && isAdminDialogOpen) {
        setIsAdminDialogOpen(false);
        setNewAdminEmail("");
        setNewAdminName("");
        setNewAdminPassword("");
        setNewAdminConfirmPassword("");
        setAdminErrors({});
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Mock donations
  useEffect(() => {
    setDonations([
      { id: "1", donorName: "Hamba Allah", amount: 100000, date: new Date().toISOString(), message: "Semoga berkah" },
      { id: "2", donorName: "Budi Santoso", amount: 50000, date: new Date(Date.now() - 86400000).toISOString(), message: "Sukses terus acaranya" },
      { id: "3", donorName: "Siti Aminah", amount: 250000, date: new Date(Date.now() - 172800000).toISOString(), message: "Untuk anak yatim" },
    ]);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: "approved" | "rejected", reason?: string) => {
    if (newStatus === "rejected" && !reason) {
      setSubmissionToReject(id);
      setIsRejectDialogOpen(true);
      return;
    }

    fetcher.submit(
      { intent: "updateStatus", id, status: newStatus, rejectionReason: reason || "" },
      { method: "post" }
    );

    // Close dialogs
    if (selectedSubmission?.id === id) {
      setSelectedSubmission(null);
    }
    setIsRejectDialogOpen(false);
    setRejectionReason("");
    setSubmissionToReject(null);
  };

  const handleConfirmRejection = () => {
    if (submissionToReject && rejectionReason.trim()) {
      handleUpdateStatus(submissionToReject, "rejected", rejectionReason);
    } else {
      toast({
        title: "Error",
        description: "Alasan penolakan harus diisi.",
        variant: "destructive",
      });
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    fetcher.submit(
      { 
        intent: "addAdmin", 
        name: newAdminName, 
        email: newAdminEmail, 
        password: newAdminPassword,
        confirmPassword: newAdminConfirmPassword
      },
      { method: "post" }
    );
  };

  const handleDeleteAdmin = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus admin ini?")) {
      fetcher.submit({ intent: "deleteAdmin", id }, { method: "post" });
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = sub.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Submission["status"]) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Diterima</span>;
      case "rejected":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container px-4 py-24 md:py-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Kelola submission, donasi, dan pengaturan admin.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Login sebagai:</span>
            <span className="font-medium">{user?.name}</span>
          </div>
        </div>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="donations">Donasi</TabsTrigger>
            {currentUserRole === "superadmin" && (
              <TabsTrigger value="settings">Pengaturan Admin</TabsTrigger>
            )}
          </TabsList>

          {/* SUBMISSIONS TAB */}
          <TabsContent value="submissions" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul atau pembicara..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as "all" | "pending" | "approved" | "rejected")}
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="approved">Diterima</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Submission ({filteredSubmissions.length})</CardTitle>
                <CardDescription>Kelola pendaftaran pembicara yang masuk.</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Tidak ada data submission yang ditemukan.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{sub.topicTitle}</h4>
                            {getStatusBadge(sub.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Oleh: {sub.fullName} • {sub.institution}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {sub.date && (
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(sub.date), "d MMM yyyy", { locale: id })}</span>
                            )}
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sub.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(sub)}>
                            Detail
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(sub.id, "approved")} className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" /> Setujui
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(sub.id, "rejected")} className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" /> Tolak
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DONATIONS TAB */}
          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Donasi</CardTitle>
                <CardDescription>Daftar donasi yang masuk dari peserta.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{donation.donorName}</p>
                        <p className="text-sm text-muted-foreground">{donation.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(donation.date), "d MMM yyyy, HH:mm", { locale: id })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+Rp {donation.amount.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          {currentUserRole === "superadmin" && (
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Daftar Admin</CardTitle>
                      <CardDescription>Kelola pengguna yang memiliki akses admin.</CardDescription>
                    </div>
                    <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Tambah Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Admin Baru</DialogTitle>
                          <DialogDescription>
                            Admin baru akan memiliki akses penuh ke dashboard ini.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddAdmin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="admin-name" className={cn(adminErrors.name && "text-destructive")}>Nama Lengkap</Label>
                            <Input
                              id="admin-name"
                              placeholder="Nama Admin"
                              value={newAdminName}
                              onChange={(e) => {
                                setNewAdminName(e.target.value);
                                clearAdminError("name");
                              }}
                              className={cn(adminErrors.name && "border-destructive focus-visible:ring-destructive")}
                              required
                            />
                            {adminErrors.name && <p className="text-xs text-destructive">{adminErrors.name}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="admin-email" className={cn(adminErrors.email && "text-destructive")}>Email</Label>
                            <Input
                              id="admin-email"
                              type="email"
                              placeholder="admin@example.com"
                              value={newAdminEmail}
                              onChange={(e) => {
                                setNewAdminEmail(e.target.value);
                                clearAdminError("email");
                              }}
                              className={cn(adminErrors.email && "border-destructive focus-visible:ring-destructive")}
                              required
                            />
                            {adminErrors.email && <p className="text-xs text-destructive">{adminErrors.email}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="admin-password" className={cn(adminErrors.password && "text-destructive")}>Password</Label>
                            <div className="relative">
                              <Input
                                id="admin-password"
                                name="password"
                                type={showAdminPassword ? "text" : "password"}
                                placeholder="******"
                                value={newAdminPassword}
                                onChange={(e) => {
                                  setNewAdminPassword(e.target.value);
                                  clearAdminError("password");
                                }}
                                className={cn("pr-10", adminErrors.password && "border-destructive focus-visible:ring-destructive")}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowAdminPassword(!showAdminPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {adminErrors.password && <p className="text-xs text-destructive">{adminErrors.password}</p>}
                            <p className="text-[10px] text-muted-foreground">
                              Min. 8 karakter dengan huruf besar, kecil, angka, dan simbol
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="admin-confirm-password" className={cn(adminErrors.confirmPassword && "text-destructive")}>Konfirmasi Password</Label>
                            <div className="relative">
                              <Input
                                id="admin-confirm-password"
                                name="confirmPassword"
                                type={showAdminConfirmPassword ? "text" : "password"}
                                placeholder="******"
                                value={newAdminConfirmPassword}
                                onChange={(e) => {
                                  setNewAdminConfirmPassword(e.target.value);
                                  clearAdminError("confirmPassword");
                                }}
                                className={cn("pr-10", adminErrors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowAdminConfirmPassword(!showAdminConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showAdminConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {adminErrors.confirmPassword && <p className="text-xs text-destructive">{adminErrors.confirmPassword}</p>}
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAdminDialogOpen(false)}>
                              Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {admin.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{admin.name}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-muted px-2 py-1 rounded-full uppercase font-medium text-muted-foreground">
                            {admin.role}
                          </span>
                          {/* Prevent deleting yourself or other superadmins */}
                          {admin.role !== "superadmin" && admin.id !== user?.id && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAdmin(admin.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Footer />

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Submission</DialogTitle>
            <DialogDescription>Review detail materi yang diajukan.</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <div>{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Diajukan Pada</h4>
                  <p className="text-sm">{format(new Date(selectedSubmission.createdAt), "d MMM yyyy, HH:mm", { locale: id })}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedSubmission.topicTitle}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {selectedSubmission.topicCategory && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                          {selectedSubmission.topicCategory}
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> {selectedSubmission.institution}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{selectedSubmission.date ? format(new Date(selectedSubmission.date), "d MMM yyyy", { locale: id }) : "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{selectedSubmission.time} WIB</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4" /> Deskripsi Materi
                </h4>
                <div className="bg-muted/50 p-4 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedSubmission.description}
                </div>
              </div>

              {selectedSubmission.biography && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Biografi Pembicara
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.biography}
                  </div>
                </div>
              )}

              {selectedSubmission.status === "rejected" && selectedSubmission.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Alasan Penolakan</h4>
                  <p className="text-sm text-red-700">{selectedSubmission.rejectionReason}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Kontak Pembicara</h4>
                <div className="border rounded-md p-3 text-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p><span className="font-medium">Nama:</span> {selectedSubmission.fullName}</p>
                    {selectedSubmission.role && <p><span className="font-medium">Role:</span> {selectedSubmission.role}</p>}
                    {selectedSubmission.email && <p><span className="font-medium">Email:</span> {selectedSubmission.email}</p>}
                    {selectedSubmission.whatsapp && <p><span className="font-medium">WhatsApp:</span> {selectedSubmission.whatsapp}</p>}
                    {selectedSubmission.photo && (
                      <div className="mt-2">
                        <p className="font-medium mb-1">Speaker Photo:</p>
                        <div className="w-32 h-32 rounded-lg overflow-hidden border border-border">
                          <img 
                            src={selectedSubmission.photo} 
                            alt={selectedSubmission.fullName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedSubmission.whatsapp && (
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <a
                        href={`https://wa.me/${selectedSubmission.whatsapp.replace(/^0/, "62")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Hubungi via WA
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedSubmission?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => selectedSubmission && handleUpdateStatus(selectedSubmission.id, "rejected")}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Tolak
                </Button>
                <Button
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => selectedSubmission && handleUpdateStatus(selectedSubmission.id, "approved")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Setujui
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={() => setSelectedSubmission(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Submission</DialogTitle>
            <DialogDescription>
              Mohon berikan alasan penolakan untuk submission ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reason">Alasan Penolakan</Label>
            <Textarea
              id="reason"
              placeholder="Contoh: Jadwal tidak tersedia, Topik kurang relevan..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleConfirmRejection}>Tolak Submission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
