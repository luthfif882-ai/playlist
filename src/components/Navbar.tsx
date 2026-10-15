import React, { useState } from 'react';
import {
  Music2,
  ListMusic,
  Users,
  BookOpen,
  Search,
  LogIn,
  LogOut,
  UserCheck,
  PlusCircle,
  Wifi,
  CloudCheck,
  Disc3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConnectionStatus } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'playlist' | 'friends' | 'docs';
  setActiveTab: (tab: 'home' | 'playlist' | 'friends' | 'docs') => void;
  connectionStatus: ConnectionStatus;
  onOpenSearch: () => void;
  onOpenAddProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  connectionStatus,
  onOpenSearch,
  onOpenAddProfile,
}) => {
  const { user, myProfile, openAuthModal, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'online':
      case 'synced':
        return (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#145A43]/30 text-[#1ED760] border border-[#145A43]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1ED760] animate-pulse"></span>
            Tersinkron
          </span>
        );
      case 'saving':
        return (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Menyimpan...
          </span>
        );
      case 'connecting':
        return (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Menghubungkan
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
            Offline
          </span>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0B0F0D]/90 border-b border-[#2A352E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#145A43] to-[#1ED760] flex items-center justify-center text-[#0B0F0D] shadow-lg shadow-[#1ED760]/10 transition-transform group-hover:scale-105">
              <Disc3 className="w-6 h-6 animate-spin-slow text-[#0B0F0D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#F5F7F5] group-hover:text-[#1ED760] transition-colors">
                  SPI 1A <span className="text-[#1ED760]">Music Room</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1B241F] text-[#A7B0AA] border border-[#2A352E]">
                  UIN RMS
                </span>
              </div>
              <p className="text-[11px] text-[#A7B0AA] hidden sm:block">
                Sejarah Peradaban Islam
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-[#1B241F] text-[#1ED760] border border-[#2A352E]'
                  : 'text-[#A7B0AA] hover:text-[#F5F7F5] hover:bg-[#141A17]'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setActiveTab('playlist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'playlist'
                  ? 'bg-[#1B241F] text-[#1ED760] border border-[#2A352E]'
                  : 'text-[#A7B0AA] hover:text-[#F5F7F5] hover:bg-[#141A17]'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              Playlist Kelas
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'friends'
                  ? 'bg-[#1B241F] text-[#1ED760] border border-[#2A352E]'
                  : 'text-[#A7B0AA] hover:text-[#F5F7F5] hover:bg-[#141A17]'
              }`}
            >
              <Users className="w-4 h-4" />
              Teman (23)
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'docs'
                  ? 'bg-[#1B241F] text-[#1ED760] border border-[#2A352E]'
                  : 'text-[#A7B0AA] hover:text-[#F5F7F5] hover:bg-[#141A17]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Panduan & Setup
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search */}
            <button
              onClick={onOpenSearch}
              title="Cari lagu atau teman"
              className="p-2 rounded-lg bg-[#141A17] text-[#A7B0AA] hover:text-[#F5F7F5] hover:bg-[#1B241F] border border-[#2A352E] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Connection Status */}
            {getStatusBadge()}

            {/* Add / Edit Profile Button */}
            {user ? (
              <button
                onClick={onOpenAddProfile}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1ED760] text-[#0B0F0D] hover:bg-[#1ED760]/90 transition-all shadow-md shadow-[#1ED760]/20 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                {myProfile ? 'Edit Profil' : 'Tambah Lagumu'}
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#145A43] hover:bg-[#145A43]/80 text-[#F5F7F5] border border-[#1ED760]/30 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-[#1ED760]" />
                Tambah Lagumu
              </button>
            )}

            {/* Auth / Avatar */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full bg-[#141A17] hover:bg-[#1B241F] border border-[#2A352E] transition-all"
                >
                  <span className="text-xs font-medium text-[#F5F7F5] max-w-[90px] truncate hidden lg:inline">
                    {user.displayName || user.email?.split('@')[0] || 'Mahasiswa'}
                  </span>
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[#145A43] border border-[#1ED760]/40 flex items-center justify-center text-xs font-bold text-[#F5F7F5]">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user.displayName?.[0] || user.email?.[0] || 'M').toUpperCase()
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141A17] border border-[#2A352E] shadow-2xl py-2 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-[#2A352E]">
                      <p className="font-semibold text-[#F5F7F5] truncate">
                        {user.displayName || 'Mahasiswa SPI 1A'}
                      </p>
                      <p className="text-xs text-[#A7B0AA] truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAddProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-[#F5F7F5] hover:bg-[#1B241F] hover:text-[#1ED760] transition-colors flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-[#1ED760]" />
                      {myProfile ? 'Edit Profil Saya' : 'Buat Profil Musik'}
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#1B241F] transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar / Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1B241F] text-[#F5F7F5] hover:bg-[#2A352E] border border-[#2A352E] transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-[#1ED760]" />
                Masuk
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F0D]/95 backdrop-blur-md border-t border-[#2A352E] pb- safe">
        <div className="flex items-center justify-around h-14 px-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 ${
              activeTab === 'home' ? 'text-[#1ED760]' : 'text-[#A7B0AA]'
            }`}
          >
            <Disc3 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Beranda</span>
          </button>
          <button
            onClick={() => setActiveTab('playlist')}
            className={`flex flex-col items-center justify-center flex-1 py-1 ${
              activeTab === 'playlist' ? 'text-[#1ED760]' : 'text-[#A7B0AA]'
            }`}
          >
            <ListMusic className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Playlist</span>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex flex-col items-center justify-center flex-1 py-1 ${
              activeTab === 'friends' ? 'text-[#1ED760]' : 'text-[#A7B0AA]'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Teman</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex flex-col items-center justify-center flex-1 py-1 ${
              activeTab === 'docs' ? 'text-[#1ED760]' : 'text-[#A7B0AA]'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Panduan</span>
          </button>
        </div>
      </div>
    </>
  );
};
