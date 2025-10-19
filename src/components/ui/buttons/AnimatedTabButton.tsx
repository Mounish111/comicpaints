"use client";

import Link from "next/link";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";

type Sprite = "naruto" | "luffy";
const SPRITE_SRC: Record<Sprite, string> = {
  naruto: "/sprites/naruto.png", // or .webp with transparency
  luffy: "/sprites/luffy.png",
};

export default function AnimatedTabButton({
  label,
  href,
  active,
  sprite,
  spriteHeight = 56, // smaller so the label is never hidden
  minWidth = 170,
}: {
  label: "Showcase" | "Shop";
  href?: string;
  active?: boolean;
  sprite: Sprite;
  spriteHeight?: number;
  minWidth?: number;
}) {
  const controls = useAnimationControls();
  const wrapRef = useRef<HTMLDivElement>(null);

  // idle animations (use same controls to keep TS happy)
  useEffect(() => {
    if (active) {
      controls.start({
        x: 0,
        y: [0, -2, 0, 2, 0],
        rotate: 0,
        transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
      });
    } else {
      controls.start({
        x: 0,
        y: [0, 1, -1, 0],
        rotate: [6, 3, 8, 6],
        transition: { duration: 5.6, repeat: Infinity, ease: "easeInOut" },
      });
    }
  }, [active, controls]);

  // run across the top lane on hover
  function runAcross() {
    if (active) return;
    const w = wrapRef.current?.offsetWidth ?? 220;
    const spriteW = spriteHeight * 0.9;
    const distance = Math.max(w - spriteW - 16, 0);
    controls.start({
      x: [0, distance],
      y: [0, -2, 0, 2, 0],
      rotate: [0, -4, 0],
      transition: { duration: 1.05, ease: "easeInOut" },
    });
  }

  const glowClass = label === "Showcase" ? "glow-primary" : "glow-cyan";

  const Inner = (
    <div
      ref={wrapRef}
      className={`relative inline-flex items-center justify-center rounded-full border text-sm font-semibold overflow-hidden
${glowClass} glow-interactive`}
      style={{ padding: "14px 22px 10px 22px", minWidth }}
      onMouseEnter={runAcross}
    >
      {/* background + states */}
      <div
        className={`absolute inset-0 rounded-full ${
          active
            ? "bg-white"
            : "bg-white/10 border border-[color:var(--border)]"
        }`}
      />
      {active && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow:
              label === "Showcase"
                ? "0 0 22px 2px var(--glow)"
                : "0 0 22px 2px var(--glow-cyan)",
          }}
        />
      )}

      {/* top paint line */}
      <motion.div
        className="pointer-events-none absolute left-3 right-3 top-1 h-[3px] rounded-full"
        style={{
          background:
            label === "Showcase" ? "rgb(182,255,90)" : "rgb(125,249,255)",
          opacity: 0.9,
        }}
        initial={{ scaleX: 0, transformOrigin: "left" }}
        whileHover={!active ? { scaleX: 1 } : undefined}
        transition={{ duration: 1.05, ease: "easeInOut" }}
      />

      {/* sprite (inside the button) */}
      <motion.img
        src={SPRITE_SRC[sprite]}
        alt=""
        className={`pointer-events-none select-none absolute top-1 ${
          active ? "left-1/2 -translate-x-1/2" : "left-2"
        } z-0`}
        style={{
          height: spriteHeight,
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,.45))",
        }}
        animate={controls}
        initial={{ x: 0 }}
        draggable={false}
      />

      {/* label (always above) */}
      <span
        className={`relative z-10 ${active ? "text-black" : "text-[var(--fg)]"}`}
      >
        {label}
      </span>
    </div>
  );

  return href ? (
    <Link href={href} className="relative inline-block">
      {Inner}
    </Link>
  ) : (
    <button
      className="relative inline-block"
      type="button"
      aria-current={active ? "page" : undefined}
    >
      {Inner}
    </button>
  );
}
