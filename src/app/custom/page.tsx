"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import AnimatedTabButton from "@/components/Ui/buttons/AnimatedTabButton";
import { Card } from "@/components/Ui/card";
import { Button } from "@/components/Ui/button";
import { Input } from "@/components/Ui/input";
import { Textarea } from "@/components/Ui/textarea";

type Step = 1 | 2 | 3;
type SurfaceType = "Wall" | "Door" | "Floor" | "Other";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

// Friendly wall colors (NAME + CSS color)
const SWATCHES = [
  { name: "Ivory", value: "#FFF8E1" },
  { name: "Warm White", value: "#F9F6EE" },
  { name: "Cool Grey", value: "#E6E8EB" },
  { name: "Sky", value: "#9BD1FF" },
  { name: "Mint", value: "#B5F5CC" },
  { name: "Peach", value: "#FFD0B0" },
  { name: "Lavender", value: "#D9C6FF" },
  { name: "Charcoal", value: "#2B2F36" },
];

// A small set of common CSS color names for spell-check.
// (Add more anytime.)
const CSS_NAMES = [
  "black",
  "white",
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "gray",
  "grey",
  "skyblue",
  "teal",
  "cyan",
  "magenta",
  "navy",
  "olive",
  "maroon",
  "beige",
  ...SWATCHES.map((s) => s.name.toLowerCase()),
];

// Fixed overlay strength (no slider)
const TINT_OPACITY = 0.25;

// Validate CSS color strings (names, hex, rgb, hsl)
function isValidCssColor(v: string) {
  const s = new Option().style;
  s.color = "";
  s.color = v;
  return s.color !== "";
}

// tiny Levenshtein for “did you mean” suggestions
function lev(a: string, b: string) {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export default function CustomPage() {
  const [step, setStep] = useState<Step>(1);

  // Step 1 — upload
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const previewURL = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file]
  );

  // Step 2 — details
  const [surfaceType, setSurfaceType] = useState<SurfaceType>("Wall");
  const [surfaceOther, setSurfaceOther] = useState("");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");

  // Wall color
  const [color, setColor] = useState("#ffffff"); // used by overlay
  const [colorInput, setColorInput] = useState<string>(color); // what user types/sees
  const [colorValid, setColorValid] = useState<boolean>(true);

  // Notes
  const [notes, setNotes] = useState<string>("");

  // Step 3 — contact

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  // Delete confirm (preview)
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Step 3 — contact

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // contact validation errors
  const [nameErr, setNameErr] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [addressErr, setAddressErr] = useState("");

  // simple patterns
  const nameRe = /^[A-Za-z\s]{2,}$/; // letters & spaces, min 2
  const phoneRe = /^\d{10}$/; // 10 digits only
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/[^A-Za-z\s]/g, ""); // block numbers/symbols
    setName(v);
    setNameErr(
      v && !nameRe.test(v.trim()) ? "Use letters & spaces only (min 2)." : ""
    );
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, ""); // digits only
    setPhone(v);
    setPhoneErr(v && !phoneRe.test(v) ? "Enter 10 digits." : "");
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.trim();
    setEmail(v);
    setEmailErr(v && !emailRe.test(v) ? "Enter a valid email." : "");
  }

  function handleAddressChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    setAddress(v);
    setAddressErr(
      v && v.trim().length < 5 ? "Please enter a complete address." : ""
    );
  }

  function validateContact() {
    let ok = true;
    if (!nameRe.test(name.trim())) {
      setNameErr("Name required (letters & spaces only).");
      ok = false;
    }
    if (!phoneRe.test(phone)) {
      setPhoneErr("Phone required: 10–15 digits.");
      ok = false;
    }
    if (!emailRe.test(email)) {
      setEmailErr("Valid email required.");
      ok = false;
    }
    if (address.trim().length < 5) {
      setAddressErr("Address required.");
      ok = false;
    }
    return ok;
  }

  // File handlers
  function validateAndSet(f?: File) {
    setFileErr("");
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setFile(null);
      setFileErr("Image must be ≤ 10MB.");
      return;
    }
    const ok = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    if (!ok.includes(f.type)) {
      setFile(null);
      setFileErr("Only PNG, JPG, or WEBP allowed.");
      return;
    }
    setFile(f);
    setConfirmDelete(false);
  }
  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    validateAndSet(e.target.files?.[0]);
  }
  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    validateAndSet(e.dataTransfer.files?.[0]);
  }
  function clearFile() {
    setFileErr("");
    if (previewURL) URL.revokeObjectURL(previewURL);
    setFile(null);
    setConfirmDelete(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Color handlers
  function onColorInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.trim();
    setColorInput(v);
    const ok = v === "" || isValidCssColor(v); // optional; empty is OK
    setColorValid(ok);
    if (ok && v) setColor(v);
  }

  // Generate “did you mean” list when invalid
  const colorSuggestions = useMemo(() => {
    const v = colorInput.trim().toLowerCase();
    if (!v || isValidCssColor(colorInput)) return [];
    // rank by Levenshtein and substring weight
    const scored = CSS_NAMES.map((name) => {
      const score = lev(v, name);
      const bonus = name.includes(v) ? -2 : 0; // prefer substring matches
      return { name, score: score + bonus };
    }).sort((a, b) => a.score - b.score);
    // return top 3 unique suggestions
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of scored) {
      if (!seen.has(s.name)) {
        out.push(s.name);
        seen.add(s.name);
      }
      if (out.length >= 3) break;
    }
    return out;
  }, [colorInput]);

  async function onSubmit() {
    setErr("");

    if (!file) {
      setErr("Please upload an image.");
      setStep(1);
      return;
    }
    if (!validateContact()) {
      setStep(3);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("image", file);
      fd.set("surfaceType", surfaceType);
      fd.set("surfaceOther", surfaceOther);
      fd.set("height", height);
      fd.set("width", width);
      fd.set("color", color);
      fd.set("colorName", colorInput);
      fd.set("notes", notes);

      // NEW fields
      fd.set("name", name);
      fd.set("phone", phone);
      fd.set("email", email);
      fd.set("address", address);

      const res = await fetch("/api/custom", { method: "POST", body: fd });
      let payload: any = null;
      try {
        payload = await res.json();
      } catch {}
      if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);

      setDone(true);
      if (previewURL) URL.revokeObjectURL(previewURL);
    } catch (e: any) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  // UI
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">
          Mural 3D
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

      <section className="max-w-4xl mx-auto px-6">
        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <AnimatedTabButton label="Showcase" href="/" sprite="naruto" />
          <AnimatedTabButton label="Shop" active sprite="luffy" />
        </div>

        {/* Done screen */}
        {done ? (
          <Card className="p-6 bg-white/5 border-white/15 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-2">Thanks! 🎉</h2>
            <p className="opacity-80">
              Your request has been sent. Our executive will get in touch with
              you shortly.
            </p>
          </Card>
        ) : (
          <>
            {/* Steps */}
            <div className="flex items-center gap-2 text-sm mb-3">
              {["Upload", "Details", "Contact"].map((s, i) => {
                const n = (i + 1) as Step;
                const active = step === n;
                return (
                  <div
                    key={s}
                    className={`px-3 py-1 rounded-full border transition ${
                      active
                        ? "bg-white text-black border-transparent shadow-[0_0_24px_var(--glow)]"
                        : "bg-white/5 text-white border-white/15"
                    }`}
                  >
                    {n}. {s}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full rounded-full bg-white/10 mb-4 overflow-hidden">
              <div
                className="h-full bg-[linear-gradient(90deg,rgba(182,255,90,.9),rgba(125,249,255,.9))]"
                style={{
                  width: `${(step / 3) * 100}%`,
                  transition: "width .4s ease",
                }}
              />
            </div>

            {/* STEP 1: UPLOAD */}
            {step === 1 && (
              <Card className="p-6 bg-white/5 border-white/15 rounded-2xl">
                <div className="grid md:grid-cols-[1fr_260px] gap-6">
                  {/* Preview (contained, scrollable) */}
                  <div className="flex-1">
                    <div
                      className="relative h-[300px] sm:h-[360px] md:h-[420px] rounded-2xl border border-white/10 bg-white/5
overflow-auto p-2 overscroll-contain"
                      style={{ scrollbarGutter: "stable both-edges" }}
                    >
                      {/* Delete + confirm */}
                      {file && (
                        <div className="absolute top-2 right-2 z-10 flex flex-col items-end">
                          <button
                            type="button"
                            onClick={() => setConfirmDelete((v) => !v)}
                            aria-label="Delete"
                            title="Delete"
                            className="glow-interactive glow-cyan grid place-items-center h-9 w-9 rounded-full
bg-black/55 hover:bg-black/70 border border-white/20 backdrop-blur-md"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>

                          <div
                            className={`mt-2 origin-top-right transition-all duration-150
${confirmDelete ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
rounded-xl bg-black/70 border border-white/20 backdrop-blur-md
shadow-[0_10px_30px_rgba(0,0,0,.35)] px-3 py-2 flex items-center gap-2`}
                            style={{ minWidth: 220 }}
                          >
                            <span className="text-xs opacity-90">
                              Delete this image?
                            </span>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(false)}
                              className="text-xs px-2 py-1 rounded-full bg-white/15 hover:bg-white/25 transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                clearFile();
                                setConfirmDelete(false);
                              }}
                              className="text-xs px-2 py-1 rounded-full bg-[rgb(182,255,90)] text-black hover:bg-[rgb(172,245,80)]
glow-interactive glow-primary transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}

                      {previewURL ? (
                        <div className="relative inline-block w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewURL}
                            alt="preview"
                            className="block w-full h-auto"
                          />
                          {/* tint overlay */}
                          <div
                            className="pointer-events-none absolute inset-0 rounded-lg"
                            style={{
                              background: color,
                              opacity: TINT_OPACITY,
                              mixBlendMode: "multiply",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-full grid place-items-center text-center opacity-80 text-sm">
                          Upload an image (PNG/JPG/WEBP, ≤ 10MB)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload controls */}
                  <div className="w-full">
                    <label
                      htmlFor="uploader"
                      onDrop={onDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="block rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10
hover:from-white/12 hover:via-white/7 hover:to-white/12 transition p-4 cursor-pointer"
                    >
                      <div className="text-sm font-medium mb-1">
                        Choose image
                      </div>
                      <p className="text-xs opacity-80">
                        Drag & drop or click to browse (transparent PNG/WebP
                        preferred).
                      </p>
                      <input
                        id="uploader"
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={onPickFile}
                        className="sr-only"
                      />
                    </label>

                    {file && (
                      <div className="mt-2 text-xs opacity-80 truncate">
                        Selected:{" "}
                        <span className="opacity-100">{file.name}</span>
                      </div>
                    )}
                    {fileErr && (
                      <p className="text-xs text-red-400 mt-2">{fileErr}</p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_18px_rgba(255,255,255,.15)] glow-interactive glow-primary"
                      >
                        Choose
                      </Button>
                      <Button
                        disabled={!file}
                        onClick={() => setStep(2)}
                        className="rounded-full bg-[rgb(182,255,90)] text-black hover:bg-[rgb(172,245,80)]
shadow-[0_0_28px_rgba(182,255,90,.35)] disabled:opacity-40 disabled:cursor-not-allowed glow-interactive glow-primary"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <Card className="p-6 bg-white/5 border-white/15 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,.35)]">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Surface type segmented control */}
                  <div className="md:col-span-2">
                    <div className="text-sm opacity-80 mb-2">Surface Type</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["Wall", "Door", "Floor", "Other"] as const).map(
                        (t) => {
                          const active = surfaceType === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setSurfaceType(t)}
                              className={`px-4 py-2 rounded-full border text-sm transition glow-interactive ${
                                active
                                  ? "glow-primary bg-white text-black border-transparent shadow-[0_0_22px_rgba(255,255,255,.25)]"
                                  : "glow-cyan bg-white/8 text-white border-white/20 hover:bg-white/12"
                              }`}
                              aria-pressed={active}
                            >
                              {t}
                            </button>
                          );
                        }
                      )}
                    </div>
                    {surfaceType === "Other" && (
                      <div className="mt-3">
                        <label className="text-xs opacity-80">
                          If Other, describe
                        </label>
                        <Input
                          value={surfaceOther}
                          onChange={(e) => setSurfaceOther(e.target.value)}
                          placeholder="e.g., ceiling, pillar…"
                          className="mt-1 rounded-xl bg-white/10 border-white/20 placeholder:text-white/60"
                        />
                      </div>
                    )}
                  </div>

                  {/* Height (optional) */}
                  <div>
                    <label className="text-sm opacity-80">
                      Height{" "}
                      <span className="ml-2 text-xs opacity-60">
                        (optional)
                      </span>
                    </label>
                    <div className="relative mt-1">
                      <Input
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="e.g., 8"
                        className="rounded-xl bg-white/10 border-white/20 placeholder:text-white/60 pr-12"
                        inputMode="decimal"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-80 bg-black/30 px-2 py-0.5 rounded-md">
                        ft
                      </span>
                    </div>
                  </div>

                  {/* Width (optional) */}
                  <div>
                    <label className="text-sm opacity-80">
                      Width{" "}
                      <span className="ml-2 text-xs opacity-60">
                        (optional)
                      </span>
                    </label>
                    <div className="relative mt-1">
                      <Input
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="e.g., 12"
                        className="rounded-xl bg-white/10 border-white/20 placeholder:text-white/60 pr-12"
                        inputMode="decimal"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-80 bg-black/30 px-2 py-0.5 rounded-md">
                        ft
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm opacity-80">
                      Wall color{" "}
                      <span className="ml-2 text-xs opacity-60">
                        (optional)
                      </span>
                    </label>

                    {/* Preset swatches */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {SWATCHES.map((s) => {
                        const active =
                          color.toLowerCase() === s.value.toLowerCase();
                        return (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() => {
                              setColor(s.value);
                              setColorInput(s.name);
                              setColorValid(true);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition
${active ? "bg-white text-black border-transparent" : "bg-white/8 text-white border-white/20 hover:bg-white/12"}`}
                            title={s.name}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-white/30 inline-block"
                              style={{ background: s.value }}
                            />
                            {s.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Text input + the ONLY live swatch */}
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="h-7 w-7 rounded-md border border-white/30 shadow-inner"
                        title={
                          colorValid
                            ? colorInput || "transparent"
                            : "Invalid color"
                        }
                        style={{
                          background: colorValid
                            ? colorInput || "#ffffff"
                            : "repeating-linear-gradient(45deg, #ff6666 0 6px, #0000 6px 12px)",
                        }}
                      />
                      <input
                        type="text"
                        value={colorInput}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          setColorInput(v);
                          const ok = v === "" || isValidCssColor(v);
                          setColorValid(ok);
                          if (ok && v) setColor(v);
                        }}
                        placeholder="Try: black, skyblue, #ff8800, rgb(0 0 0)"
                        className={`flex-1 rounded-xl bg-white/10 border px-3 py-2 text-sm placeholder:text-white/60 ${
                          colorValid ? "border-white/20" : "border-red-400"
                        }`}
                        aria-invalid={!colorValid}
                      />
                    </div>

                    {/* “Did you mean” suggestions (appear only when misspelled) */}
                    {!colorValid && (
                      <div className="mt-2 text-xs flex items-center gap-2">
                        <span className="opacity-80">Did you mean:</span>
                        <div className="flex flex-wrap gap-2">
                          {CSS_NAMES.sort((a, b) => a.localeCompare(b))
                            .slice(0, 3)
                            .map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => {
                                  setColorInput(n);
                                  setColor(n);
                                  setColorValid(true);
                                }}
                                className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/16 border border-white/20"
                              >
                                {n}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="text-sm opacity-80">
                      Additional notes
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything else we should know?"
                      className="mt-1 rounded-2xl bg-white/10 border-white/20 placeholder:text-white/60 min-h-[120px]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="rounded-full border-white/25 bg-white/10 hover:bg-white/14 glow-interactive glow-cyan"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="rounded-full bg-[rgb(182,255,90)] text-black hover:bg-[rgb(172,245,80)]
shadow-[0_0_28px_rgba(182,255,90,.35)] glow-interactive glow-primary"
                  >
                    Next
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 3: CONTACT */}
            {step === 3 && (
              <Card className="p-6 bg-white/5 border-white/15 rounded-2xl">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm opacity-80">Name</label>
                    <Input
                      value={name}
                      onChange={handleNameChange}
                      placeholder="e.g., Arjun Kumar"
                      className={`mt-1 rounded-xl bg-white/10 border ${nameErr ? "border-red-400" : "border-white/20"}`}
                      inputMode="text"
                    />
                    {nameErr && (
                      <p className="text-xs text-red-400 mt-1">{nameErr}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm opacity-80">Phone</label>
                    <Input
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="10 digits"
                      className={`mt-1 rounded-xl bg-white/10 border ${phoneErr ? "border-red-400" : "border-white/20"}`}
                      inputMode="numeric"
                    />
                    {phoneErr && (
                      <p className="text-xs text-red-400 mt-1">{phoneErr}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="text-sm opacity-80">Email</label>
                    <Input
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="you@example.com"
                      className={`mt-1 rounded-xl bg-white/10 border ${emailErr ? "border-red-400" : "border-white/20"}`}
                      inputMode="email"
                    />
                    {emailErr && (
                      <p className="text-xs text-red-400 mt-1">{emailErr}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="text-sm opacity-80">Address</label>
                    <Textarea
                      value={address}
                      onChange={handleAddressChange}
                      placeholder="House/Flat, Street, Area, City, Pincode"
                      className={`mt-1 rounded-2xl bg-white/10 border ${addressErr ? "border-red-400" : "border-white/20"} min-h-[100px]`}
                    />
                    {addressErr && (
                      <p className="text-xs text-red-400 mt-1">{addressErr}</p>
                    )}
                  </div>
                </div>

                {err && <p className="text-sm text-red-400 mt-3">{err}</p>}

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setStep(2)}
                    className="rounded-full border-white/25 bg-white/10 hover:bg-white/14 glow-interactive glow-cyan"
                  >
                    Back
                  </Button>
                  <Button
                    disabled={submitting}
                    onClick={onSubmit}
                    className="rounded-full bg-[rgb(182,255,90)] text-black hover:bg-[rgb(172,245,80)]
shadow-[0_0_28px_rgba(182,255,90,.35)] disabled:opacity-40 glow-interactive glow-primary"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </section>
    </main>
  );
}
