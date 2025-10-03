"use client";
import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Calendar, Phone, MapPin, Mail, Camera, ListChecks } from 'lucide-react'; // Import ListChecks icon
import { useRouter } from 'next/navigation'; // Import useRouter

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
    namaLengkap: '',
    alamat: '',
    tanggalLahir: '',
    noHp: '',
    email: ''
  });

  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token'); 
      if (!token) {
        setError('Autentikasi diperlukan. Silakan login kembali.');
        setLoading(false);
        router.push('/login'); // Redirect to login if no token
        return;
      }

      const response = await fetch(`http://localhost:3001/auth/profile`, { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If the server responds with a 401 Unauthorized, specifically handle token expiry/invalidity
        if (response.status === 401) {
          localStorage.removeItem('token'); // Clear invalid token
          router.push('/login'); // Redirect to login page
          throw new Error("Sesi berakhir, silakan login kembali.");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memuat profil');
      }
      
      const data: Profile = await response.json();
      
      setProfile(data);
      setFormData({
        namaLengkap: data.namaLengkap,
        alamat: data.alamat,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir).toISOString().split('T')[0] : '',
        noHp: data.noHp,
        email: data.email
      });
    } catch (err: any) {
      setError(err.message || 'Gagal memuat profil');
      console.error('Error fetching profile:', err);
      setProfile(null); // Clear profile on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Simple validation
      if (!formData.namaLengkap.trim()) {
        setError('Nama lengkap tidak boleh kosong');
        setSaving(false);
        return;
      }
      if (!formData.email.trim()) {
        setError('Email tidak boleh kosong');
        setSaving(false);
        return;
      }
      if (!formData.noHp.trim()) {
        setError('Nomor handphone tidak boleh kosong');
        setSaving(false);
        return;
      }
      if (!formData.tanggalLahir.trim()) {
        setError('Tanggal lahir tidak boleh kosong');
        setSaving(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Autentikasi diperlukan. Silakan login kembali.');
        setSaving(false);
        router.push('/login'); // Redirect to login if no token
        return;
      }

      const response = await fetch(`http://localhost:3001/auth/profile`, { 
        method: 'PUT', // Or PATCH, depending on your API
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          alamat: formData.alamat,
          tanggalLahir: new Date(formData.tanggalLahir).toISOString(), 
          noHp: formData.noHp,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan profil');
      }
      
      const updatedProfileData: Profile = await response.json();
      
      setProfile(prev => prev ? {
        ...prev,
        ...updatedProfileData,
        tanggalLahir: updatedProfileData.tanggalLahir,
        updatedAt: updatedProfileData.updatedAt
      } : updatedProfileData);
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan profil');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        namaLengkap: profile.namaLengkap,
        alamat: profile.alamat,
        tanggalLahir: profile.tanggalLahir ? new Date(profile.tanggalLahir).toISOString().split('T')[0] : '',
        noHp: profile.noHp,
        email: profile.email
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleViewBookings = () => {
    router.push('/my-booking'); 
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Belum diisi';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Invalid date string for formatting:", dateString, e);
      return 'Tanggal tidak valid';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile && !loading && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  {profile.fotoProfil ? (
                    <img 
                      src={profile.fotoProfil} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                {/* Photo upload functionality (needs implementation) */}
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.namaLengkap}</h1>
                <p className="text-gray-600">{profile.username}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.statusAktif 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.statusAktif ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {profile.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
            {/* Action buttons: View Bookings and Edit Profile */}
            <div className="flex space-x-2">
              <button
                onClick={handleViewBookings}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ListChecks className="w-4 h-4" />
                <span>Lihat Booking</span>
              </button>
              {(profile.role === 'User' || !profile.role) && (
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    if (!isEditing) { 
                      setFormData({
                        namaLengkap: profile.namaLengkap,
                        alamat: profile.alamat,
                        tanggalLahir: profile.tanggalLahir ? new Date(profile.tanggalLahir).toISOString().split('T')[0] : '',
                        noHp: profile.noHp,
                        email: profile.email
                      });
                    }
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? 'Batal Edit' : 'Edit Profil'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Profil</h2>
          
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
                <p className="text-gray-900 flex items-center space-x-2">
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
              <p className="text-gray-900 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{profile.email}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
            </div>

            {/* Alamat */}
            <div>
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
                <p className="text-gray-900 flex items-start space-x-2">
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
                <p className="text-gray-900 flex items-center space-x-2">
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
                <p className="text-gray-900 flex items-center space-x-2">
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
              <p className="text-xs text-gray-500 mt-1">Username tidak dapat diubah</p>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Batal</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Dibuat pada:</span>
              <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
            </div>
            <div>
              <span className="text-gray-600">Terakhir diupdate:</span>
              <p className="text-gray-900">{formatDate(profile.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;