import { MusicTrackResult } from '../types';

// In-memory cache for live preview URLs to prevent redundant network hits
const previewUrlCache = new Map<string, string>();

export async function searchSongs(query: string, signal?: AbortSignal): Promise<MusicTrackResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&entity=song&limit=15`;
  
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`iTunes API error: ${res.status}`);
    }
    const data = await res.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => {
      const art100 = item.artworkUrl100 || '';
      // Transform into 600x600 high quality artwork
      const art600 = art100.replace('100x100bb', '600x600bb');

      if (item.trackName && item.artistName && item.previewUrl) {
        const key = `${item.trackName.toLowerCase()}___${item.artistName.toLowerCase()}`;
        previewUrlCache.set(key, item.previewUrl);
      }

      return {
        trackId: item.trackId,
        trackName: item.trackName || 'Lagu Tanpa Judul',
        artistName: item.artistName || 'Artis Tidak Diketahui',
        artworkUrl100: art100,
        artworkUrl600: art600,
        previewUrl: item.previewUrl || '',
        trackViewUrl: item.trackViewUrl || '',
        collectionName: item.collectionName || '',
        trackTimeMillis: item.trackTimeMillis || 30000,
      };
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return [];
    }
    console.error('Error fetching iTunes search results:', err);
    throw err;
  }
}

/**
 * Resolves a fresh, working live preview URL from iTunes API if a stored URL is dead or missing.
 */
export async function resolveLivePreviewUrl(
  songTitle: string,
  artistName: string,
  fallbackUrl?: string
): Promise<string> {
  const cleanTitle = songTitle.replace(/\(.*?\)/g, '').trim();
  const cleanArtist = artistName.replace(/\(.*?\)/g, '').trim();
  const cacheKey = `${cleanTitle.toLowerCase()}___${cleanArtist.toLowerCase()}`;

  if (previewUrlCache.has(cacheKey)) {
    return previewUrlCache.get(cacheKey)!;
  }

  try {
    const query = `${cleanTitle} ${cleanArtist}`;
    const results = await searchSongs(query);
    const match = results.find((r) => !!r.previewUrl);
    if (match && match.previewUrl) {
      previewUrlCache.set(cacheKey, match.previewUrl);
      return match.previewUrl;
    }
  } catch (e) {
    console.warn('Could not resolve fresh live preview url:', e);
  }

  return fallbackUrl || '';
}
