const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: "movie" | "tv";
  runtime?: number;
  genres?: { id: number; name: string }[];
};

export type Cast = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

/**
 * Internal helper to handle TMDB API requests with centralized error handling.
 * Uses cache: 'no-store' to ensure desktop browsers don't serve broken cached responses.
 */
async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  if (!API_KEY || API_KEY === "mock-api-key") {
    console.warn("TMDB API Key is missing or invalid. Please check NEXT_PUBLIC_TMDB_API_KEY.");
    return null;
  }

  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    ...params
  }).toString();

  const url = `${BASE_URL}${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Prevent desktop browser caching issues
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.warn(`TMDB API Response Error: ${response.status} ${response.statusText} at ${endpoint}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    // Desktop browsers often trigger "Failed to fetch" due to AdBlockers (uBlock, AdBlock Plus, etc.)
    console.error(`TMDB Network Error. If on Desktop, check if an AdBlocker is blocking api.themoviedb.org:`, error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

export async function getTrending(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/trending/movie/week");
  return data?.results || [];
}

export async function getDetails(id: string, type: "movie" | "tv"): Promise<any> {
  return await fetchFromTMDB(`/${type}/${id}`);
}

export async function getCredits(id: string, type: "movie" | "tv"): Promise<Cast[]> {
  const data = await fetchFromTMDB(`/${type}/${id}/credits`);
  return data?.cast || [];
}

export async function getVideos(id: string, type: "movie" | "tv"): Promise<any[]> {
  const data = await fetchFromTMDB(`/${type}/${id}/videos`);
  return data?.results || [];
}

export async function getSimilar(id: string, type: "movie" | "tv"): Promise<Movie[]> {
  const data = await fetchFromTMDB(`/${type}/${id}/similar`);
  return data?.results || [];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await fetchFromTMDB("/search/multi", { query });
  return data?.results || [];
}

export async function getGenres(type: "movie" | "tv"): Promise<any[]> {
  const data = await fetchFromTMDB(`/genre/${type}/list`);
  return data?.genres || [];
}

export async function getMoviesByGenre(genreId: string): Promise<Movie[]> {
  const data = await fetchFromTMDB("/discover/movie", { with_genres: genreId });
  return data?.results || [];
}

export async function getTVByGenre(genreId: string): Promise<Movie[]> {
  const data = await fetchFromTMDB("/discover/tv", { with_genres: genreId });
  return data?.results || [];
}

export function getImageUrl(path: string | null, size: "w500" | "original" | "w185" = "w500") {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}
