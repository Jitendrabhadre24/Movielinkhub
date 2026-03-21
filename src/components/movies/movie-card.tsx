"use client";

import Link from "next/link";
import Image from "next/image";
import { tmdb, Movie } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

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
        "group relative flex-shrink-0 w-36 sm:w-44 md:w-52 aspect-[2/3] overflow-hidden rounded-[14px] bg-[#111] transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl",
        className
      )}
    >
      {/* Rating Badge */}
      <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-xl px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-lg group-hover:bg-primary transition-colors group-hover:border-primary">
        <Star className="h-3 w-3 text-primary fill-primary group-hover:text-black group-hover:fill-black" />
        <span className="text-[11px] font-black text-white group-hover:text-black">
          {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
        </span>
      </div>

      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title || "Poster"}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 180px, 220px"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-muted/10 p-4 text-center">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">{title}</span>
        </div>
      )}
      
      {/* Subtle Overlay with Title */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
        <span className="text-sm font-black text-white line-clamp-2 leading-tight uppercase italic tracking-tighter">
          {title}
        </span>
      </div>
    </Link>
  );
}