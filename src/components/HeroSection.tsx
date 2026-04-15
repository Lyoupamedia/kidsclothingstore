import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import heroBaby from "@/assets/hero-baby.jpg";

export function HeroSection() {
  const { settings } = useSiteSettings();

  const heroTitle = settings.hero_title || "ملابس أطفال بجودة عالية وأسعار مناسبة";
  const heroSubtitle = settings.hero_subtitle || "اكتشف مجموعتنا الحصرية من ملابس الأطفال بأفضل الأسعار مع شحن مجاني لجميع أنحاء المملكة";
  const heroBadge = settings.hero_badge || "+5,000 عميل راضٍ عنا";
  const shippingText = settings.shipping_text || "شحن مجاني";

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--gradient-warm)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-right order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold mb-6">
              <span>⭐</span>
              <span>{heroBadge}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              {heroTitle}
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg md:mr-0 mx-auto">
              {heroSubtitle}
            </p>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl rotate-3" />
              <img
                src={heroBaby}
                alt="ملابس أطفال KidsClothing"
                width={1920}
                height={1080}
                className="relative rounded-3xl shadow-[var(--shadow-elevated)] w-full object-cover aspect-[16/10]"
              />
              <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground px-5 py-3 rounded-2xl shadow-[var(--shadow-card)] font-bold text-sm">
                🚚 {shippingText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
