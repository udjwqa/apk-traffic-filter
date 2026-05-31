"use client";

import { useState } from "react";
import { useApps, type AppEntry } from "@/hooks/use-apps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Shield,
  ExternalLink,
  Copy,
} from "lucide-react";

export function AppsContent() {
  const { apps, isLoading, addApp, updateApp, deleteApp, togglePanic } =
    useApps();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    package_name: "",
    cert_sha256: "",
    gcp_project_id: "",
    safe_url: "",
    target_url: "",
    white_flow_type: "redirect_safe",
    excluded_countries: "",
    disable_lang_check: false,
  });
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditingApp(null);
    setForm({
      name: "",
      package_name: "",
      cert_sha256: "",
      gcp_project_id: "",
      safe_url: "",
      target_url: "",
      white_flow_type: "redirect_safe",
      excluded_countries: "",
      disable_lang_check: false,
    });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (app: AppEntry) => {
    setEditingApp(app);
    setForm({
      name: app.name,
      package_name: app.package_name,
      cert_sha256: app.cert_sha256,
      gcp_project_id: app.gcp_project_id || "",
      safe_url: app.safe_url,
      target_url: app.target_url,
      white_flow_type: app.white_flow_type,
      excluded_countries: (app.excluded_countries || []).join(", "),
      disable_lang_check: app.disable_lang_check || false,
    });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.package_name) {
      setError("Название и Package Name обязательны");
      return;
    }
    try {
      const payload = {
        ...form,
        excluded_countries: form.excluded_countries
          ? form.excluded_countries.split(",").map((s: string) => s.trim().toUpperCase()).filter(Boolean)
          : [],
      };
      if (editingApp) {
        await updateApp(editingApp.id, payload);
      } else {
        await addApp(payload as any);
      }
      setDialogOpen(false);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteApp(id);
    setDeleteConfirm(null);
  };

  const flowLabels: Record<string, string> = {
    redirect_safe: "Редирект на Safe URL",
    show_403: "Показать 403",
    show_404: "Показать 404",
    fake_html: "Фейковая HTML-страница",
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Приложения</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Приложения</h1>
          <p className="mt-1 text-sm text-white/40">
            Управление APK и офферами
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 rounded-xl bg-white text-black hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16">
          <Package className="h-12 w-12 text-white/20" />
          <p className="mt-4 text-sm text-white/40">Нет приложений</p>
          <Button
            onClick={openCreate}
            variant="outline"
            className="mt-4 gap-2 rounded-xl border-white/10 text-white/60"
          >
            <Plus className="h-4 w-4" />
            Добавить первое
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Package className="h-5 w-5 text-white/70" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{app.name}</h3>
                    <p className="text-xs text-white/40 font-mono">
                      {app.package_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {app.panic_mode && (
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                      PANIC
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(app)}
                    className="h-8 w-8 text-white/40 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirm(app.id)}
                    className="h-8 w-8 text-white/40 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] text-white/30">Target URL</p>
                  <p className="mt-0.5 truncate text-xs text-white/60 font-mono">
                    {app.target_url || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] text-white/30">Safe URL</p>
                  <p className="mt-0.5 truncate text-xs text-white/60 font-mono">
                    {app.safe_url || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] text-white/30">White Flow</p>
                  <p className="mt-0.5 text-xs text-white/60">
                    {flowLabels[app.white_flow_type] || app.white_flow_type}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] text-white/30">Cert SHA-256</p>
                  <p className="mt-0.5 truncate text-xs text-white/60 font-mono">
                    {app.cert_sha256 ? app.cert_sha256.slice(0, 20) + "..." : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400/60" />
                  <span className="text-xs text-white/50">Panic Mode</span>
                </div>
                <Switch
                  checked={app.panic_mode}
                  onCheckedChange={() => togglePanic(app.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm bg-[oklch(0.11_0_0)] border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle>Удалить приложение?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/50">
            Это действие необратимо. Приложение будет удалено из системы.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="rounded-xl border-white/10 text-white/60"
            >
              Отмена
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="rounded-xl bg-red-500 text-white hover:bg-red-600"
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-[oklch(0.11_0_0)] border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingApp ? "Редактировать" : "Новое приложение"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && (
              <div className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">Название *</label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Betclic Sports"
                className="rounded-xl border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">Package Name *</label>
              <Input
                value={form.package_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, package_name: e.target.value }))
                }
                placeholder="com.example.app"
                disabled={!!editingApp}
                className="rounded-xl border-white/10 bg-white/5 text-white font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">
                SHA-256 сертификата подписи
              </label>
              <Input
                value={form.cert_sha256}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cert_sha256: e.target.value }))
                }
                placeholder="5QabPPipWBDaB1A2ZBvB+m318Yg..."
                className="rounded-xl border-white/10 bg-white/5 text-white font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">
                GCP Project ID (для Play Integrity)
              </label>
              <Input
                value={form.gcp_project_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, gcp_project_id: e.target.value }))
                }
                placeholder="betclic-497407"
                className="rounded-xl border-white/10 bg-white/5 text-white font-mono text-xs"
              />
              <p className="text-[10px] text-white/25">
                ID проекта из Google Cloud Console. Должен совпадать с project_id в gcp-key файле
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-white/50">Target URL</label>
                <Input
                  value={form.target_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, target_url: e.target.value }))
                  }
                  placeholder="https://offer.com/..."
                  className="rounded-xl border-white/10 bg-white/5 text-white text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/50">Safe URL</label>
                <Input
                  value={form.safe_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, safe_url: e.target.value }))
                  }
                  placeholder="https://play.google.com/..."
                  className="rounded-xl border-white/10 bg-white/5 text-white text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">
                Тип белого потока
              </label>
              <select
                value={form.white_flow_type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, white_flow_type: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              >
                <option value="redirect_safe">Редирект на Safe URL</option>
                <option value="show_403">Показать 403</option>
                <option value="show_404">Показать 404</option>
                <option value="fake_html">Фейковая HTML-страница</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">
                Исключённые страны (коды через запятую)
              </label>
              <Input
                value={form.excluded_countries}
                onChange={(e) =>
                  setForm((p) => ({ ...p, excluded_countries: e.target.value }))
                }
                placeholder="US, GB"
                className="rounded-xl border-white/10 bg-white/5 text-white font-mono text-xs"
              />
              <p className="text-[10px] text-white/25">
                Страны из этого списка не будут блокироваться для этого приложения
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
              <div>
                <p className="text-xs text-white/50">Отключить проверку языка</p>
                <p className="text-[10px] text-white/25">Не проверять язык устройства vs страну IP</p>
              </div>
              <Switch
                checked={form.disable_lang_check}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, disable_lang_check: v }))
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl border-white/10 text-white/60"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-xl bg-white text-black hover:bg-white/90"
              >
                {editingApp ? "Сохранить" : "Добавить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
