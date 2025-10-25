"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedTabButton from "@/components/Ui/buttons/AnimatedTabButton";

/** Categories */
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

const CARD_BG: Record<Exclude<Cat, "All">, string> = {
  Devotional: "from-red-900/30 to-red-800/10",
  Anime: "from-zinc-700/30 to-zinc-900/10",
  Kids: "from-rose-800/25 to-black/20",
  Nature: "from-stone-700/25 to-black/10",
  Geometric: "from-neutral-700/25 to-black/10",
  Corporate: "from-slate-700/25 to-black/10",
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
          <Link href="/our-work" className="btn btn-muted">
            Our Work
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Walls that <span className="text-accent">trick</span> the eye.
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

        <div className="aspect-[5/4] rounded-2xl border border-white/15 bg-[radial-gradient(ellipse_at_top_left,rgba(239,68,68,.25),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(239,68,68,.18),transparent_60%)] shadow-glow-soft" />
      </section>

      {/* Showcase + Categories */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold opacity-90">Showcase</h2>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => {
              const active = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`chip ${active ? "chip-active" : ""}`}
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
              className={`group card-3d bg-gradient-to-br ${CARD_BG[card.cat]}`}
            >
              <div className="card-overlay" />
              <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full bg-black/55 border border-white/15">
                {card.cat}
              </div>
              <div className="absolute bottom-2 right-2 text-xs opacity-90">
                {card.title}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
