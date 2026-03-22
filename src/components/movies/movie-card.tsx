"use client";

import Link from "next/link";
import Image from "next/image";
import { getImageUrl, Movie } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Star, Play } from "lucide-react";

interface MovieCardProps {
  item: Movie;
  className?: string;
  type?: "movie" | "tv";
}

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

export function MovieCard({ item, className, type }: MovieCardProps) {
  const itemType = type || item.media_type || "movie";
  const posterUrl = getImageUrl(item.poster_path);
  const title = item.title || item.name;
  const releaseYear = (item.release_date || item.first_air_date || "").split("-")[0];
  
  const quality = item.vote_average > 7 ? "4K UHD" : "HD";

  return (
    <Link
      href={`/movie/${item.id}?type=${itemType}`}
      className={cn(
        "group block flex-shrink-0 w-36 sm:w-44 md:w-52 transition-all duration-500 animate-fade-in",
        className
      )}
    >
      <div className="space-y-4">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[1.25rem] bg-[#111] shadow-2xl transition-all duration-500 group-hover:scale-[1.05] group-hover:shadow-[0_0_40px_rgba(255,215,0,0.2)] border border-white/5 group-hover:border-primary/40">
          {/* Top Badge */}
          <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-xl px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-lg group-hover:bg-primary transition-colors duration-300 group-hover:border-primary">
            <Star className="h-3 w-3 text-primary fill-primary group-hover:text-black group-hover:fill-black transition-colors" />
            <span className="text-[11px] font-black text-white group-hover:text-black tracking-tighter">
              {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
            </span>
          </div>

          {/* Image */}
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title || "Poster"}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 768px) 150px, 250px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-muted/10 p-4 text-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">{title}</span>
            </div>
          )}
          
          {/* Hover Overlay - Netflix Style */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex flex-col justify-end p-4">
            <div className="bg-primary text-black rounded-full p-2 w-fit mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
              <Play className="h-4 w-4 fill-current" />
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-1.5 px-1 transition-all duration-300 group-hover:translate-x-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm md:text-base font-bold text-white/90 line-clamp-2 leading-tight transition-colors group-hover:text-primary uppercase italic tracking-tighter">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] text-white/40 font-black uppercase tracking-widest italic">
              {releaseYear || "N/A"}
            </span>
            <span className="shrink-0 text-[8px] font-black border border-white/10 text-white/30 px-1.5 py-0.5 rounded uppercase tracking-widest group-hover:border-primary/30 group-hover:text-primary transition-colors">
              {quality}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
