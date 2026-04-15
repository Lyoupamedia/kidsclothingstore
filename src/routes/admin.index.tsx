import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, messages: 0, unread: 0 });

  useEffect(() => {
    async function loadStats() {
      const [productsRes, messagesRes, unreadRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
      ]);
      setStats({
        products: productsRes.count ?? 0,
        messages: messagesRes.count ?? 0,
        unread: unreadRes.count ?? 0,
      });
    }
    loadStats();
  }, []);

  const cards = [
    { label: "المنتجات", value: stats.products, icon: "📦", color: "bg-blue-500/10 text-blue-600" },
    { label: "الرسائل", value: stats.messages, icon: "💬", color: "bg-green-500/10 text-green-600" },
    { label: "غير مقروءة", value: stats.unread, icon: "🔔", color: "bg-orange-500/10 text-orange-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${card.color}`}>
                {card.icon}
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{card.value}</div>
            <div className="text-sm text-muted-foreground">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
