import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  ShieldCheck,
  Server,
  Terminal,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const DocumentationTab: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isValidId(id) { return id is string && id.size() > 0 && id.size() <= 128; }

    function isValidMember(data) {
      return data.keys().hasAll(['uid', 'displayName', 'songTitle', 'artistName'])
        && data.uid is string && data.uid.size() > 0 && data.uid.size() <= 128
        && data.displayName is string && data.displayName.size() >= 2 && data.displayName.size() <= 100
        && data.songTitle is string && data.songTitle.size() >= 1 && data.songTitle.size() <= 200
        && data.artistName is string && data.artistName.size() >= 1 && data.artistName.size() <= 200
        && (!('personalMessage' in data) || (data.personalMessage is string && data.personalMessage.size() <= 500))
        && (!('photoURL' in data) || (data.photoURL is string && data.photoURL.size() <= 2048))
        && (!('songId' in data) || (data.songId is string && data.songId.size() <= 128))
        && (!('albumArtwork' in data) || (data.albumArtwork is string && data.albumArtwork.size() <= 2048))
        && (!('previewUrl' in data) || (data.previewUrl is string && data.previewUrl.size() <= 2048))
        && (!('trackUrl' in data) || (data.trackUrl is string && data.trackUrl.size() <= 2048))
        && data.uid == request.auth.uid;
    }

    match /members/{memberId} {
      allow read: if true;
      allow create: if isSignedIn() && isValidId(memberId) && request.auth.uid == memberId && isValidMember(request.resource.data);
      allow update: if isSignedIn() && isValidId(memberId) && request.auth.uid == memberId && isValidMember(request.resource.data) && request.resource.data.uid == resource.data.uid;
      allow delete: if isOwner(memberId);
    }

    match /classMembers/{memberId} {
      allow read: if true;
      allow write: if isSignedIn() && isValidId(memberId);
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

  const storageRulesCode = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profilePhotos/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="bg-[#141A17] p-6 sm:p-8 rounded-3xl border border-[#2A352E] space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B241F] border border-[#2A352E] text-xs font-semibold text-[#1ED760]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dokumentasi Resmi & Panduan Produksi</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F5]">
          SPI 1A Music Room — Panduan Teknis Lengkap
        </h2>
        <p className="text-sm text-[#A7B0AA] leading-relaxed">
          Dokumentasi komprehensif 14 poin arsitektur, konfigurasi Firebase Authentication, Cloud Firestore,
          Firebase Storage, iTunes Search API, Security Rules, hingga panduan pengujian dan troubleshooting.
        </p>
      </div>

      {/* 1. Ringkasan Arsitektur */}
      <div className="bg-[#141A17] p-6 rounded-2xl border border-[#2A352E] space-y-4">
        <h3 className="text-lg font-bold text-[#F5F7F5] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#1ED760]" />
          1. Ringkasan Arsitektur
        </h3>
        <p className="text-xs sm:text-sm text-[#A7B0AA] leading-relaxed">
          Website dibangun dengan arsitektur modern berorientasi event dan realtime synchronization:
        </p>
        <ul className="text-xs sm:text-sm text-[#A7B0AA] space-y-2 list-disc list-inside">
          <li><strong className="text-[#F5F7F5]">Frontend:</strong> React 19 + TypeScript + Vite + Tailwind CSS v4 untuk performa instan dan UI responsif.</li>
          <li><strong className="text-[#F5F7F5]">Autentikasi:</strong> Firebase Authentication (Google Sign-In Popup & Email/Password) dengan UID sebagai identitas tunggal kepemilikan.</li>
          <li><strong className="text-[#F5F7F5]">Database:</strong> Google Cloud Firestore dengan subscription <code className="text-[#1ED760]">onSnapshot</code> realtime listener, index terurut, dan error handling kontekstual.</li>
          <li><strong className="text-[#F5F7F5]">Storage:</strong> Firebase Storage untuk foto profil resolusi tinggi dengan path <code className="text-[#1ED760]">profilePhotos/{'{uid}'}/...</code>.</li>
          <li><strong className="text-[#F5F7F5]">Music Provider:</strong> iTunes Search API resmi untuk metadata lagu legal & 30-detik AAC preview streaming.</li>
          <li><strong className="text-[#F5F7F5]">Audio Engine:</strong> Singleton <code className="text-[#1ED760]">HTMLAudioElement</code> global player dengan kontrol antrian, repeat, shuffle, scrubber, dan soundwave visualizer.</li>
        </ul>
      </div>

      {/* 2. Struktur Folder Lengkap */}
      <div className="bg-[#141A17] p-6 rounded-2xl border border-[#2A352E] space-y-3">
        <h3 className="text-lg font-bold text-[#F5F7F5] flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#1ED760]" />
          2. Struktur Folder Lengkap
        </h3>
        <pre className="p-4 rounded-xl bg-[#0B0F0D] border border-[#2A352E] text-xs font-mono text-[#1ED760] overflow-x-auto leading-relaxed">
{`spi-1a-music-room/
├── firebase-applet-config.json    # Kredensial Firebase SDK terisolasi
├── firebase-blueprint.json        # Schema Intermediate Representation (IR)
├── firestore.rules                # Hardened Firestore Security Rules
├── storage.rules                  # Firebase Storage Rules
├── index.html                     # HTML5 Entry point + typography
├── package.json                   # Dependencies (Firebase, Lucide, Tailwind)
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite & Tailwind build plugins
└── src/
    ├── main.tsx                   # React root hydration
    ├── App.tsx                    # Main orchestrator & real-time listeners
    ├── index.css                  # Tailwind v4 variables & soundwave keyframes
    ├── types/
    │   └── index.ts               # MemberProfile, MusicTrackResult, Types
    ├── firebase/
    │   ├── config.ts              # Firebase app, db, auth, storage init
    │   └── errorHandler.ts        # handleFirestoreError standard handler
    ├── context/
    │   ├── AuthContext.tsx        # Firebase auth session provider
    │   └── PlayerContext.tsx      # Global audio queue & playback engine
    ├── services/
    │   ├── musicApi.ts            # iTunes Search API client
    │   └── memberService.ts       # Firestore CRUD & Storage upload functions
    ├── data/
    │   └── initialStudents.ts     # 23 data awal mahasiswa SPI 1A & lagunya
    └── components/
        ├── Navbar.tsx             # Responsive header & connection badge
        ├── HeroSection.tsx        # Title, counters, and vinyl record
        ├── ClassPlaylist.tsx      # Table with filter, alphabet search, preview
        ├── FriendsDirectory.tsx   # 1:1 responsive member card grid
        ├── ProfileModal.tsx       # Detail modal with story & owner actions
        ├── EditProfileModal.tsx   # Song search, photo upload, preview testing
        ├── AuthModal.tsx          # Google & Email/Password modal
        ├── GlobalPlayer.tsx       # Bottom sticky audio player
        └── DocumentationTab.tsx   # Panduan teknis lengkap & troubleshooting`}
        </pre>
      </div>

      {/* 4 & 5. Firestore & Storage Security Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141A17] p-6 rounded-2xl border border-[#2A352E] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F5F7F5] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1ED760]" />
              5. Firestore Security Rules
            </h3>
            <button
              onClick={() => copyToClipboard(firestoreRulesCode, 'firestore-rules')}
              className="px-2.5 py-1 rounded-lg bg-[#1B241F] text-[#A7B0AA] hover:text-[#1ED760] text-xs flex items-center gap-1 border border-[#2A352E]"
            >
              {copiedSection === 'firestore-rules' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Salin
            </button>
          </div>
          <p className="text-xs text-[#A7B0AA]">
            Melindungi kepemilikan data profil mahasiswa. Hanya pengguna dengan UID yang cocok yang dapat membuat atau mengedit profil miliknya.
          </p>
          <pre className="p-3.5 rounded-xl bg-[#0B0F0D] border border-[#2A352E] text-[11px] font-mono text-[#A7B0AA] overflow-x-auto max-h-56">
            {firestoreRulesCode}
          </pre>
        </div>

        <div className="bg-[#141A17] p-6 rounded-2xl border border-[#2A352E] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F5F7F5] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1ED760]" />
              6. Storage Security Rules
            </h3>
            <button
              onClick={() => copyToClipboard(storageRulesCode, 'storage-rules')}
              className="px-2.5 py-1 rounded-lg bg-[#1B241F] text-[#A7B0AA] hover:text-[#1ED760] text-xs flex items-center gap-1 border border-[#2A352E]"
            >
              {copiedSection === 'storage-rules' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Salin
            </button>
          </div>
          <p className="text-xs text-[#A7B0AA]">
            Memvalidasi ukuran file gambar &lt; 5MB, format image/*, serta memastikan foto tersimpan di path UID pemilik.
          </p>
          <pre className="p-3.5 rounded-xl bg-[#0B0F0D] border border-[#2A352E] text-[11px] font-mono text-[#A7B0AA] overflow-x-auto max-h-56">
            {storageRulesCode}
          </pre>
        </div>
      </div>

      {/* 7 - 11. Panduan Firebase Console & Deployment */}
      <div className="bg-[#141A17] p-6 rounded-2xl border border-[#2A352E] space-y-5">
        <h3 className="text-lg font-bold text-[#F5F7F5] flex items-center gap-2">
          <Server className="w-5 h-5 text-[#1ED760]" />
          7–12. Panduan Setup Firebase & Deployment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#A7B0AA]">
          <div className="p-4 rounded-xl bg-[#1B241F] border border-[#2A352E] space-y-2">
            <h4 className="font-bold text-[#F5F7F5]">Langkah 1: Firebase Project & Auth</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-[#1ED760] underline">Firebase Console</a>.</li>
              <li>Pilih menu <strong>Authentication &rarr; Get Started</strong>.</li>
              <li>Aktifkan penyedia <strong>Google</strong> dan <strong>Email/Password</strong>.</li>
              <li>Tambahkan domain aplikasi hosting ke <strong>Authorized Domains</strong>.</li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-[#1B241F] border border-[#2A352E] space-y-2">
            <h4 className="font-bold text-[#F5F7F5]">Langkah 2: Cloud Firestore Database</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Pilih menu <strong>Firestore Database &rarr; Create Database</strong>.</li>
              <li>Pilih mode <strong>Production Mode</strong>.</li>
              <li>Buka tab <strong>Rules</strong>, paste aturan Firestore di atas, lalu klik <strong>Publish</strong>.</li>
              <li>Collection <code className="text-[#1ED760]">members</code> akan terisi otomatis saat pengguna menyimpan profil.</li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-[#1B241F] border border-[#2A352E] space-y-2">
            <h4 className="font-bold text-[#F5F7F5]">Langkah 3: Firebase Storage</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Pilih menu <strong>Storage &rarr; Get Started</strong>.</li>
              <li>Buka tab <strong>Rules</strong>, paste aturan Storage di atas, lalu klik <strong>Publish</strong>.</li>
              <li>File foto akan otomatis terorganisir di folder <code className="text-[#1ED760]">profilePhotos/{'{uid}'}/...</code>.</li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-[#1B241F] border border-[#2A352E] space-y-2">
            <h4 className="font-bold text-[#F5F7F5]">Langkah 4: Deployment ke Netlify / Hosting</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Jalankan build perintah: <code className="text-[#1ED760]">npm run build</code>.</li>
              <li>Hasil build tersimpan di folder <code className="text-[#1ED760]">dist/</code>.</li>
              <li>Hubungkan repo ke Netlify atau Firebase Hosting (<code className="text-[#1ED760]">firebase deploy</code>).</li>
              <li>Konfigurasikan rewrite single-page application (<code className="text-[#1ED760]">/* &rarr; /index.html 200</code>).</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 13 & 14. Pengujian & Troubleshooting Error */}
      <div className="bg-[#141A17] p-6 rounded-2xl border border-[#2A352E] space-y-4">
        <h3 className="text-lg font-bold text-[#F5F7F5] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#1ED760]" />
          14. Daftar Kemungkinan Error & Solusinya
        </h3>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-xs">
            <p className="font-bold text-red-400">auth/popup-closed-by-user</p>
            <p className="text-[#A7B0AA] mt-1">
              <strong>Penyebab:</strong> Pengguna menutup jendela login Google sebelum selesai autentikasi.
              <br />
              <strong>Solusi:</strong> Aplikasi menangani hal ini secara aman tanpa crash dan memberikan kesempatan mencoba lagi.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-xs">
            <p className="font-bold text-red-400">Missing or insufficient permissions (PERMISSION_DENIED)</p>
            <p className="text-[#A7B0AA] mt-1">
              <strong>Penyebab:</strong> Pengguna mencoba mengedit atau menghapus profil milik akun UID lain, atau belum login.
              <br />
              <strong>Solusi:</strong> Pastikan pengguna login dengan akun yang sama dengan pembuat profil lagu. Rules kami mencegah manipulasi UID di frontend.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-xs">
            <p className="font-bold text-red-400">Preview audio gagal diputar / format tidak didukung</p>
            <p className="text-[#A7B0AA] mt-1">
              <strong>Penyebab:</strong> Beberapa label rekaman di iTunes membatasi cuplikan audio untuk track tertentu.
              <br />
              <strong>Solusi:</strong> Sistem mendeteksi ketersediaan preview URL dan menyediakan tombol langsung ke halaman resmi Apple Music.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
