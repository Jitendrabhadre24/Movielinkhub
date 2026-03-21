"use client";

import Link from "next/link";
import Image from "next/image";
import { tmdb, Movie } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  item: Movie;
  className?: string;
  type?: "movie" | "tv";
}

export function MovieCard({ item, className, type }: MovieCardProps) {
  const itemType = type || item.media_type || "movie";
  const posterUrl = tmdb.getImageUrl(item.poster_path);
  const title = item.title || item.name;

  return (
    <Link
      href={`/movie/${item.id}?type=${itemType}`}
      className={cn(
        "group relative flex-shrink-0 w-32 sm:w-40 md:w-48 aspect-[2/3] overflow-hidden rounded-md bg-muted transition-transform duration-300 hover:scale-105 active:scale-95",
        className
      )}
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title || "Poster"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 160px, 200px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-card p-4 text-center text-xs text-muted-foreground">
          {title}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-2">
        <span className="text-[10px] font-bold text-primary truncate w-full">
          {title}
        </span>
      </div>
    </Link>
  );
}