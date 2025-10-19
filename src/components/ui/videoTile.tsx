"use client";

import { useEffect, useRef } from "react";

export default function VideoTile({
  src,
  poster,
  title,
  cat,
}: {
  src: string;
  poster?: string;
  title: string;
  cat: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  // Play/pause only when visible (saves battery)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true; // required for autoplay
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        loop
        autoPlay
        preload="metadata"
      />
      {/* subtle hover shade */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/40 to-transparent" />
      {/* chips */}
      <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full bg-black/55">
        {cat}
      </div>
      <div className="absolute bottom-2 right-2 text-xs opacity-90">
        {title}
      </div>
    </div>
  );
}
