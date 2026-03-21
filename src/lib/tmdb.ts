const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: "movie" | "tv";
};

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  if (!TMDB_API_KEY) {
    // Return empty results if no API key is set to prevent crashes
    return { results: [] };
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
  if (!response.ok) throw new Error("Failed to fetch from TMDB");
  return response.json();
}

export const tmdb = {
  getTrending: (type: "movie" | "tv" | "all" = "all") => fetchFromTMDB(`/trending/${type}/week`),
  getPopularMovies: () => fetchFromTMDB("/movie/popular"),
  getPopularTV: () => fetchFromTMDB("/tv/popular"),
  getTopRatedMovies: () => fetchFromTMDB("/movie/top_rated"),
  getAnime: () => fetchFromTMDB("/discover/tv", { with_genres: "16", with_keywords: "210024" }),
  getMoviesByGenre: (genreId: string) => fetchFromTMDB("/discover/movie", { with_genres: genreId }),
  getTVByGenre: (genreId: string) => fetchFromTMDB("/discover/tv", { with_genres: genreId }),
  getDetails: (id: string, type: "movie" | "tv") => fetchFromTMDB(`/${type}/${id}`),
  getRecommendations: (id: string, type: "movie" | "tv") => fetchFromTMDB(`/${type}/${id}/recommendations`),
  search: (query: string) => fetchFromTMDB("/search/multi", { query }),
  getGenres: (type: "movie" | "tv") => fetchFromTMDB(`/genre/${type}/list`),
  getImageUrl: (path: string, size: "w500" | "original" = "w500") => path ? `${IMAGE_BASE_URL}/${size}${path}` : null,
};