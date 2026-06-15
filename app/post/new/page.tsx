"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, ArrowLeft, Loader2, Camera, MapPin, Search } from "lucide-react";
import Link from "next/link";

async function uploadToR2(file: File): Promise<string> {
  const res = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  const { presignedUrl, publicUrl } = await res.json();

  const upload = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok) throw new Error("Upload failed");

  return publicUrl;
}

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

function formatLocationName(result: LocationResult): string {
  const a = result.address;
  if (!a) return result.display_name.split(",").slice(0, 2).join(",").trim();
  const parts = [
    a.city || a.town || a.village,
    a.county,
    a.postcode,
  ].filter(Boolean);
  return parts.join(", ");
}

export default function NewPostPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Location state
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [locationSearching, setLocationSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
    setError("");
  };

  const searchLocation = async (q: string) => {
    if (q.length < 3) { setLocationResults([]); return; }
    setLocationSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&countrycodes=gb&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: LocationResult[] = await res.json();
      setLocationResults(data);
      setShowResults(true);
    } catch {
      // silent
    } finally {
      setLocationSearching(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!locationQuery) { setLocationResults([]); setShowResults(false); return; }
    searchTimeout.current = setTimeout(() => searchLocation(locationQuery), 400);
  }, [locationQuery]);

  const pickLocation = (r: LocationResult) => {
    const name = formatLocationName(r);
    setSelectedLocation({ name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setLocationQuery(name);
    setShowResults(false);
    setLocationResults([]);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setLocationQuery("");
    setLocationResults([]);
    setShowResults(false);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please choose a photo first.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const imageUrl = await uploadToR2(file);

      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageUrl,
          caption,
          locationName: selectedLocation?.name ?? null,
          locationLat: selectedLocation?.lat ?? null,
          locationLng: selectedLocation?.lng ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Link
          href="/feed"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors text-muted hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-semibold text-base">New post</h1>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Image picker */}
        <div
          className="relative w-full rounded-2xl overflow-hidden bg-surface cursor-pointer"
          style={{ aspectRatio: "4/3" }}
          onClick={() => !preview && fileRef.current?.click()}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={36} className="text-white animate-spin" />
                  <p className="text-white text-sm font-medium tracking-wide">Uploading your work...</p>
                </div>
              )}
              {!loading && (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-medium rounded-full transition-colors backdrop-blur-sm"
                  >
                    <Camera size={13} /> Change
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border hover:border-accent/60 rounded-2xl transition-colors group">
              <div className="w-16 h-16 rounded-2xl bg-surface-2 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                <ImagePlus size={28} strokeWidth={1.5} className="text-muted group-hover:text-accent transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Add a photo</p>
                <p className="text-xs text-muted mt-0.5">JPG, PNG, WebP · max 8 MB</p>
              </div>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {/* Caption */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Caption</label>
            <span className="text-xs text-muted">{caption.length}/500</span>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Describe your work — materials used, job type..."
            rows={3}
            maxLength={500}
            className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors text-sm resize-none leading-relaxed"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold flex items-center gap-1.5">
            <MapPin size={14} className="text-accent" />
            Tag location
            <span className="text-xs text-muted font-normal ml-1">optional</span>
          </label>

          {selectedLocation ? (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-accent/10 border border-accent/30">
              <MapPin size={15} className="text-accent flex-shrink-0" />
              <span className="text-sm text-foreground flex-1">{selectedLocation.name}</span>
              <button
                type="button"
                onClick={clearLocation}
                className="w-6 h-6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative flex items-center">
                <Search size={15} className="absolute left-3.5 text-muted pointer-events-none" />
                <input
                  ref={locationRef}
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onFocus={() => locationResults.length > 0 && setShowResults(true)}
                  placeholder="Search city, postcode or area..."
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors text-sm"
                />
                {locationSearching && (
                  <Loader2 size={14} className="absolute right-3.5 text-muted animate-spin" />
                )}
              </div>

              {showResults && locationResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
                  {locationResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pickLocation(r)}
                      className="w-full flex items-start gap-2.5 px-3.5 py-3 hover:bg-surface-2 transition-colors text-left border-b border-border last:border-0"
                    >
                      <MapPin size={14} className="text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground leading-snug line-clamp-2">
                        {formatLocationName(r)}
                        <span className="block text-xs text-muted">{r.display_name.split(",").slice(0, 3).join(",")}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-muted">
            Followers can click to view on a map
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Share button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !file}
          className="w-full py-3.5 rounded-2xl bg-accent text-white font-semibold text-base transition-all
            hover:bg-accent/90 active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
            flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Uploading...</>
          ) : (
            "Share post"
          )}
        </button>
      </div>
    </div>
  );
}
