import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ProductsSection } from "@/components/ProductsSection";
import { FooterSection } from "@/components/FooterSection";

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "المنتجات - KidsClothing" },
      { name: "description", content: "تصفح جميع منتجات ملابس الأطفال بأسعار مناسبة وجودة عالية" },
      { property: "og:title", content: "المنتجات - KidsClothing" },
      { property: "og:description", content: "تصفح جميع منتجات ملابس الأطفال بأسعار مناسبة وجودة عالية" },
    ],
  }),
});

function ProductsPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <ProductsSection />
      <FooterSection />
    </div>
  );
}
