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
};

export type Cast = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY || "",
    language: "en-US",
    ...params,
  });

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
    if (!response.ok) {
      console.warn(`TMDB API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    return response.json();
  } catch (e) {
    console.error("Failed to fetch from TMDB:", e);
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
