import { Metadata } from "next";
import GenreClient from "./genre-client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; type?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { name = "Genre" } = await searchParams;
  return {
    title: `${name.toUpperCase()} ARCHIVE - MovieLink Hub`,
    description: `Explore the best ${name} movies and TV shows on MovieLink Hub. Filter by rating, year, and language.`,
    openGraph: {
      title: `${name} Archive | MovieLink Hub`,
      description: `The ultimate collection of ${name} blockbusters.`,
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
