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

export async function getTrending(): Promise<Movie[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("TMDB Error (Trending):", error);
    return [];
  }
}

export async function getDetails(id: string, type: "movie" | "tv"): Promise<any> {
  try {
    const res = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`
    );
    if (!res.ok) throw new Error("API failed");
    return await res.json();
  } catch (error) {
    console.error(`TMDB Error (Details ${id}):`, error);
    return null;
  }
}

export async function getCredits(id: string, type: "movie" | "tv"): Promise<Cast[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=en-US`
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data.cast || [];
  } catch (error) {
    console.error(`TMDB Error (Credits ${id}):`, error);
    return [];
  }
}

export async function getVideos(id: string, type: "movie" | "tv"): Promise<any[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error(`TMDB Error (Videos ${id}):`, error);
    return [];
  }
}

export async function getSimilar(id: string, type: "movie" | "tv"): Promise<Movie[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}&language=en-US`
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error(`TMDB Error (Similar ${id}):`, error);
    return [];
  }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("TMDB Error (Search):", error);
    return [];
  }
}

export async function getGenres(type: "movie" | "tv"): Promise<any[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/genre/${type}/list?api_key=${API_KEY}&language=en-US`
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data.genres || [];
  } catch (error) {
    console.error(`TMDB Error (Genres ${type}):`, error);
    return [];
  }
}

export async function getMoviesByGenre(genreId: string): Promise<Movie[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US`
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("TMDB Error (Discover Movie):", error);
    return [];
  }
}

export async function getTVByGenre(genreId: string): Promise<Movie[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&language=en-US`
    );
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("TMDB Error (Discover TV):", error);
    return [];
  }
}

export function getImageUrl(path: string | null, size: "w500" | "original" | "w185" = "w500") {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}
