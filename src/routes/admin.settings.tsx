import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const contactFields = [
  { key: "whatsapp_number", label: "رقم الواتساب", type: "text", placeholder: "212672492366" },
  { key: "contact_email", label: "البريد الإلكتروني", type: "email", placeholder: "contact@example.com" },
  { key: "contact_phone", label: "رقم الهاتف", type: "text", placeholder: "+212 600 000 000" },
  { key: "contact_address", label: "العنوان", type: "text", placeholder: "المملكة المغربية" },
];

const contentFields = [
  { key: "hero_title", label: "عنوان البطل", type: "text", placeholder: "ملابس أطفال بجودة عالية" },
  { key: "hero_subtitle", label: "النص الترويجي", type: "textarea", placeholder: "اكتشف مجموعتنا الحصرية..." },
  { key: "hero_badge", label: "شارة البطل", type: "text", placeholder: "+5,000 عميل راضٍ عنا" },
  { key: "shipping_text", label: "نص الشحن", type: "text", placeholder: "شحن مجاني" },
  { key: "announcement_text", label: "نص الإعلان العلوي", type: "text", placeholder: "عرض خاص: شحن مجاني..." },
  { key: "countdown_title", label: "عنوان العد التنازلي", type: "text", placeholder: "لا تفوّت الفرصة!" },
  { key: "countdown_subtitle", label: "نص العد التنازلي", type: "text", placeholder: "تخفيضات حصرية تنتهي اليوم" },
];

function SettingsGroup({ title, icon, fields, settings, onChange }: {
  title: string;
  icon: string;
  fields: typeof contactFields;
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
          {field.type === "textarea" ? (
            <textarea
              value={settings[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
            />
          ) : (
            <input
              type={field.type}
              value={settings[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}

function AdminSettings() {
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

  function handleChange(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      const { data } = await supabase.from("site_settings").select("id").eq("key", key).maybeSingle();
      if (data) {
        await supabase.from("site_settings").update({ value }).eq("key", key);
      } else {
        await supabase.from("site_settings").insert({ key, value });
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">إعدادات المتجر</h1>
        {saved && <span className="text-sm text-green-600 font-medium">✓ تم الحفظ</span>}
      </div>

      <div className="space-y-6 max-w-2xl">
        <SettingsGroup
          title="محتوى الصفحة الرئيسية"
          icon="📝"
          fields={contentFields}
          settings={settings}
          onChange={handleChange}
        />

        <SettingsGroup
          title="معلومات التواصل"
          icon="📞"
          fields={contactFields}
          settings={settings}
          onChange={handleChange}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}
