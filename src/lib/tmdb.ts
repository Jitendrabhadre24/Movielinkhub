
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

export type DiscoverFilters = {
  rating?: string;
  year?: string;
  language?: string;
  sortBy?: string;
};

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}, cacheOptions: RequestInit = { next: { revalidate: 3600 } }) {
  // Defensive check for missing API key to avoid malformed requests
  if (!API_KEY || API_KEY === "mock-api-key" || API_KEY === "undefined") {
    console.warn("TMDB API Key is missing or invalid. Please set NEXT_PUBLIC_TMDB_API_KEY.");
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
      headers: { 'Accept': 'application/json' },
      ...cacheOptions
    });
    
    if (!response.ok) {
      console.warn(`TMDB API Error: ${response.status} at ${endpoint}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    // Catch hard network errors (CORS, DNS, connection reset)
    console.error("TMDB fetch failed:", error);
    return null;
  }
}

export async function getTrending(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/trending/movie/week");
  return data?.results || [];
}

export async function getTopRated(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/movie/top_rated");
  return data?.results || [];
}

export async function getPopularTV(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/tv/popular");
  return data?.results?.map((item: any) => ({ ...item, media_type: 'tv' })) || [];
}

export async function getKidsContent(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/discover/movie", { with_genres: "10751" });
  return data?.results || [];
}

export async function getAnimationContent(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/discover/movie", { with_genres: "16" });
  return data?.results || [];
}

export async function getAnimeContent(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/discover/movie", { 
    with_genres: "16",
    with_original_language: "ja" 
  });
  return data?.results || [];
}

export async function getDetails(id: string, type: "movie" | "tv"): Promise<any> {
  return await fetchFromTMDB(`/${type}/${id}`, {}, { next: { revalidate: 7200 } });
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

export async function getRecommendations(id: string, type: "movie" | "tv"): Promise<Movie[]> {
  const data = await fetchFromTMDB(`/${type}/${id}/recommendations`);
  return data?.results || [];
}

export async function getWatchProviders(id: string, type: "movie" | "tv"): Promise<any> {
  const data = await fetchFromTMDB(`/${type}/${id}/watch/providers`);
  return data?.results || {};
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await fetchFromTMDB("/search/multi", { query }, { cache: 'no-store' });
  return data?.results || [];
}

export async function getGenres(type: "movie" | "tv"): Promise<any[]> {
  const data = await fetchFromTMDB(`/genre/${type}/list`);
  return data?.genres || [];
}

export async function discoverContent(
  type: "movie" | "tv",
  genreId: string,
  page: number = 1,
  filters: DiscoverFilters = {}
): Promise<{results: Movie[], total_pages: number}> {
  const params: Record<string, string> = {
    with_genres: genreId,
    page: page.toString(),
  };

  if (filters.rating) params["vote_average.gte"] = filters.rating;
  if (filters.year) {
    if (filters.year === "2020+") {
      params["primary_release_date.gte"] = "2020-01-01";
    } else {
      params["primary_release_year"] = filters.year;
    }
  }
  if (filters.language) params["with_original_language"] = filters.language;
  if (filters.sortBy) params["sort_by"] = filters.sortBy;

  const data = await fetchFromTMDB(`/discover/${type}`, params);
  return {
    results: data?.results || [],
    total_pages: data?.total_pages || 1
  };
}

export function getImageUrl(path: string | null, size: "w500" | "original" | "w185" = "w500") {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}
