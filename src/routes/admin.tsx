import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Product = Database["public"]["Tables"]["products"]["Row"];
type Message = Database["public"]["Tables"]["contact_messages"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

type Tab = "dashboard" | "orders" | "products" | "messages" | "settings";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "لوحة التحكم", icon: "📊" },
  { id: "orders", label: "الطلبات", icon: "🛒" },
  { id: "products", label: "المنتجات", icon: "📦" },
  { id: "messages", label: "الرسائل", icon: "💬" },
  { id: "settings", label: "الإعدادات", icon: "⚙️" },
];

// ─── Main Page ───
function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    const checkAdmin = async (userId: string) => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
      if (!cancelled) setIsAdmin(!!data);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user);
        checkAdmin(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user);
        checkAdmin(session.user.id);
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    // Safety timeout
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Realtime: notify on new orders
  useEffect(() => {
    if (!isAdmin) return;

    const playDing = () => {
      try {
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
        if (!Ctx) return;
        const ctx = new Ctx();
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, ctx.currentTime + start);
          gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
          osc.connect(gain).connect(ctx.destination);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + duration);
        };
        playTone(880, 0, 0.18);
        playTone(1175, 0.15, 0.22);
        setTimeout(() => ctx.close(), 600);
      } catch (e) {
        console.warn("Audio ding failed", e);
      }
    };

    const channel = supabase
      .channel("admin-new-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as Order;
          playDing();
          toast.success("🛒 طلب جديد!", {
            description: `${order.product_name} — ${order.customer_name} (${order.customer_phone})`,
            duration: 8000,
            action: {
              label: "عرض",
              onClick: () => setActiveTab("orders"),
            },
          });
          window.dispatchEvent(new CustomEvent("orders:new"));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);


  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <AdminLogin onLogin={() => window.location.reload()} />;

  if (!isAdmin) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">⛔ غير مصرح</h1>
          <p className="text-muted-foreground mb-6">ليس لديك صلاحيات الوصول للوحة الإدارة</p>
          <button onClick={() => supabase.auth.signOut()} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">تسجيل الخروج</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Kids</span>
            <span className="text-xl font-bold text-foreground">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
              className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive font-medium text-sm"
            >
              خروج
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto pb-px -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === "dashboard" && <DashboardPanel />}
        {activeTab === "orders" && <OrdersPanel />}
        {activeTab === "products" && <ProductsPanel />}
        {activeTab === "messages" && <MessagesPanel />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}

// ─── Dashboard ───
function DashboardPanel() {
  const [stats, setStats] = useState({ products: 0, messages: 0, unread: 0, orders: 0, newOrders: 0 });

  const loadStats = () => {
    Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]).then(([p, m, u, o, no]) => {
      setStats({
        products: p.count ?? 0,
        messages: m.count ?? 0,
        unread: u.count ?? 0,
        orders: o.count ?? 0,
        newOrders: no.count ?? 0,
      });
    });
  };

  useEffect(() => {
    loadStats();
    const handler = () => loadStats();
    window.addEventListener("orders:new", handler);
    return () => window.removeEventListener("orders:new", handler);
  }, []);


  const cards = [
    { label: "الطلبات", value: stats.orders, icon: "🛒", color: "bg-purple-500/10 text-purple-600" },
    { label: "طلبات جديدة", value: stats.newOrders, icon: "✨", color: "bg-pink-500/10 text-pink-600" },
    { label: "المنتجات", value: stats.products, icon: "📦", color: "bg-blue-500/10 text-blue-600" },
    { label: "الرسائل", value: stats.messages, icon: "💬", color: "bg-green-500/10 text-green-600" },
    { label: "غير مقروءة", value: stats.unread, icon: "🔔", color: "bg-orange-500/10 text-orange-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-6">
            <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${card.color}`}>{card.icon}</span>
            <div className="text-3xl font-bold text-foreground mb-1">{card.value}</div>
            <div className="text-sm text-muted-foreground">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Orders ───
function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "confirmed" | "shipped" | "delivered" | "cancelled">("all");

  async function load() {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("orders:new", handler);
    return () => window.removeEventListener("orders:new", handler);
  }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("orders").update({ status, is_read: true }).eq("id", id);
    load();
  }

  async function markRead(id: string) {
    await supabase.from("orders").update({ is_read: true }).eq("id", id);
    load();
  }

  async function remove(id: string) {
    if (!confirm("حذف هذا الطلب؟")) return;
    await supabase.from("orders").delete().eq("id", id);
    load();
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: "جديد", color: "bg-blue-500/10 text-blue-600" },
    confirmed: { label: "مؤكد", color: "bg-yellow-500/10 text-yellow-700" },
    shipped: { label: "تم الشحن", color: "bg-indigo-500/10 text-indigo-600" },
    delivered: { label: "تم التسليم", color: "bg-green-500/10 text-green-600" },
    cancelled: { label: "ملغي", color: "bg-red-500/10 text-red-600" },
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">الطلبات ({orders.length})</h1>
        <div className="flex gap-2 flex-wrap">
          {(["all", "new", "confirmed", "shipped", "delivered", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "الكل" : statusLabels[f].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-2xl">
          لا توجد طلبات
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const status = statusLabels[order.status] ?? statusLabels.new;
            return (
              <div
                key={order.id}
                className={`bg-card border rounded-2xl p-5 ${order.is_read ? "border-border" : "border-primary/40 bg-primary/5"}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-foreground">{order.product_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span>
                      {!order.is_read && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">جديد</span>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.product_price} د.م
                      {order.selected_age && ` · العمر: ${order.selected_age}`}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("ar-MA")}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-sm bg-muted/40 rounded-xl p-3 mb-3">
                  <div><span className="text-muted-foreground">الاسم: </span><span className="font-medium text-foreground">{order.customer_name}</span></div>
                  <div>
                    <span className="text-muted-foreground">الهاتف: </span>
                    <a href={`tel:${order.customer_phone}`} className="font-medium text-primary hover:underline">{order.customer_phone}</a>
                  </div>
                  <div className="sm:col-span-3"><span className="text-muted-foreground">العنوان: </span><span className="font-medium text-foreground">{order.customer_address}</span></div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground"
                  >
                    <option value="new">جديد</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <a
                    href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`مرحباً ${order.customer_name}، بخصوص طلبك: ${order.product_name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-700 font-medium text-sm hover:bg-green-500/20"
                  >
                    💬 WhatsApp
                  </a>
                  {!order.is_read && (
                    <button onClick={() => markRead(order.id)} className="px-3 py-1.5 rounded-lg bg-muted text-foreground font-medium text-sm hover:bg-muted/80">
                      ✓ تحديد كمقروء
                    </button>
                  )}
                  <button onClick={() => remove(order.id)} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive font-medium text-sm hover:bg-destructive/20">
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Products ───
const emptyProduct = {
  name: "", slug: "", description: "", price: 0, old_price: null as number | null,
  badge: "", image_url: "", is_active: true, sort_order: 0, ages: [] as string[],
};

function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  async function handleSave() {
    if (!editing) return;
    const { id, created_at, updated_at, ...rest } = editing as any;
    if (isNew) { await supabase.from("products").insert(rest); }
    else { await supabase.from("products").update(rest).eq("id", id); }
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
    const path = `${Date.now()}.${file.name.split(".").pop()}`;
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">صورة المنتج</label>
            {editing.image_url && <img src={editing.image_url} alt="" className="w-32 h-32 object-cover rounded-xl mb-2" />}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
            {uploading && <span className="text-sm text-muted-foreground mr-2">جاري الرفع...</span>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm text-foreground">منتج مفعّل</span>
          </label>
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
        <button onClick={() => { setEditing({ ...emptyProduct }); setIsNew(true); }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">+ إضافة منتج</button>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد منتجات بعد</div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              {p.image_url && <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />}
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

// ─── Messages ───
function MessagesPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMessages() {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadMessages(); }, []);

  async function toggleRead(msg: Message) {
    await supabase.from("contact_messages").update({ is_read: !msg.is_read }).eq("id", msg.id);
    loadMessages();
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذه الرسالة؟")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    loadMessages();
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">الرسائل ({messages.length})</h1>
      {messages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد رسائل بعد</div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-card border rounded-xl p-5 ${msg.is_read ? "border-border" : "border-primary/30 bg-primary/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground">{msg.name}</span>
                    {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-foreground/80 text-sm whitespace-pre-wrap">{msg.message}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(msg.created_at).toLocaleDateString("ar-MA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggleRead(msg)} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs">{msg.is_read ? "غير مقروءة" : "مقروءة"}</button>
                  <button onClick={() => handleDelete(msg.id)} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings ───
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

function SettingsPanel() {
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
      if (data) { await supabase.from("site_settings").update({ value }).eq("key", key); }
      else { await supabase.from("site_settings").insert({ key, value }); }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        {saved && <span className="text-sm font-medium text-primary">✓ تم الحفظ</span>}
      </div>
      <div className="space-y-6 max-w-2xl">
        <SettingsGroup title="محتوى الصفحة الرئيسية" icon="📝" fields={contentFields} settings={settings} onChange={handleChange} />
        <SettingsGroup title="معلومات التواصل" icon="📞" fields={contactFields} settings={settings} onChange={handleChange} />
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}

function SettingsGroup({ title, icon, fields, settings, onChange }: {
  title: string; icon: string; fields: { key: string; label: string; type: string; placeholder: string }[];
  settings: Record<string, string>; onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><span>{icon}</span> {title}</h2>
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
          {field.type === "textarea" ? (
            <textarea value={settings[field.key] ?? ""} onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder} rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none" />
          ) : (
            <input type={field.type} value={settings[field.key] ?? ""} onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Shared ───
function Field({ label, value, onChange, type = "text", textarea = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean;
}) {
  const cls = "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm";
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      {textarea ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} /> : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

// ─── Login ───
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("البريد الإلكتروني أو كلمة المرور غير صحيحة"); }
    else { onLogin(); }
    setLoading(false);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">🔐 لوحة الإدارة</h1>
          <p className="text-muted-foreground">سجل دخولك للمتابعة</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50">
            {loading ? "جاري التحميل..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
