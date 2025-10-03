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

interface HeaderProps {
  currentPage?: string;
}

interface DecodedToken {
  role: string; // 'user', 'admin', 'superadmin'
  username?: string;
  namaLengkap?: string;
  exp?: number;
}

const Header: React.FC<HeaderProps> = ({ currentPage = "home" }) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // User state
  const [user, setUser] = useState<DecodedToken | null>(null);

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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

  // Cek token saat pertama kali load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        // Jika token expired, hapus
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (!data.accessToken) throw new Error("Access token not found.");

      localStorage.setItem("token", data.accessToken);

      const decoded = jwtDecode<DecodedToken>(data.accessToken);
      setUser(decoded);

      // Reset & close
      setLoginEmail("");
      setLoginPassword("");
      setLoginOpen(false);
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");
    setRegistrationSuccess(false);

    if (!agreeToTerms) {
      setRegisterError("You must agree to the Terms and Privacy Policy.");
      setRegisterLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/auth/register", {
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
      if (!res.ok) throw new Error(data.message || "Registration failed");

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        const decoded = jwtDecode<DecodedToken>(data.access_token);
        setUser(decoded);
      }

      setRegistrationSuccess(true);

      // Reset & close
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
        setAgreeToTerms(false);
      }, 1500);
    } catch (error: any) {
      setRegisterError(error.message);
    } finally {
      if (!registrationSuccess) setRegisterLoading(false);
    }
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm">
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
          <a href="/profile" className={currentPage === "profile" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}>Profile</a>
        </nav>

        {/* Auth Buttons */}
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
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-2 top-2 text-muted-foreground"
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      
                    </div>
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
                    <Input name="username" placeholder="Username" value={registerData.username} onChange={handleRegisterInputChange} required />
                    <Input name="fullName" placeholder="Nama Lengkap" value={registerData.fullName} onChange={handleRegisterInputChange} required />
                    <Input name="email" type="email" placeholder="Email" value={registerData.email} onChange={handleRegisterInputChange} required />
                    <Input name="password" type={showRegisterPassword ? "text" : "password"} placeholder="Password" value={registerData.password} onChange={handleRegisterInputChange} required />
                    <Input name="alamat" placeholder="Alamat" value={registerData.alamat} onChange={handleRegisterInputChange} required />
                    <Input name="tanggalLahir" type="date" value={registerData.tanggalLahir} onChange={handleRegisterInputChange} required />
                    <Input name="noHp" placeholder="Nomor HP" value={registerData.noHp} onChange={handleRegisterInputChange} required />
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} />
                      <Label>Saya setuju dengan syarat & ketentuan</Label>
                    </div>
                    {registerError && <p className="text-red-600 text-sm">{registerError}</p>}
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
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Keluar
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
