import { getDetails, getImageUrl } from "@/lib/tmdb";
import { Metadata } from "next";
import MovieDetailClient from "./movie-detail-client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const { type = "movie" } = await searchParams;
  const movie = await getDetails(id, type as "movie" | "tv");

  if (!movie) return { title: "Content Not Found | MovieLink Hub" };

  const title = movie.title || movie.name;
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const contentType = type === 'movie' ? 'Movie' : 'TV Show';
  
  const description = `Watch ${title} (${year}) online. Check ratings, cast, full overview, and official streaming options for this ${contentType} on MovieLink Hub. ${movie.overview?.slice(0, 150)}...`;
  const image = getImageUrl(movie.backdrop_path, "w500") || "https://picsum.photos/seed/movie/1200/630";

  return {
    title: `${title} (${year}) - Watch Online & Details`,
    description,
    keywords: [`watch ${title} online`, `${title} cast`, `${title} ${year}`, 'movie details', 'streaming guide'],
    openGraph: {
      title: `${title} (${year}) | MovieLink Hub`,
      description,
      images: [{ url: image }],
      type: "video.movie",
      url: `https://movielink-hub.web.app/movie/${id}?type=${type}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} (${year})`,
      description,
      images: [image],
    },
  };
}

export default async function MovieDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type = "movie" } = await searchParams;

  return <MovieDetailClient id={id} initialType={type as "movie" | "tv"} />;
}
