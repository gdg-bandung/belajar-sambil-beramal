import { Link, Form, useActionData, useNavigation, redirect } from "react-router";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/server/auth-service.server";
import { useState, useEffect } from "react";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" };
  }

  try {
    const { token, user } = await authService.login(email, password);
    
    // Default redirect based on role
    let target = (user.role === "admin" || user.role === "superadmin") ? "/admin/dashboard" : "/dashboard";
    
    // Override if redirectTo is present (e.g. from register-speaker)
    if (redirectTo) {
      target = redirectTo;
    }
    
    return redirect(target, {
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; Secure`,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Login failed";
    return { error: errorMessage };
  }
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const actionData = useActionData() as { error?: string };
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center container px-4 py-24 md:py-32">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Selamat Datang Kembali</h1>
            <p className="text-muted-foreground mt-2">Masuk untuk mengelola pendaftaran pembicara Anda</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <Form method="post" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="nama@contoh.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="******" 
                    className="pr-10"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {actionData?.error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {actionData.error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Belum punya akun? </span>
              <Link to="/register" className="text-primary hover:underline font-medium">
                Daftar Sekarang
              </Link>
            </div>
          </div>
          
          <div className="text-center">
             <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
               <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
             </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}