import { Metadata } from "next";
import GenreClient from "./genre-client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; type?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { name = "Genre", type = "movie" } = await searchParams;
  const displayType = type === 'movie' ? 'Movies' : 'TV Series';
  
  return {
    title: `Best ${name} ${displayType} to Watch Online - MovieLink Hub`,
    description: `Discover the top-rated ${name} ${displayType.toLowerCase()}. Browse the ultimate collection, filter by release year and rating, and find where to stream the best ${name} content online.`,
    keywords: [`${name} movies`, `best ${name} tv shows`, `watch ${name} online`, 'movie categories', 'genre discovery'],
    openGraph: {
      title: `${name} Archive | MovieLink Hub Discovery`,
      description: `The most comprehensive archive of ${name} blockbusters and series available for streaming.`,
      images: [`https://picsum.photos/seed/${name}/1200/630`],
    }
  };
}

export default async function GenreDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { name = "Category", type = "movie", page = "1" } = await searchParams;

  return (
    <GenreClient 
      id={id} 
      name={name} 
      type={type as "movie" | "tv"} 
      initialPage={parseInt(page)} 
    />
  );
}
