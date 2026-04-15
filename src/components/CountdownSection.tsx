import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function getTimeLeft() {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-foreground/90 text-background font-bold text-2xl md:text-4xl w-14 h-14 md:w-18 md:h-18 rounded-xl flex items-center justify-center tabular-nums shadow-[var(--shadow-card)]">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-primary-foreground/70 text-xs mt-1.5 font-medium">{label}</span>
    </div>
  );
}

export function CountdownSection() {
  const { hours, minutes, seconds } = useCountdown();
  const { settings } = useSiteSettings();

  const title = settings.countdown_title || "لا تفوّت الفرصة!";
  const subtitle = settings.countdown_subtitle || "تخفيضات حصرية تنتهي اليوم — استفد قبل فوات الأوان";

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-10 text-6xl">🔥</div>
        <div className="absolute bottom-4 left-10 text-5xl">⏰</div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-background/20 text-primary-foreground text-sm font-bold mb-4">
            ⏳ عرض محدود
          </span>

          <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2">
            {title}
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            {subtitle}
          </p>

          <div className="flex items-center justify-center gap-3 md:gap-5 mb-8" dir="ltr">
            <TimeBox value={hours} label="ساعة" />
            <span className="text-primary-foreground text-3xl font-bold mb-4">:</span>
            <TimeBox value={minutes} label="دقيقة" />
            <span className="text-primary-foreground text-3xl font-bold mb-4">:</span>
            <TimeBox value={seconds} label="ثانية" />
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-background text-primary font-bold text-lg shadow-[var(--shadow-elevated)] hover:scale-105 transition-transform"
          >
            تسوق الآن قبل انتهاء العرض
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
