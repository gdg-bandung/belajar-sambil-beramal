import { Link, Form, useNavigation, redirect, useNavigate, useActionData, useLoaderData } from "react-router";
import { Loader2, ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { submissionService } from "@/server/submission-service.server";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/server/auth-service.server";

const TOPIC_CATEGORIES = [
  "AI/ML", 
  "Career Path", 
  "Business Management", 
  "SEO", 
  "Startup", 
  "Data Science", 
  "DevOps", 
  "Project Management", 
  "Web Development",
  "Mobile Development", 
  "UI/UX Design", 
  "Tips & Trick",
  "Blockchain",
  "Web3",
  "Finance"
];

const timeSlots = ["10:00", "13:00", "16:00", "20:00"];

export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader?.split(";").find((c) => c.trim().startsWith("token="))?.split("=")[1];

  if (!token) {
    // Redirect to login, passing the current URL as `redirectTo`
    const url = new URL(request.url);
    return redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  const user = await authService.verifyToken(token);
  if (!user) {
    const url = new URL(request.url);
    return redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  const bookedSlotsRaw = await submissionService.getBookedSlots();
  // Transform to Record<string, string[]>: "2025-02-17": ["13:00", "10:00"]
  const bookedSlots: Record<string, string[]> = {};
  
  bookedSlotsRaw.forEach(slot => {
    if (slot.eventDate && slot.eventTime) {
      // Assuming eventDate is a date string or Date object from DB
      // We need it as "yyyy-MM-dd"
      const dateKey = format(new Date(slot.eventDate), "yyyy-MM-dd");
      if (!bookedSlots[dateKey]) {
        bookedSlots[dateKey] = [];
      }
      // Assuming eventTime is "HH:mm:ss", take "HH:mm"
      const timeKey = slot.eventTime.substring(0, 5); 
      bookedSlots[dateKey].push(timeKey);
    }
  });

  return { bookedSlots };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const role = formData.get("role") as string;
  const institution = formData.get("institution") as string;
  const biography = formData.get("biography") as string;
  const topicTitle = formData.get("topicTitle") as string;
  const topicCategoryInput = formData.get("topicCategory") as string;
  const topicCategoryOther = formData.get("topicCategoryOther") as string;
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;
  const time = formData.get("time") as string;

  const topicCategory = topicCategoryInput === "Lainnya" ? topicCategoryOther : topicCategoryInput;

  // Basic Validation
  if (!fullName || !email || !whatsapp || !role || !institution || !biography || !topicTitle || !topicCategory || !description || !dateStr || !time) {
    return { error: "Semua kolom wajib diisi" };
  }

  // Extract file and convert to base64
  const photoEntry = formData.get("photo");
  let photo = null;
  
  if (photoEntry instanceof File && photoEntry.size > 0) {
    const arrayBuffer = await photoEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    photo = `data:${photoEntry.type};base64,${buffer.toString("base64")}`;
  } else {
    return { error: "Foto pembicara wajib diunggah" };
  }

  const data = {
    fullName,
    email,
    whatsapp,
    role,
    institution,
    topicCategory,
    topicTitle,
    description,
    biography,
    photo,
    eventDate: new Date(dateStr).toISOString(),
    eventTime: time,
    status: "pending"
  };

  const isAvailable = await submissionService.isSlotAvailable(data.eventDate, data.eventTime);
  if (!isAvailable) {
    return { error: "Jadwal yang dipilih sudah terisi. Mohon pilih waktu lain." };
  }

  try {
    await submissionService.createSubmission(data);
    return redirect("/dashboard");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Submission failed";
    return { error: errorMessage };
  }
}

export default function SpeakerRegistration() {
  const { user } = useAuth();
  const { bookedSlots } = useLoaderData<typeof loader>();
  const { toast } = useToast();
  const actionData = useActionData() as { error?: string };
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSlotBooked = (date: Date | undefined, time: string) => {
    if (!date) return false;
    const dateStr = format(date, "yyyy-MM-dd");
    return bookedSlots[dateStr]?.includes(time);
  };

  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handleNextStep = () => {
    // Validate Step 1 Fields
    const form = document.querySelector("form");
    if (!form) return;

    const formData = new FormData(form);
    const newErrors: Record<string, string> = {};
    
    const requiredFields = [
      { name: "fullName", label: "Full Name" },
      { name: "email", label: "Email" },
      { name: "whatsapp", label: "Whatsapp Number" },
      { name: "role", label: "Role" },
      { name: "institution", label: "Company" },
      { name: "biography", label: "Speaker Biography" },
      { name: "topicTitle", label: "Webinar Title" },
      { name: "description", label: "Description Session" }
    ];

    requiredFields.forEach(field => {
      if (!formData.get(field.name)) {
        newErrors[field.name] = `${field.label} wajib diisi`;
      }
    });
    
    // Check Radio Group (Topic Category)
    if (!selectedCategory) {
      newErrors["topicCategory"] = "Topic wajib dipilih";
    }
    
    // Check "Other" Category input if "Lainnya" is selected
    if (selectedCategory === "Lainnya") {
      const otherInput = formData.get("topicCategoryOther");
      if (!otherInput) {
        newErrors["topicCategoryOther"] = "Detail kategori wajib diisi";
      }
    }

    // Check Photo (file input or existing preview)
    const photoInput = form.querySelector('input[name="photo"]') as HTMLInputElement;
    if (!photoInput?.files?.length && !previewUrl) {
      newErrors["photo"] = "Foto pembicara wajib diunggah";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Mohon lengkapi semua data",
        description: "Beberapa kolom wajib belum diisi.",
        variant: "destructive"
      });
      return;
    }

    setErrors({});
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePrevStep = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Button
            variant="ghost"
            className="mb-8 pl-0 hover:pl-2 transition-all"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Daftar Sebagai Pembicara
            </h1>
            <p className="text-muted-foreground text-lg">
              {step === 1 
                ? "Lengkapi formulir di bawah ini untuk mendaftar sebagai pembicara." 
                : "Pilih jadwal yang sesuai dengan ketersediaan Anda."}
            </p>
             <div className="flex items-center gap-2 mt-6">
              <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>

          {actionData?.error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
              {actionData.error}
            </div>
          )}

          <Form 
            method="post" 
            encType="multipart/form-data" 
            className="space-y-12" 
            noValidate
            onSubmit={(e) => {
              if (step === 2) {
                if (!date || !selectedTime) {
                  e.preventDefault();
                  toast({
                    title: "Jadwal belum lengkap",
                    description: "Mohon pilih tanggal dan waktu sesi.",
                    variant: "destructive"
                  });
                }
              }
            }}
          >
            
            {/* Hidden Inputs for Non-Native State */}
            <input type="hidden" name="date" value={date ? format(date, "yyyy-MM-dd") : ""} />
            <input type="hidden" name="time" value={selectedTime} />
            <input type="hidden" name="topicCategory" value={selectedCategory} />

            <div style={{ display: step === 1 ? 'block' : 'none' }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                    <h3 className="text-xl font-bold border-b pb-2">Informasi Diri</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className={cn(errors.fullName && "text-destructive")}>Full Name <span className="text-destructive">*</span></Label>
                        <Input 
                          id="fullName" 
                          name="fullName" 
                          placeholder="John Doe" 
                          defaultValue={user?.name || ""} 
                          className={cn(errors.fullName && "border-destructive focus-visible:ring-destructive")}
                          onChange={() => clearError("fullName")}
                          required 
                        />
                        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className={cn(errors.email && "text-destructive")}>Email <span className="text-destructive">*</span></Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="email@example.com" 
                          defaultValue={user?.email || ""} 
                          className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
                          onChange={() => clearError("email")}
                          required 
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp" className={cn(errors.whatsapp && "text-destructive")}>Whatsapp Number <span className="text-destructive">*</span></Label>
                        <Input 
                          id="whatsapp" 
                          name="whatsapp" 
                          placeholder="08123456789" 
                          type="tel" 
                          className={cn(errors.whatsapp && "border-destructive focus-visible:ring-destructive")}
                          onChange={() => clearError("whatsapp")}
                          required 
                        />
                        {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role" className={cn(errors.role && "text-destructive")}>Role <span className="text-destructive">*</span></Label>
                        <Input 
                          id="role" 
                          name="role" 
                          placeholder="e.g. Senior Frontend Engineer" 
                          className={cn(errors.role && "border-destructive focus-visible:ring-destructive")}
                          onChange={() => clearError("role")}
                          required 
                        />
                        {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="institution" className={cn(errors.institution && "text-destructive")}>Company <span className="text-destructive">*</span></Label>
                      <Input 
                        id="institution" 
                        name="institution" 
                        placeholder="Nama Instansi Anda" 
                        className={cn(errors.institution && "border-destructive focus-visible:ring-destructive")}
                        onChange={() => clearError("institution")}
                        required 
                      />
                      {errors.institution && <p className="text-xs text-destructive">{errors.institution}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="biography" className={cn(errors.biography && "text-destructive")}>Speaker Biography <span className="text-destructive">*</span></Label>
                      <Textarea 
                        id="biography" 
                        name="biography" 
                        placeholder="Ceritakan sedikit tentang diri Anda..." 
                        className={cn("min-h-[100px]", errors.biography && "border-destructive focus-visible:ring-destructive")}
                        onChange={() => clearError("biography")}
                        required 
                      />
                      {errors.biography && <p className="text-xs text-destructive">{errors.biography}</p>}
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="photo" className={cn(errors.photo && "text-destructive")}>Speaker Photo <span className="text-destructive">*</span></Label>
                      <div className="flex flex-col items-center gap-4 w-full">
                        {previewUrl && (
                          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-md">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <label
                          htmlFor="photo"
                          className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                            errors.photo ? "border-destructive bg-destructive/5" : "border-muted-foreground/25",
                            previewUrl ? "h-16" : "h-32"
                          )}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {!previewUrl && <Upload className="w-8 h-8 mb-2 text-muted-foreground" />}
                            <p className="text-sm text-muted-foreground text-center px-4">
                              <span className="font-semibold">{previewUrl ? "Ganti foto pembicara" : "Klik untuk upload foto pembicara"}</span>
                            </p>
                            {!previewUrl && <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (MAX. 5MB)</p>}
                          </div>
                          <input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                setPreviewUrl(URL.createObjectURL(files[0]));
                                clearError("photo");
                              }
                            }}
                            required
                          />
                        </label>
                        {errors.photo && <p className="text-xs text-destructive">{errors.photo}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold border-b pb-2">Detail Materi</h3>

                    <div className="space-y-2">
                      <Label htmlFor="topicTitle" className={cn(errors.topicTitle && "text-destructive")}>Webinar Title <span className="text-destructive">*</span></Label>
                      <Input 
                        id="topicTitle" 
                        name="topicTitle" 
                        placeholder="Contoh: Pengenalan React JS" 
                        className={cn(errors.topicTitle && "border-destructive focus-visible:ring-destructive")}
                        onChange={() => clearError("topicTitle")}
                        required 
                      />
                      {errors.topicTitle && <p className="text-xs text-destructive">{errors.topicTitle}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className={cn(errors.topicCategory && "text-destructive")}>Topic <span className="text-destructive">*</span></Label>
                      <RadioGroup onValueChange={(val) => {
                        setSelectedCategory(val);
                        clearError("topicCategory");
                      }} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {TOPIC_CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value={category} id={category} className="peer sr-only" />
                            <Label
                              htmlFor={category}
                              className={cn(
                                "flex flex-1 items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all text-sm",
                                errors.topicCategory && "border-destructive"
                              )}
                            >
                              {category}
                            </Label>
                          </div>
                        ))}
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="Lainnya" id="Lainnya" className="peer sr-only" />
                          <Label
                            htmlFor="Lainnya"
                            className={cn(
                              "flex flex-1 items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all text-sm",
                              errors.topicCategory && "border-destructive"
                            )}
                          >
                            Yang lain:
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.topicCategory && <p className="text-xs text-destructive">{errors.topicCategory}</p>}
                    </div>

                    {selectedCategory === "Lainnya" && (
                      <div className="space-y-2">
                        <Input 
                          name="topicCategoryOther" 
                          placeholder="Tuliskan kategori topik Anda..." 
                          className={cn(errors.topicCategoryOther && "border-destructive focus-visible:ring-destructive")}
                          onChange={() => clearError("topicCategoryOther")}
                          required 
                        />
                        {errors.topicCategoryOther && <p className="text-xs text-destructive">{errors.topicCategoryOther}</p>}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="description" className={cn(errors.description && "text-destructive")}>Description Session <span className="text-destructive">*</span></Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        placeholder="Jelaskan detail materi yang akan dibawakan..." 
                        className={cn("min-h-[100px]", errors.description && "border-destructive focus-visible:ring-destructive")}
                        onChange={() => clearError("description")}
                        required 
                      />
                      {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button type="button" onClick={handleNextStep} size="lg">
                      Lanjut Pilih Jadwal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
            </div>

            <div style={{ display: step === 2 ? 'block' : 'none' }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                    <h3 className="text-xl font-bold border-b pb-2">Jadwal Sesi</h3>
                    <p className="text-muted-foreground text-sm">
                      *Estimasi durasi sesi sharing 30 - 90 menit.
                    </p>

                    <div className="grid lg:grid-cols-2 gap-8 pt-4">
                      <div className="flex flex-col space-y-2">
                        <Label className="text-base">Pilih Tanggal</Label>
                        <div className="border rounded-md p-4 flex justify-center bg-card">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(d) => d < new Date() || d < new Date("2020-01-01")}
                            initialFocus
                            className="p-0"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Pilih tanggal yang tersedia di bulan Ramadhan.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">Pilih Waktu (WIB)</Label>
                        <div className="grid grid-cols-1 gap-3">
                          {timeSlots.map((time) => {
                            const isBooked = isSlotBooked(date, time);
                            return (
                              <div
                                key={time}
                                className={cn(
                                  "flex items-center justify-between rounded-lg border p-4 text-sm font-medium transition-all cursor-pointer hover:shadow-md",
                                  (!date || isBooked) && "opacity-50 cursor-not-allowed",
                                  !isBooked && date && selectedTime === time
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-input bg-card hover:bg-accent/5",
                                  isBooked && "bg-muted text-muted-foreground hover:bg-muted hover:shadow-none"
                                )}
                                onClick={() => {
                                  if (!date) {
                                    toast({
                                      title: "Pilih tanggal terlebih dahulu",
                                      description: "Anda harus memilih tanggal sebelum menentukan waktu.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  if (isBooked) {
                                    toast({
                                      title: "Jadwal Penuh",
                                      description: "Waktu ini sudah dibooking oleh pembicara lain.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  setSelectedTime(time);
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border border-primary flex items-center justify-center",
                                    selectedTime === time ? "bg-primary" : "bg-transparent"
                                  )}>
                                    {selectedTime === time && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                                  </div>
                                  <span className={cn(
                                    "text-lg",
                                    selectedTime === time ? "text-primary font-bold" : "text-foreground"
                                  )}>{time}</span>
                                </div>
                                {isBooked ? (
                                  <span className="text-xs font-medium px-2 py-1 rounded bg-destructive/10 text-destructive">Penuh</span>
                                ) : (
                                  <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">Tersedia</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between gap-4">
                    <Button type="button" variant="outline" onClick={handlePrevStep} size="lg">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </Button>
                    <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim Pendaftaran...
                        </>
                      ) : (
                        "Kirim Pendaftaran"
                      )}
                    </Button>
                  </div>
                </motion.div>
            </div>
          </Form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}