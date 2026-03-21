
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
  const description = `Watch details of ${title} (${year}), including ratings, cast, overview, and OTT availability on MovieLink Hub. ${movie.overview?.slice(0, 100)}...`;
  const image = getImageUrl(movie.backdrop_path, "w500") || "";

  return {
    title: `${title} (${year}) - MovieLink Hub`,
    description,
    openGraph: {
      title: `${title} (${year})`,
      description,
      images: [image],
      type: "video.movie",
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
