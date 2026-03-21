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

// Mock data for when API key is missing
const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "The Silent Edge",
    overview: "A rogue operative must navigate a world of shadows to protect the only person who knows the truth.",
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.4,
    media_type: "movie",
    release_date: "2024-05-12"
  },
  {
    id: 2,
    title: "Neon Shadows",
    overview: "In a futuristic metropolis, a hacker discovers a conspiracy that could rewrite reality itself.",
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.9,
    media_type: "movie",
    release_date: "2024-08-20"
  },
  {
    id: 3,
    title: "Echoes of Time",
    overview: "A historian uncovers a mysterious artifact that allows her to communicate with the past.",
    poster_path: null,
    backdrop_path: null,
    vote_average: 9.1,
    media_type: "movie",
    release_date: "2024-11-05"
  }
];

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  if (!TMDB_API_KEY || TMDB_API_KEY === "mock-api-key") {
    // Return mock data if no key is present
    if (endpoint.includes("trending") || endpoint.includes("popular") || endpoint.includes("discover")) {
      return { results: MOCK_MOVIES };
    }
    if (endpoint.includes("genre")) {
      return { genres: [{ id: 1, name: "Action" }, { id: 2, name: "Sci-Fi" }] };
    }
    return { results: [] };
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    ...params,
  });

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
    if (!response.ok) throw new Error("TMDB Request Failed");
    return response.json();
  } catch (e) {
    console.error(e);
    return { results: MOCK_MOVIES, genres: [] };
  }
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
  getImageUrl: (path: string | null, size: "w500" | "original" = "w500") => 
    path ? `${IMAGE_BASE_URL}/${size}${path}` : null,
};