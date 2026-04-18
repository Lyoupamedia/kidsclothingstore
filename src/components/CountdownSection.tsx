import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function useCountdown(targetMs: number | null, mode: "daily" | "fixed") {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: false });

  useEffect(() => {
    function getTimeLeft() {
      const now = new Date();
      let target: number;
      if (mode === "fixed" && targetMs) {
        target = targetMs;
      } else {
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        target = endOfDay.getTime();
      }
      const diff = target - now.getTime();
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
      }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        ended: false,
      };
    }
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [targetMs, mode]);

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
  const { settings } = useSiteSettings();

  const enabled = (settings.countdown_enabled ?? "true").toLowerCase() !== "false";
  const mode: "daily" | "fixed" = settings.countdown_mode === "fixed" ? "fixed" : "daily";
  const endAtRaw = settings.countdown_end_at;
  const targetMs = endAtRaw ? new Date(endAtRaw).getTime() : null;
  const validTarget = targetMs && !isNaN(targetMs) ? targetMs : null;

  const { days, hours, minutes, seconds, ended } = useCountdown(validTarget, mode);

  if (!enabled) return null;
  if (mode === "fixed" && ended) return null;

  const title = settings.countdown_title || "لا تفوّت الفرصة!";
  const subtitle = settings.countdown_subtitle || "تخفيضات حصرية تنتهي اليوم — استفد قبل فوات الأوان";
  const ctaText = settings.countdown_cta_text || "تسوق الآن قبل انتهاء العرض";

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-10 text-6xl">🔥</div>
        <div className="absolute bottom-4 left-10 text-5xl">⏰</div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
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
          {mode === "fixed" && days > 0 && (
            <>
              <TimeBox value={days} label="يوم" />
              <span className="text-primary-foreground text-3xl font-bold mb-4">:</span>
            </>
          )}
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
          {ctaText}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
      </div>
    </section>
  );
}
