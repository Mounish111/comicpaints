"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedTabButton from "@/components/Ui/buttons/AnimatedTabButton";

const CATS = [
  "All",
  "Devotional",
  "Anime",
  "Kids",
  "Nature",
  "Geometric",
  "Corporate",
] as const;
type Cat = (typeof CATS)[number];

const CAT_BG: Record<Exclude<Cat, "All">, string> = {
  Devotional: "from-emerald-400/30 to-emerald-700/20",
  Anime: "from-rose-400/30 to-rose-700/20",
  Kids: "from-amber-300/30 to-amber-700/20",
  Nature: "from-teal-300/30 to-teal-700/20",
  Geometric: "from-fuchsia-400/30 to-fuchsia-700/20",
  Corporate: "from-sky-400/30 to-sky-700/20",
};

const SHOWCASE: Array<{ id: number; title: string; cat: Exclude<Cat, "All"> }> =
  [
    { id: 1, title: "Temple Depth", cat: "Devotional" },
    { id: 2, title: "Shonen Burst", cat: "Anime" },
    { id: 3, title: "Playful Safari", cat: "Kids" },
    { id: 4, title: "Misty Pines", cat: "Nature" },
    { id: 5, title: "Optic Illusion", cat: "Geometric" },
    { id: 6, title: "Lobby Vortex", cat: "Corporate" },
    { id: 7, title: "Lotus Vault", cat: "Devotional" },
    { id: 8, title: "Neo Mecha", cat: "Anime" },
    { id: 9, title: "Space Playroom", cat: "Kids" },
    { id: 10, title: "Canyon Glow", cat: "Nature" },
    { id: 11, title: "Hex Shift", cat: "Geometric" },
    { id: 12, title: "Boardroom Warp", cat: "Corporate" },
  ];

export default function HomePage() {
  const [cat, setCat] = useState<Cat>("All");
  const items =
    cat === "All" ? SHOWCASE : SHOWCASE.filter((i) => i.cat === cat);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">
          COMIC PAINTS
        </Link>
        <nav className="hidden md:flex gap-3">
          <Link
            href="/our-work"
            className="px-4 py-2 rounded-full bg-white/10 border border-white/15 hover:bg-white/14 glow-interactive glow-cyan"
          >
            Our Work
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Walls that <span className="text-[rgb(182,255,90)]">trick</span> the
            eye.
          </h1>
          <p className="mt-3 opacity-80 max-w-xl">
            Premium 3D wall comic paints. Browse our best work or start a custom
            request with your image.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <AnimatedTabButton label="Showcase" active sprite="naruto" />
            <AnimatedTabButton label="Shop" href="/custom" sprite="luffy" />
          </div>
        </div>

        <div
          className="aspect-[4/3] md:aspect-[5/4] rounded-2xl border border-white/15
bg-[radial-gradient(ellipse_at_top_left,rgba(182,255,90,.25),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(125,249,255,.25),transparent_60%)]
shadow-[0_0_40px_rgba(0,0,0,.4)]"
        />
      </section>

      {/* Showcase + Categories */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold opacity-90">Showcase</h2>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => {
              const activeChip = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-1 rounded-full text-xs border transition glow-interactive ${activeChip ? "glow-primary bg-white text-black border-transparent" : "glow-cyan bg-white/5 text-white border-white/15 hover:bg-white/10"}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((card) => (
            <div
              key={card.id}
              className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10
bg-gradient-to-br ${CAT_BG[card.cat]}`}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
bg-gradient-to-t from-black/40 to-transparent"
              />
              <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full bg-black/50">
                {card.cat}
              </div>
              <div className="absolute bottom-2 right-2 text-xs opacity-80">
                {card.title}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
