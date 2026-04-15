import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ProductsSection } from "@/components/ProductsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CountdownSection } from "@/components/CountdownSection";
import { FooterSection } from "@/components/FooterSection";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ZinaBaby - ملابس أطفال بجودة عالية وأسعار مناسبة" },
      { name: "description", content: "متجر ZinaBaby لملابس الأطفال - شحن مجاني لجميع أنحاء المملكة المغربية. اكتشف تشكيلتنا الحصرية بأسعار لا تقاوم." },
      { property: "og:title", content: "ZinaBaby - ملابس أطفال بجودة عالية" },
      { property: "og:description", content: "متجر متخصص في ملابس الأطفال بجودة عالية وأسعار مناسبة مع شحن مجاني" },
    ],
  }),
});

function Index() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ProductsSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}
