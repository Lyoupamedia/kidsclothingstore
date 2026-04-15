import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["contact_messages"]["Row"];

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMessages() {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
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
            <div
              key={msg.id}
              className={`bg-card border rounded-xl p-5 ${msg.is_read ? "border-border" : "border-primary/30 bg-primary/5"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground">{msg.name}</span>
                    {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-foreground/80 text-sm whitespace-pre-wrap">{msg.message}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(msg.created_at).toLocaleDateString("ar-MA", {
                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleRead(msg)}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs"
                  >
                    {msg.is_read ? "غير مقروءة" : "مقروءة"}
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
