import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Navbar } from "@/components/Navbar";
import { FooterSection } from "@/components/FooterSection";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "اتصل بنا - KidsClothing" },
      { name: "description", content: "تواصل معنا عبر واتساب للاستفسار عن منتجات ملابس الأطفال" },
      { property: "og:title", content: "اتصل بنا - KidsClothing" },
      { property: "og:description", content: "تواصل معنا عبر واتساب للاستفسار عن منتجات ملابس الأطفال" },
    ],
  }),
});

const NAME_MAX = 100;
const MESSAGE_MAX = 1000;

function ContactPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { settings } = useSiteSettings();

  const whatsappNumber = settings.whatsapp_number || "212672492366";

  function validate() {
    const newErrors: { name?: string; message?: string } = {};
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) newErrors.name = "الاسم مطلوب";
    else if (trimmedName.length > NAME_MAX) newErrors.name = `الاسم يجب أن يكون أقل من ${NAME_MAX} حرف`;

    if (!trimmedMessage) newErrors.message = "الرسالة مطلوبة";
    else if (trimmedMessage.length > MESSAGE_MAX) newErrors.message = `الرسالة يجب أن تكون أقل من ${MESSAGE_MAX} حرف`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);

    // Save to database
    await supabase.from("contact_messages").insert({
      name: name.trim(),
      message: message.trim(),
    });

    setSending(false);
    setSent(true);

    // Also open WhatsApp
    const text = encodeURIComponent(`مرحباً، أنا ${name.trim()}\n\n${message.trim()}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");

    // Reset form after a delay
    setTimeout(() => {
      setName("");
      setMessage("");
      setSent(false);
    }, 3000);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 md:py-24">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold mb-4">
              💬 تواصل معنا
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              نحن هنا لمساعدتك
            </h1>
            <p className="text-muted-foreground text-lg">
              أرسل لنا رسالتك وسنرد عليك عبر واتساب في أقرب وقت
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] flex flex-col gap-5"
          >
            {sent && (
              <div className="p-4 rounded-xl bg-green-50 text-green-700 text-center font-semibold">
                ✅ تم إرسال رسالتك بنجاح!
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">الاسم</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX}
                placeholder="أدخل اسمك"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
              {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-semibold text-foreground">الرسالة</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MESSAGE_MAX}
                rows={5}
                placeholder="اكتب رسالتك هنا..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
              />
              {errors.message && <span className="text-sm text-red-500">{errors.message}</span>}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {sending ? "جاري الإرسال..." : "إرسال عبر واتساب"}
            </button>
          </motion.form>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
