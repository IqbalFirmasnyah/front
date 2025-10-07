"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Edit,
  Save,
  X,
  Calendar,
  Phone,
  MapPin,
  Mail,
  Camera,
  ListChecks,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

interface Profile {
  userId: number;
  username: string;
  email: string;
  namaLengkap: string;
  alamat: string;
  tanggalLahir: string;
  noHp: string;
  fotoProfil: string | null;
  statusAktif: boolean;
  createdAt: string;
  updatedAt: string;
  role: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    namaLengkap: "",
    alamat: "",
    tanggalLahir: "",
    noHp: "",
    email: "",
  });

  // === Change Password modal states
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changePwFieldErrors, setChangePwFieldErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});

  const router = useRouter();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Autentikasi diperlukan. Silakan login kembali.");
        toast.error("Sesi berakhir. Silakan login kembali.");
        setLoading(false);
        router.push("/login");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Sesi berakhir. Silakan login kembali.");
          router.push("/login");
          throw new Error("Sesi berakhir, silakan login kembali.");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memuat profil");
      }

      const data: Profile = await response.json();

      setProfile(data);
      setFormData({
        namaLengkap: data.namaLengkap,
        alamat: data.alamat,
        tanggalLahir: data.tanggalLahir
          ? new Date(data.tanggalLahir).toISOString().split("T")[0]
          : "",
        noHp: data.noHp,
        email: data.email,
      });
    } catch (err: any) {
      setError(err.message || "Gagal memuat profil");
      console.error("Error fetching profile:", err);
      setProfile(null);
      toast.error(err.message || "Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validasi sederhana
      if (!formData.namaLengkap.trim()) {
        setError("Nama lengkap tidak boleh kosong");
        toast.error("Nama lengkap tidak boleh kosong");
        setSaving(false);
        return;
      }
      if (!formData.email.trim()) {
        setError("Email tidak boleh kosong");
        toast.error("Email tidak boleh kosong");
        setSaving(false);
        return;
      }
      if (!formData.noHp.trim()) {
        setError("Nomor handphone tidak boleh kosong");
        toast.error("Nomor handphone tidak boleh kosong");
        setSaving(false);
        return;
      }
      if (!formData.tanggalLahir.trim()) {
        setError("Tanggal lahir tidak boleh kosong");
        toast.error("Tanggal lahir tidak boleh kosong");
        setSaving(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Autentikasi diperlukan. Silakan login kembali.");
        toast.error("Sesi berakhir. Silakan login kembali.");
        setSaving(false);
        router.push("/login");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          alamat: formData.alamat,
          tanggalLahir: new Date(formData.tanggalLahir).toISOString(),
          noHp: formData.noHp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan profil");
      }

      const updatedProfileData: Profile = await response.json();

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              ...updatedProfileData,
              tanggalLahir: updatedProfileData.tanggalLahir,
              updatedAt: updatedProfileData.updatedAt,
            }
          : updatedProfileData
      );

      setIsEditing(false);
      toast.success("Profil berhasil disimpan ✅");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan profil");
      console.error("Error updating profile:", err);
      toast.error(err.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        namaLengkap: profile.namaLengkap,
        alamat: profile.alamat,
        tanggalLahir: profile.tanggalLahir
          ? new Date(profile.tanggalLahir).toISOString().split("T")[0]
          : "",
        noHp: profile.noHp,
        email: profile.email,
      });
    }
    setIsEditing(false);
    setError(null);
    toast.info("Perubahan dibatalkan");
  };

  const handleViewBookings = () => {
    router.push("/my-booking");
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Belum diisi";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Invalid date string for formatting:", dateString, e);
      return "Tanggal tidak valid";
    }
  };

  // ===== Change Password logic
  const validateChangePassword = () => {
    const errs: {
      oldPassword?: string;
      newPassword?: string;
      confirmNewPassword?: string;
    } = {};
    if (!oldPassword) errs.oldPassword = "Password lama wajib diisi.";
    if (!newPassword || newPassword.length < 6)
      errs.newPassword = "Password baru minimal 6 karakter.";
    if (oldPassword && newPassword && oldPassword === newPassword)
      errs.newPassword = "Password baru tidak boleh sama dengan password lama.";
    if (!confirmNewPassword)
      errs.confirmNewPassword = "Konfirmasi password baru wajib diisi.";
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword)
      errs.confirmNewPassword = "Konfirmasi tidak cocok dengan password baru.";
    setChangePwFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError(null);
    if (!validateChangePassword()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setChangePwError("Sesi tidak valid, silakan login kembali.");
      toast.error("Sesi berakhir. Silakan login kembali.");
      router.push("/login");
      return;
    }

    setChangePwLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengubah password.");

      // success
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setChangePwFieldErrors({});
      setChangePwOpen(false);
      toast.success(data.message || "Kata sandi berhasil diubah ✅");
    } catch (err: any) {
      setChangePwError(err.message || "Gagal mengubah password.");
      toast.error(err.message || "Gagal mengubah password.");
    } finally {
      setChangePwLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat profil...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile && !loading && error) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center bg-white shadow rounded-xl p-6 w-full max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!profile) return null;

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="min-h-screen bg-gray-50 py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Topbar: Back + Title */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm md:text-base px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <div className="w-[88px] md:w-[120px]" aria-hidden /> {/* spacer */}
          </div>

          {/* Main Grid: Sidebar (summary+actions) / Content (details) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column: Summary + Actions */}
            <div className="space-y-4 md:space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
                <div className="absolute inset-x-0 -top-6 h-24 bg-gradient-to-r from-blue-50 to-indigo-50 pointer-events-none" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-white ring-2 ring-blue-100 flex items-center justify-center overflow-hidden shadow-sm">
                    {profile.fotoProfil ? (
                      <img
                        src={profile.fotoProfil}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-xl font-semibold text-gray-900">
                      {profile.namaLengkap}
                    </p>
                    <p className="text-sm text-gray-500">@{profile.username}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.statusAktif
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profile.statusAktif ? "Aktif" : "Tidak Aktif"}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {profile.role || "User"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleViewBookings}
                    className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg transition"
                  >
                    <ListChecks className="w-4 h-4" />
                    Lihat Booking
                  </button>

                  <button
                    onClick={() => setChangePwOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg transition"
                  >
                    <Lock className="w-4 h-4" />
                    Ubah Password
                  </button>

                  <button
                    onClick={() => {
                      setIsEditing((v) => !v);
                      if (!isEditing) {
                        setFormData({
                          namaLengkap: profile.namaLengkap,
                          alamat: profile.alamat,
                          tanggalLahir: profile.tanggalLahir
                            ? new Date(profile.tanggalLahir)
                                .toISOString()
                                .split("T")[0]
                            : "",
                          noHp: profile.noHp,
                          email: profile.email,
                        });
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? "Batal Edit" : "Edit Profil"}
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <h1 className="text-lg md:text-2xl mr-2 font-bold text-gray-900">
                  Profil Saya
                </h1>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Informasi Akun
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600">Dibuat pada</span>
                    <span className="text-gray-900">
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600">Terakhir diupdate</span>
                    <span className="text-gray-900">
                      {formatDate(profile.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Details / Form */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Informasi Profil
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="namaLengkap"
                        value={formData.namaLengkap}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan nama lengkap"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{profile.namaLengkap}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{profile.email}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Email tidak dapat diubah
                    </p>
                  </div>

                  {/* Alamat */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    {isEditing ? (
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan alamat"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>{profile.alamat}</span>
                      </p>
                    )}
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="tanggalLahir"
                        value={formData.tanggalLahir}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(profile.tanggalLahir)}</span>
                      </p>
                    )}
                  </div>

                  {/* No HP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. Handphone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="noHp"
                        value={formData.noHp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan nomor handphone"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{profile.noHp}</span>
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <p className="text-gray-900">{profile.username}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Username tidak dapat diubah
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t">
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === Modal Ubah Password */}
      {changePwOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ubah Password</h3>
              <button
                onClick={() => {
                  setChangePwOpen(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setChangePwFieldErrors({});
                  setChangePwError(null);
                  setShowOld(false);
                  setShowNew(false);
                  setShowConfirm(false);
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Lama
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      if (changePwFieldErrors.oldPassword)
                        setChangePwFieldErrors((p) => ({
                          ...p,
                          oldPassword: undefined,
                        }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((v) => !v)}
                    className="absolute right-2 top-2.5 text-gray-500"
                    aria-label={showOld ? "Sembunyikan" : "Lihat"}
                  >
                    {showOld ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {changePwFieldErrors.oldPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {changePwFieldErrors.oldPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (changePwFieldErrors.newPassword)
                        setChangePwFieldErrors((p) => ({
                          ...p,
                          newPassword: undefined,
                        }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-2 top-2.5 text-gray-500"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {changePwFieldErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {changePwFieldErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      if (changePwFieldErrors.confirmNewPassword)
                        setChangePwFieldErrors((p) => ({
                          ...p,
                          confirmNewPassword: undefined,
                        }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-2.5 text-gray-500"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {changePwFieldErrors.confirmNewPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {changePwFieldErrors.confirmNewPassword}
                  </p>
                )}
              </div>

              {changePwError && (
                <div className="bg-red-50 text-red-700 text-sm rounded p-2">
                  {changePwError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setChangePwOpen(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setChangePwFieldErrors({});
                    setChangePwError(null);
                    setShowOld(false);
                    setShowNew(false);
                    setShowConfirm(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={changePwLoading}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {changePwLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
