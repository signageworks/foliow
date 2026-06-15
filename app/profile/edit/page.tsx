"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Camera, Loader2, Check, Search, Building2, X, BadgeCheck } from "lucide-react";
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

interface Trade {
  id: string;
  name: string;
}

interface Employer {
  id: string;
  name: string;
  city: string | null;
  isVerified: boolean;
  logoUrl: string | null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [tradeId, setTradeId] = useState("");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Employer state
  const [employerQuery, setEmployerQuery] = useState("");
  const [employerResults, setEmployerResults] = useState<Employer[]>([]);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [originalEmployerId, setOriginalEmployerId] = useState<string | null>(null);
  const [searchingEmployer, setSearchingEmployer] = useState(false);
  const [showEmployerDropdown, setShowEmployerDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const avatarRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const [profileRes, tradesRes] = await Promise.all([
        fetch("/api/profile/me"),
        fetch("/api/trades"),
      ]);
      if (profileRes.ok) {
        const p = await profileRes.json();
        setName(p.name ?? "");
        setBio(p.bio ?? "");
        setCity(p.city ?? "");
        setTradeId(p.tradeId ?? "");
        setAvatarUrl(p.avatarUrl ?? null);
        if (p.currentEmployerId) {
          setOriginalEmployerId(p.currentEmployerId);
          setSelectedEmployer({
            id: p.currentEmployerId,
            name: p.currentEmployerName ?? "",
            city: null,
            isVerified: false,
            logoUrl: null,
          });
          setEmployerQuery(p.currentEmployerName ?? "");
        }
      }
      if (tradesRes.ok) {
        setTrades(await tradesRes.json());
      }
      setLoading(false);
    }
    load();
  }, []);

  const searchEmployers = useCallback(async (q: string) => {
    setSearchingEmployer(true);
    try {
      const res = await fetch(`/api/employers?q=${encodeURIComponent(q)}`);
      if (res.ok) setEmployerResults(await res.json());
    } finally {
      setSearchingEmployer(false);
    }
  }, []);

  const handleEmployerInput = (val: string) => {
    setEmployerQuery(val);
    setSelectedEmployer(null);
    setShowEmployerDropdown(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchEmployers(val), 300);
  };

  const selectEmployer = (emp: Employer) => {
    setSelectedEmployer(emp);
    setEmployerQuery(emp.name);
    setShowEmployerDropdown(false);
  };

  const clearEmployer = () => {
    setSelectedEmployer(null);
    setEmployerQuery("");
    setEmployerResults([]);
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        setUploadingAvatar(true);
        finalAvatarUrl = await uploadToR2(avatarFile);
        setUploadingAvatar(false);
      }

      // 1. Profil güncelle
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, city, tradeId: tradeId || null, avatarUrl: finalAvatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // 2. İşveren değiştiyse ayrı endpoint
      const newEmployerId = selectedEmployer?.id ?? null;
      const newEmployerName = selectedEmployer?.name ?? employerQuery.trim();
      const employerChanged = newEmployerId !== originalEmployerId || (!newEmployerId && newEmployerName);

      if (employerChanged && (newEmployerId || newEmployerName)) {
        // Yeni işveren adı girildiyse önce oluştur
        let finalEmployerId = newEmployerId;
        let finalEmployerName = newEmployerName;

        if (!finalEmployerId && newEmployerName) {
          const createRes = await fetch("/api/employers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newEmployerName, city }),
          });
          if (createRes.ok) {
            const created = await createRes.json();
            finalEmployerId = created.id;
            finalEmployerName = created.name;
          }
        }

        await fetch("/api/employer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employerId: finalEmployerId, employerName: finalEmployerName }),
        });
      } else if (employerChanged && !newEmployerId && !newEmployerName) {
        // İşvereni kaldırdı
        await fetch("/api/employer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employerId: null, employerName: "Freelance / Self-employed" }),
        });
      }

      await update({ name });
      setSaved(true);
      setTimeout(() => {
        router.push(`/${(session?.user as { username?: string })?.username ?? ""}`);
        router.refresh();
      }, 800);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarPreview ?? avatarUrl;
  const username = (session?.user as { username?: string })?.username ?? "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Link
          href={`/${username}`}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors text-muted hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-semibold text-base flex-1">Edit profile</h1>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-1.5 text-accent font-semibold text-sm disabled:opacity-40"
        >
          {saved ? (
            <><Check size={16} /> Saved</>
          ) : saving ? (
            <><Loader2 size={14} className="animate-spin" /> Saving...</>
          ) : (
            "Save"
          )}
        </button>
      </div>

      <div className="max-w-lg w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-4xl">
                {name.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 transition-colors"
            >
              {uploadingAvatar ? (
                <Loader2 size={14} className="text-white animate-spin" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </button>
          </div>
          <button type="button" onClick={() => avatarRef.current?.click()} className="text-sm text-accent font-medium hover:underline">
            Change photo
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              maxLength={100}
              className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors text-sm"
            />
          </div>

          {/* Trade */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Trade</label>
            <select
              value={tradeId}
              onChange={(e) => setTradeId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-accent transition-colors text-sm appearance-none cursor-pointer"
            >
              <option value="">Select your trade</option>
              {trades.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. London"
              maxLength={100}
              className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors text-sm"
            />
          </div>

          {/* Employer */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Current workplace</label>
            <p className="text-xs text-muted -mt-1">Changing this notifies all your followers</p>
            <div className="relative">
              <div className="relative flex items-center">
                <Building2 size={16} className="absolute left-3.5 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={employerQuery}
                  onChange={(e) => handleEmployerInput(e.target.value)}
                  onFocus={() => { if (!selectedEmployer) setShowEmployerDropdown(true); searchEmployers(employerQuery); }}
                  placeholder="Search or type workplace name..."
                  className="w-full pl-9 pr-9 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors text-sm"
                />
                {employerQuery && (
                  <button type="button" onClick={clearEmployer} className="absolute right-3 text-muted hover:text-foreground">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showEmployerDropdown && !selectedEmployer && (
                <div className="absolute z-20 top-full mt-1 w-full bg-surface-2 border border-border rounded-xl overflow-hidden shadow-xl">
                  {searchingEmployer ? (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
                      <Loader2 size={14} className="animate-spin" /> Searching...
                    </div>
                  ) : employerResults.length > 0 ? (
                    <>
                      {employerResults.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => selectEmployer(emp)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors text-left"
                        >
                          {emp.logoUrl ? (
                            <img src={emp.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                              <Building2 size={14} className="text-accent" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground truncate">{emp.name}</span>
                              {emp.isVerified && <BadgeCheck size={14} className="text-accent flex-shrink-0" />}
                            </div>
                            {emp.city && <span className="text-xs text-muted">{emp.city}</span>}
                          </div>
                        </button>
                      ))}
                      {employerQuery.trim() && !employerResults.find(e => e.name.toLowerCase() === employerQuery.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmployer({ id: "", name: employerQuery.trim(), city: null, isVerified: false, logoUrl: null });
                            setShowEmployerDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-accent hover:bg-surface transition-colors border-t border-border"
                        >
                          <Search size={14} /> Add &quot;{employerQuery.trim()}&quot; as new workplace
                        </button>
                      )}
                    </>
                  ) : employerQuery.trim() ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployer({ id: "", name: employerQuery.trim(), city: null, isVerified: false, logoUrl: null });
                        setShowEmployerDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-accent hover:bg-surface transition-colors"
                    >
                      <Search size={14} /> Add &quot;{employerQuery.trim()}&quot; as new workplace
                    </button>
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted">Type to search workplaces...</div>
                  )}
                </div>
              )}
            </div>

            {selectedEmployer && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-sm">
                <Building2 size={14} className="text-accent flex-shrink-0" />
                <span className="text-foreground font-medium flex-1 truncate">{selectedEmployer.name}</span>
                {selectedEmployer.isVerified && <BadgeCheck size={14} className="text-accent" />}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Bio</label>
              <span className="text-xs text-muted">{bio.length}/300</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about your work and experience..."
              rows={4}
              maxLength={300}
              className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors text-sm resize-none leading-relaxed"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20">
            <span>⚠</span> {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="w-full py-3.5 rounded-2xl bg-accent text-white font-semibold text-base transition-all hover:bg-accent/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saved ? (
            <><Check size={18} /> Profile updated</>
          ) : saving ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </div>
  );
}
