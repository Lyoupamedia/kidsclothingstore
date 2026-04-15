import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  old_price: null as number | null,
  badge: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
  ages: [] as string[],
};

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  async function handleSave() {
    if (!editing) return;
    const { id, created_at, updated_at, ...rest } = editing as any;

    if (isNew) {
      await supabase.from("products").insert(rest);
    } else {
      await supabase.from("products").update(rest).eq("id", id);
    }
    setEditing(null);
    setIsNew(false);
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    await supabase.from("products").delete().eq("id", id);
    loadProducts();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setEditing({ ...editing, image_url: data.publicUrl });
    }
    setUploading(false);
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  if (editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">{isNew ? "إضافة منتج" : "تعديل المنتج"}</h1>
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-muted-foreground hover:text-foreground">✕ إلغاء</button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسم المنتج" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field label="الرابط (slug)" value={editing.slug ?? ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
          </div>
          <Field label="الوصف" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} textarea />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="السعر" type="number" value={String(editing.price ?? 0)} onChange={(v) => setEditing({ ...editing, price: Number(v) })} />
            <Field label="السعر القديم" type="number" value={String(editing.old_price ?? "")} onChange={(v) => setEditing({ ...editing, old_price: v ? Number(v) : null })} />
            <Field label="الشارة" value={editing.badge ?? ""} onChange={(v) => setEditing({ ...editing, badge: v })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="الترتيب" type="number" value={String(editing.sort_order ?? 0)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })} />
            <Field label="الأحجام/الأعمار (مفصولة بفاصلة)" value={(editing.ages ?? []).join(", ")} onChange={(v) => setEditing({ ...editing, ages: v.split(",").map(s => s.trim()).filter(Boolean) })} />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">صورة المنتج</label>
            {editing.image_url && (
              <img src={editing.image_url} alt="" className="w-32 h-32 object-cover rounded-xl mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
            {uploading && <span className="text-sm text-muted-foreground mr-2">جاري الرفع...</span>}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_active ?? true}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground">منتج مفعّل</span>
            </label>
          </div>

          <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
            {isNew ? "إضافة المنتج" : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">المنتجات</h1>
        <button
          onClick={() => { setEditing({ ...emptyProduct }); setIsNew(true); }}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          + إضافة منتج
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد منتجات بعد</div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground truncate">{p.name}</span>
                  {!p.is_active && <span className="text-xs bg-muted px-2 py-0.5 rounded">معطّل</span>}
                  {p.badge && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{p.badge}</span>}
                </div>
                <div className="text-sm text-muted-foreground">{p.price} د.م {p.old_price ? `(${p.old_price} د.م)` : ""}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditing(p)} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm">تعديل</button>
                <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean;
}) {
  const cls = "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm";
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}
