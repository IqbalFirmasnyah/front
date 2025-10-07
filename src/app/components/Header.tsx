"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "./ui/modal";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plane, User, Eye, EyeOff, LogOut } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";

// ✅ Sesuaikan path komponen & hook sesuai struktur project kamu
import EnablePushButton from "@/app/components/EnablePushButton";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";

interface HeaderProps {
  currentPage?: string;
}

interface DecodedToken {
  role: string; // 'user' | 'admin' | 'superadmin'
  username?: string;
  namaLengkap?: string;
  exp?: number;
  sub?: number;
}


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Header: React.FC<HeaderProps> = ({ currentPage = "home" }) => {
  const router = useRouter();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // === Forgot password states (dipicu dari link di modal login)
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmNewPassword, setForgotConfirmNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [showForgotNew, setShowForgotNew] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [forgotFieldErrors, setForgotFieldErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});

  // User state
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [jwt, setJwt] = useState<string>("");

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginFieldErrors, setLoginFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Register states
  const [registerData, setRegisterData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    alamat: "",
    tanggalLahir: "",
    noHp: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registerFieldErrors, setRegisterFieldErrors] = useState<
    Partial<Record<keyof typeof registerData, string>>
  >({});

  // tampilkan tombol push hanya saat user login & permission belum granted
  const [canEnablePush, setCanEnablePush] = useState(false);

  // ===== Load token di awal
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
          setJwt("");
        } else {
          setUser(decoded);
          setJwt(token);
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // ===== Evaluasi kapan tombol push bisa muncul
  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "Notification" in window &&
      user != null &&
      Notification.permission !== "granted";
    setCanEnablePush(ok);
  }, [user]);

  // ===== Helpers: Validations
  const validateLogin = () => {
    const errs: { email?: string; password?: string } = {};
    if (!emailRegex.test(loginEmail)) errs.email = "Format email tidak valid.";
    if (!loginPassword || loginPassword.length < 6)
      errs.password = "Password minimal 6 karakter.";
    setLoginFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs: Partial<Record<keyof typeof registerData, string>> = {};
    if (!registerData.username.trim()) errs.username = "Username wajib diisi.";
    if (!registerData.fullName.trim()) errs.fullName = "Nama lengkap wajib diisi.";
    if (!emailRegex.test(registerData.email)) errs.email = "Format email tidak valid.";
    if (!registerData.password || registerData.password.length < 6)
      errs.password = "Password minimal 6 karakter.";
    if (!registerData.alamat.trim()) errs.alamat = "Alamat wajib diisi.";
    if (!registerData.tanggalLahir) errs.tanggalLahir = "Tanggal lahir wajib diisi.";
    if (!registerData.noHp.trim()) errs.noHp = "Nomor HP wajib diisi.";
    setRegisterFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateForgotStep1 = () => {
    const errs: { email?: string } = {};
    if (!emailRegex.test(forgotEmail)) errs.email = "Format email tidak valid.";
    setForgotFieldErrors((p) => ({ ...p, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const validateForgotStep2 = () => {
    const errs: { code?: string; newPassword?: string; confirmNewPassword?: string } = {};
    if (!forgotCode.trim()) errs.code = "Kode verifikasi wajib diisi.";
    if (!forgotNewPassword || forgotNewPassword.length < 6)
      errs.newPassword = "Password baru minimal 6 karakter.";
    if (!forgotConfirmNewPassword)
      errs.confirmNewPassword = "Konfirmasi password wajib diisi.";
    if (forgotNewPassword && forgotConfirmNewPassword && forgotNewPassword !== forgotConfirmNewPassword)
      errs.confirmNewPassword = "Konfirmasi tidak cocok dengan password baru.";
    setForgotFieldErrors((p) => ({ ...p, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
  
    try {
    
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data?.message) ? data.message.join(', ') : data?.message || 'Login failed'
        );
      }
  
      const accessToken: string | undefined = data.accessToken ?? data.access_token;
      if (!accessToken) throw new Error('Access token not found in response.');
  
      localStorage.setItem('token', accessToken);
  
      try {
        const decoded = jwtDecode<DecodedToken>(accessToken);
  
        // (opsional) cek expiry
        if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
  
        // ✅ Tampilkan toast sukses
        const name = decoded.username || decoded.namaLengkap || 'pengguna';
        toast.success('Berhasil masuk', { description: `Halo, ${name}!` });
  
        // Arahkan sesuai role
        const role = (decoded.role || '').toLowerCase();
        if (role === 'admin' || role === 'superadmin') {
          router.replace('/admin/dashboard');
        } else if (role === 'user') {
          router.replace('/paket-wisata');
        } else {
          console.warn('Unrecognized role:', decoded.role);
          router.replace('/'); // fallback
        }
      } catch (decErr) {
        console.error('Failed to decode token after login:', decErr);
        setLoginError('Login successful, but failed to identify role. Please try again.');
        toast.error('Login berhasil, tapi gagal membaca peran. Coba lagi.');
        router.replace('/'); // fallback
      }
    } catch (err: any) {
      console.error('Error during login:', err);
      setLoginError(err?.message || 'Login failed');
      toast.error(err?.message || 'Login gagal');
    } finally {
      setLoginLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegistrationSuccess(false);

    const valid = validateRegister();
    if (!valid) {
      toast.error("Periksa kembali inputan kamu.");
      return;
    }
    if (!agreeToTerms) {
      setRegisterError("Anda harus menyetujui S&K dan Kebijakan Privasi.");
      toast.error("Anda belum menyetujui S&K.");
      return;
    }

    setRegisterLoading(true);
    try {
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
          namaLengkap: registerData.fullName,
          alamat: registerData.alamat,
          tanggalLahir: registerData.tanggalLahir,
          noHp: registerData.noHp,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Pendaftaran gagal. Coba lagi.");

      const token = data.accessToken ?? data.access_token;
      if (token) {
        localStorage.setItem("token", token);
        setJwt(token);
        const decoded = jwtDecode<DecodedToken>(token);
        setUser(decoded);
      }

      setRegistrationSuccess(true);
      toast.success("Pendaftaran berhasil! 🎉");

      setTimeout(() => {
        setRegisterOpen(false);
        setRegisterData({
          username: "",
          fullName: "",
          email: "",
          password: "",
          alamat: "",
          tanggalLahir: "",
          noHp: "",
        });
        setRegisterFieldErrors({});
        setAgreeToTerms(false);
      }, 800);
    } catch (error: any) {
      setRegisterError(error.message);
      toast.error(error.message || "Pendaftaran gagal.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    setRegisterFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ===== Forgot Password: Step 1 (request)
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (!validateForgotStep1()) return;

    setForgotLoading(true);
    try {
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim kode reset password.");

      toast.success(data.message || "Kode reset terkirim ke email kamu.");
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err.message);
      toast.error(err.message || "Gagal mengirim kode reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ===== Forgot Password: Step 2 (reset)
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (!validateForgotStep2()) return;

    setForgotLoading(true);
    try {
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotCode,
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal reset password.");

      toast.success(data.message || "Password berhasil direset. Silakan login.");
      // Reset & close
      setForgotOpen(false);
      setForgotStep(1);
      setForgotEmail("");
      setForgotCode("");
      setForgotNewPassword("");
      setForgotConfirmNewPassword("");
      setForgotFieldErrors({});
      setLoginOpen(true); // opsional: buka modal login
    } catch (err: any) {
      setForgotError(err.message);
      toast.error(err.message || "Gagal reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ===== Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setJwt("");
    toast.success("Berhasil keluar.");
    window.location.href = "/";
  };

  useRealtimeNotifications(jwt);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm">
      <Toaster richColors position="top-right" />

      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary rounded-lg">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">YonsTrans</h1>
            <p className="text-xs text-muted-foreground">Jelajahi Indonesia</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/" className={currentPage === "home" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}>Beranda</a>
          <a href="/paket-wisata" className={currentPage === "packages" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}>Paket Wisata</a>
          <a href="/fasilitas" className={currentPage === "fasilitas" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}>Fasilitas</a>
          <a href="/my-booking" className={currentPage === "bookings" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}>Booking Saya</a>
          <a href="/about" className={currentPage === "about" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}>Tentang Kami</a>
        </nav>

        {/* Auth / Actions */}
        <div className="flex items-center space-x-3">
          {!user ? (
            <>
              {/* Login Modal */}
              <Modal open={loginOpen} onOpenChange={setLoginOpen}>
                <ModalTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-1" /> Masuk
                  </Button>
                </ModalTrigger>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Masuk</ModalTitle>
                  </ModalHeader>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (loginFieldErrors.email) setLoginFieldErrors((p) => ({ ...p, email: undefined }));
                        }}
                        required
                      />
                      {loginFieldErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{loginFieldErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            if (loginFieldErrors.password) setLoginFieldErrors((p) => ({ ...p, password: undefined }));
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-2 top-2 text-muted-foreground"
                          aria-label={showLoginPassword ? "Sembunyikan password" : "Lihat password"}
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Link Lupa Password? */}
                      <p className="mt-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotOpen(true);
                            setForgotStep(1);
                            setForgotEmail(loginEmail || "");
                          }}
                          className="text-primary hover:underline"
                        >
                          Lupa Password?
                        </button>
                      </p>

                      {loginFieldErrors.password && (
                        <p className="mt-1 text-xs text-red-600">{loginFieldErrors.password}</p>
                      )}
                    </div>

                    {/* Pesan error dari server */}
                    {loginError && <p className="text-red-600 text-sm">{loginError}</p>}

                    <Button type="submit" className="w-full" disabled={loginLoading}>
                      {loginLoading ? "Masuk..." : "Masuk"}
                    </Button>
                  </form>
                </ModalContent>
              </Modal>

              {/* Register Modal */}
              <Modal open={registerOpen} onOpenChange={setRegisterOpen}>
                <ModalTrigger asChild>
                  <Button size="sm">Daftar</Button>
                </ModalTrigger>
                <ModalContent className="max-h-[80vh] overflow-y-auto">
                  <ModalHeader>
                    <ModalTitle>Daftar</ModalTitle>
                  </ModalHeader>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Input name="username" placeholder="Username" value={registerData.username} onChange={handleRegisterInputChange} required />
                      {registerFieldErrors.username && (
                        <p className="mt-1 text-xs text-red-600">{registerFieldErrors.username}</p>
                      )}
                    </div>
                    <div>
                      <Input name="fullName" placeholder="Nama Lengkap" value={registerData.fullName} onChange={handleRegisterInputChange} required />
                      {registerFieldErrors.fullName && (
                        <p className="mt-1 text-xs text-red-600">{registerFieldErrors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <Input name="email" type="email" placeholder="Email" value={registerData.email} onChange={handleRegisterInputChange} required />
                      {registerFieldErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{registerFieldErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <Input name="password" type={showRegisterPassword ? "text" : "password"} placeholder="Password" value={registerData.password} onChange={handleRegisterInputChange} required />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((v) => !v)}
                        className="mt-1 text-xs text-muted-foreground"
                      >
                        {showRegisterPassword ? "Sembunyikan" : "Lihat"} password
                      </button>
                      {registerFieldErrors.password && (
                        <p className="mt-1 text-xs text-red-600">{registerFieldErrors.password}</p>
                      )}
                    </div>
                    <div>
                      <Input name="alamat" placeholder="Alamat" value={registerData.alamat} onChange={handleRegisterInputChange} required />
                      {registerFieldErrors.alamat && (
                        <p className="mt-1 text-xs text-red-600">{registerFieldErrors.alamat}</p>
                      )}
                    </div>
                    <div>
                      <Input name="tanggalLahir" type="date" value={registerData.tanggalLahir} onChange={handleRegisterInputChange} required />
                      {registerFieldErrors.tanggalLahir && (
                        <p className="mt-1 text-xs text-red-600">{registerFieldErrors.tanggalLahir}</p>
                      )}
                    </div>
                    <div>
                      <Input name="noHp" placeholder="Nomor HP" value={registerData.noHp} onChange={handleRegisterInputChange} required />
                      {registerFieldErrors.noHp && (
                        <p className="mt-1 text-xs text-red-600">{registerFieldErrors.noHp}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                      />
                      <Label htmlFor="terms">Saya setuju dengan syarat & ketentuan</Label>
                    </div>

                    {registerError && <p className="text-red-600 text-sm">{registerError}</p>}
                    {registrationSuccess && (
                      <p className="text-green-600 text-sm">Akun berhasil dibuat.</p>
                    )}

                    <Button type="submit" className="w-full" disabled={registerLoading || !agreeToTerms}>
                      {registerLoading ? "Mendaftar..." : "Daftar"}
                    </Button>
                  </form>
                </ModalContent>
              </Modal>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Hi, {user.username || "User"}</span>

              {canEnablePush && <EnablePushButton jwt={jwt} />}


              <Button variant="outline" size="sm" onClick={() => router.push("/profile")}>
                <User className="h-4 w-4 mr-1" /> Profil
              </Button>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Keluar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* === Forgot Password Modal (dipicu dari link "Lupa Password?" di modal login) */}
      <Modal
        open={forgotOpen}
        onOpenChange={(o) => {
          setForgotOpen(o);
          if (!o) {
            setForgotStep(1);
            setForgotEmail("");
            setForgotCode("");
            setForgotNewPassword("");
            setForgotConfirmNewPassword("");
            setForgotError("");
            setForgotFieldErrors({});
          }
        }}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{forgotStep === 1 ? "Lupa Password" : "Reset Password"}</ModalTitle>
          </ModalHeader>

          {forgotStep === 1 ? (
            <form onSubmit={handleForgotRequest} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotFieldErrors.email) setForgotFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="nama@email.com"
                  required
                />
                {forgotFieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{forgotFieldErrors.email}</p>
                )}
              </div>

              {forgotError && <p className="text-red-600 text-sm">{forgotError}</p>}

              <Button type="submit" className="w-full" disabled={forgotLoading}>
                {forgotLoading ? "Mengirim kode..." : "Kirim Kode Reset"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleForgotReset} className="space-y-4">
              <div>
                <Label>Kode Verifikasi (OTP)</Label>
                <Input
                  value={forgotCode}
                  onChange={(e) => {
                    // opsional: batasi 6 digit angka
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setForgotCode(v);
                    if (forgotFieldErrors.code) setForgotFieldErrors((p) => ({ ...p, code: undefined }));
                  }}
                  placeholder="Masukkan kode yang dikirim ke email"
                  required
                />
                {forgotFieldErrors.code && (
                  <p className="mt-1 text-xs text-red-600">{forgotFieldErrors.code}</p>
                )}
              </div>

              <div>
                <Label>Password Baru</Label>
                <div className="relative">
                  <Input
                    type={showForgotNew ? "text" : "password"}
                    value={forgotNewPassword}
                    onChange={(e) => {
                      setForgotNewPassword(e.target.value);
                      if (forgotFieldErrors.newPassword) setForgotFieldErrors((p) => ({ ...p, newPassword: undefined }));
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNew((v) => !v)}
                    className="absolute right-2 top-2 text-muted-foreground"
                  >
                    {showForgotNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {forgotFieldErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">{forgotFieldErrors.newPassword}</p>
                )}
              </div>

              <div>
                <Label>Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    type={showForgotConfirm ? "text" : "password"}
                    value={forgotConfirmNewPassword}
                    onChange={(e) => {
                      setForgotConfirmNewPassword(e.target.value);
                      if (forgotFieldErrors.confirmNewPassword)
                        setForgotFieldErrors((p) => ({ ...p, confirmNewPassword: undefined }));
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirm((v) => !v)}
                    className="absolute right-2 top-2 text-muted-foreground"
                  >
                    {showForgotConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {forgotFieldErrors.confirmNewPassword && (
                  <p className="mt-1 text-xs text-red-600">{forgotFieldErrors.confirmNewPassword}</p>
                )}
              </div>

              {forgotError && <p className="text-red-600 text-sm">{forgotError}</p>}

              <Button type="submit" className="w-full" disabled={forgotLoading}>
                {forgotLoading ? "Menyimpan..." : "Reset Password"}
              </Button>
            </form>
          )}
        </ModalContent>
      </Modal>
    </header>
  );
};

export default Header;
function setErrorMsg(arg0: string) {
  throw new Error("Function not implemented.");
}

function isAdminish(decoded: DecodedToken) {
  throw new Error("Function not implemented.");
}

