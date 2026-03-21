const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
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

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  // Gracefully handle missing API key
  if (!TMDB_API_KEY || TMDB_API_KEY === "undefined") {
    console.warn("TMDB API Key is missing. Please check your .env.local file.");
    return null;
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    ...params,
  });

  const url = `${BASE_URL}${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`TMDB API Error (${response.status}):`, errorData.status_message || response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    // Use console.warn to avoid Next.js error overlay for non-critical network issues
    console.warn("TMDB Fetch Exception (Check for AdBlockers or connection):", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

export const tmdb = {
  getTrending: () => fetchFromTMDB("/trending/movie/week"),
  getPopularMovies: () => fetchFromTMDB("/movie/popular"),
  getPopularTV: () => fetchFromTMDB("/tv/popular"),
  getTopRatedMovies: () => fetchFromTMDB("/movie/top_rated"),
  getDetails: (id: string, type: "movie" | "tv") => fetchFromTMDB(`/${type}/${id}`),
  getCredits: (id: string, type: "movie" | "tv") => fetchFromTMDB(`/${type}/${id}/credits`),
  getVideos: (id: string, type: "movie" | "tv") => fetchFromTMDB(`/${type}/${id}/videos`),
  getSimilar: (id: string, type: "movie" | "tv") => fetchFromTMDB(`/${type}/${id}/similar`),
  search: (query: string) => fetchFromTMDB("/search/multi", { query }),
  getGenres: (type: "movie" | "tv") => fetchFromTMDB(`/genre/${type}/list`),
  getImageUrl: (path: string | null, size: "w500" | "original" | "w185" = "w500") => 
    path ? `${IMAGE_BASE_URL}/${size}${path}` : null,
};
