import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

const contentFields = [
  { key: "announcement_text", label: "نص شريط الإعلان", type: "text" },
  { key: "hero_title", label: "عنوان الهيرو", type: "text" },
  { key: "hero_subtitle", label: "وصف الهيرو", type: "textarea" },
  { key: "hero_badge", label: "شارة الهيرو", type: "text" },
  { key: "countdown_title", label: "عنوان العد التنازلي", type: "text" },
  { key: "countdown_subtitle", label: "وصف العد التنازلي", type: "text" },
  { key: "shipping_text", label: "نص الشحن", type: "text" },
];

function AdminContent() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("site_settings").update({ value }).eq("key", key);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">إدارة المحتوى</h1>
        {saved && <span className="text-sm text-green-600 font-medium">✓ تم الحفظ</span>}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 max-w-2xl">
        {contentFields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                value={settings[field.key] ?? ""}
                onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              />
            ) : (
              <input
                type="text"
                value={settings[field.key] ?? ""}
                onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              />
            )}
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </div>
  );
}
