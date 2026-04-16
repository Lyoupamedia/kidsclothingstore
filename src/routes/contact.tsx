import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { FooterSection } from "@/components/FooterSection";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "اتصل بنا - KidsClothing" },
      { name: "description", content: "تواصل معنا للاستفسار عن منتجات ملابس الأطفال" },
      { property: "og:title", content: "اتصل بنا - KidsClothing" },
      { property: "og:description", content: "تواصل معنا للاستفسار عن منتجات ملابس الأطفال" },
    ],
  }),
});

const NAME_MAX = 100;
const PHONE_MAX = 30;
const MESSAGE_MAX = 1000;

function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; message?: string }>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function validate() {
    const newErrors: { name?: string; phone?: string; message?: string } = {};
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) newErrors.name = "الاسم مطلوب";
    else if (trimmedName.length > NAME_MAX) newErrors.name = `الاسم يجب أن يكون أقل من ${NAME_MAX} حرف`;

    if (!trimmedPhone) newErrors.phone = "رقم الواتساب مطلوب";
    else if (trimmedPhone.length > PHONE_MAX) newErrors.phone = `الرقم يجب أن يكون أقل من ${PHONE_MAX} حرف`;
    else if (!/^[0-9+\s-]{6,}$/.test(trimmedPhone)) newErrors.phone = "رقم غير صحيح";

    if (!trimmedMessage) newErrors.message = "الرسالة مطلوبة";
    else if (trimmedMessage.length > MESSAGE_MAX) newErrors.message = `الرسالة يجب أن تكون أقل من ${MESSAGE_MAX} حرف`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);

    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });

    setSending(false);

    if (error) {
      setErrors({ message: "حدث خطأ، يرجى المحاولة مرة أخرى" });
      return;
    }

    setSent(true);
    setName("");
    setPhone("");
    setMessage("");

    setTimeout(() => setSent(false), 5000);
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
              أرسل لنا رسالتك وسنرد عليك في أقرب وقت ممكن
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
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-center font-semibold">
                ✅ تم استلام رسالتك بنجاح، سنتواصل معك قريباً عبر الواتساب
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
              {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-semibold text-foreground">رقم الواتساب</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={PHONE_MAX}
                placeholder="مثال: 212600000000"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition text-right"
              />
              {errors.phone && <span className="text-sm text-destructive">{errors.phone}</span>}
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
              {errors.message && <span className="text-sm text-destructive">{errors.message}</span>}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? "جاري الإرسال..." : "إرسال الآن"}
            </button>
          </motion.form>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
