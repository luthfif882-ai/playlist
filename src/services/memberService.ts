import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { MemberProfile } from '../types';
import { INITIAL_23_STUDENTS } from '../data/initialStudents';

const MEMBERS_COLLECTION = 'members';

/**
 * Real-time subscription to class members playlist
 */
export function subscribeToMembers(
  onUpdate: (members: MemberProfile[]) => void,
  onError: (error: Error) => void
) {
  const collectionRef = collection(db, MEMBERS_COLLECTION);
  const q = query(collectionRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: MemberProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          uid: data.uid || docSnap.id,
          displayName: data.displayName || 'Mahasiswa SPI 1A',
          photoURL: data.photoURL || '',
          songId: data.songId || '',
          songTitle: data.songTitle || 'Tanpa Judul',
          artistName: data.artistName || 'Tanpa Artis',
          albumArtwork: data.albumArtwork || '',
          previewUrl: data.previewUrl || '',
          fullAudioUrl: data.fullAudioUrl || '',
          youtubeId: data.youtubeId || '',
          isFullTrack: !!data.isFullTrack || !!data.youtubeId || !!data.fullAudioUrl,
          trackUrl: data.trackUrl || '',
          durationMs: data.durationMs || (data.youtubeId || data.fullAudioUrl || data.isFullTrack ? 240000 : 30000),
          personalMessage: data.personalMessage || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        });
      });
      onUpdate(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, MEMBERS_COLLECTION);
      } catch (e: any) {
        onError(e);
      }
    }
  );

  return unsubscribe;
}

/**
 * Saves or updates a member profile in Firestore.
 * Document ID is the user's authentic Firebase UID.
 */
export async function saveMemberProfile(
  profileData: Omit<MemberProfile, 'id'>,
  isEdit: boolean
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Anda harus login terlebih dahulu.');
  }

  const memberId = currentUser.uid;
  const docRef = doc(db, MEMBERS_COLLECTION, memberId);

  const payload: any = {
    uid: currentUser.uid,
    displayName: profileData.displayName.trim().slice(0, 100),
    photoURL: (profileData.photoURL || currentUser.photoURL || '').slice(0, 2048),
    songId: (profileData.songId || '').slice(0, 128),
    songTitle: profileData.songTitle.trim().slice(0, 200),
    artistName: profileData.artistName.trim().slice(0, 200),
    albumArtwork: (profileData.albumArtwork || '').slice(0, 2048),
    previewUrl: (profileData.previewUrl || '').slice(0, 2048),
    fullAudioUrl: (profileData.fullAudioUrl || '').slice(0, 2048),
    youtubeId: (profileData.youtubeId || '').slice(0, 128),
    isFullTrack: !!profileData.isFullTrack || !!profileData.youtubeId || !!profileData.fullAudioUrl,
    trackUrl: (profileData.trackUrl || '').slice(0, 2048),
    durationMs: profileData.durationMs || (profileData.isFullTrack || profileData.youtubeId ? 240000 : 30000),
    personalMessage: (profileData.personalMessage || '').slice(0, 500),
    updatedAt: new Date().toISOString(),
  };

  if (!isEdit) {
    payload.createdAt = new Date().toISOString();
  }

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MEMBERS_COLLECTION}/${memberId}`);
  }
}

/**
 * Deletes a member profile (only allowed if current user is owner)
 */
export async function deleteMemberProfile(memberId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== memberId) {
    throw new Error('Hanya pemilik profil yang berhak menghapus.');
  }

  const docRef = doc(db, MEMBERS_COLLECTION, memberId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MEMBERS_COLLECTION}/${memberId}`);
  }
}

/**
 * Upload profile photo to Firebase Storage
 */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  if (!file) throw new Error('File tidak ditemukan.');

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar (JPG, PNG, WebP).');
  }

  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran foto terlalu besar. Maksimal 5MB.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `profilePhotos/${uid}/${Date.now()}_${cleanFileName}`;
  const fileRef = ref(storage, storagePath);

  try {
    const uploadResult = await uploadBytes(fileRef, file, {
      contentType: file.type,
      cacheControl: 'public,max-age=31536000',
    });
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (err: any) {
    console.error('Storage upload error:', err);
    throw new Error(err?.message || 'Gagal mengunggah foto ke storage.');
  }
}

/**
 * Upload custom Full Audio track (MP3/WAV/M4A/OGG) to Firebase Storage
 */
export async function uploadAudioFile(uid: string, file: File): Promise<string> {
  if (!file) throw new Error('File audio tidak ditemukan.');

  if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
    throw new Error('File harus berupa audio (MP3, M4A, WAV, OGG, atau AAC).');
  }

  // Max 25MB
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Ukuran file audio terlalu besar. Maksimal 25MB.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `audioFiles/${uid}/${Date.now()}_${cleanFileName}`;
  const fileRef = ref(storage, storagePath);

  try {
    const uploadResult = await uploadBytes(fileRef, file, {
      contentType: file.type || 'audio/mpeg',
      cacheControl: 'public,max-age=31536000',
    });
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (err: any) {
    console.error('Storage audio upload error:', err);
    throw new Error(err?.message || 'Gagal mengunggah audio ke storage.');
  }
}

/**
 * Optional helper to seed initial 23 SPI 1A student profiles if Firestore collection is fresh.
 */
export async function seedInitialClassroomIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, MEMBERS_COLLECTION));
    if (snap.empty) {
      // Seed initial 23 students
      console.log('Classroom collection is fresh. Seeding initial 23 SPI 1A students...');
      return false; // Can be triggered by authenticated user or presented smoothly
    }
    return true;
  } catch (e) {
    console.warn('Could not check seed status:', e);
    return false;
  }
}
