"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Check, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    email: string;
    name: string;
    role: string;
    createdAt: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setNewEmail(data.email || "");
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setError("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (newPassword && !currentPassword) {
      setError("Введите текущий пароль");
      return;
    }

    setStatus("saving");
    try {
      const body: Record<string, string> = {};
      if (name !== profile?.name) body.name = name;
      if (newEmail !== profile?.email) body.newEmail = newEmail;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка сохранения");
        setStatus("error");
        return;
      }

      setStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (data.user) {
        setProfile((p) => (p ? { ...p, ...data.user } : p));
      }
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setError("Ошибка соединения");
      setStatus("error");
    }
  };

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-white">Профиль</h1>
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Профиль</h1>
        <p className="mt-1 text-sm text-white/40">Настройки аккаунта</p>
      </div>

      <div className="space-y-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <User className="h-6 w-6 text-white/70" />
          </div>
          <div>
            <p className="font-semibold text-white">{profile.name || profile.email}</p>
            <p className="text-xs text-white/40">{profile.role} • с {new Date(profile.createdAt).toLocaleDateString("ru")}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs text-white/50">
            <User className="h-3.5 w-3.5" /> Имя
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border-white/10 bg-white/5 text-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs text-white/50">
            <Mail className="h-3.5 w-3.5" /> Email
          </label>
          <Input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="rounded-xl border-white/10 bg-white/5 text-white"
          />
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <p className="mb-3 text-xs font-medium text-white/50">Смена пароля</p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-white/40">
                <Lock className="h-3.5 w-3.5" /> Текущий пароль
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40">Новый пароль</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border-white/10 bg-white/5 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40">Подтверждение</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5 shrink-0" />
            Сохранено
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={status === "saving"}
          className="w-full rounded-xl bg-white text-black hover:bg-white/90"
        >
          {status === "saving" ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}
