import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useProduct } from "@/hooks/useProducts";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Navbar } from "@/components/Navbar";
import { FooterSection } from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/products/$productId")({
  component: ProductPage,
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
        <Link to="/" className="text-primary hover:underline">العودة للرئيسية</Link>
      </div>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "منتج - KidsClothing" },
      { name: "description", content: "ملابس أطفال بجودة عالية" },
    ],
  }),
});

function ProductPage() {
  const { productId } = Route.useParams();
  const { product, loading } = useProduct(productId);
  const { settings } = useSiteSettings();
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded-2xl" />
              <div className="h-20 bg-muted rounded-2xl" />
              <div className="h-16 bg-muted rounded-2xl" />
            </div>
            <div className="aspect-square bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
          <Link to="/" className="text-primary hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const handleOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("يرجى إدخال الاسم والهاتف والعنوان");
      return;
    }
    // Save order to DB (best-effort, don't block WhatsApp)
    try {
      await supabase.from("orders").insert({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        selected_age: selectedAge,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim(),
      });
    } catch (e) {
      console.error("Failed to save order", e);
    }
    const message = encodeURIComponent(
      `مرحباً، أريد طلب:\n${product.name}\nالعمر: ${selectedAge || "غير محدد"}\nالاسم: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Details */}
          <div className="order-2 md:order-1 space-y-6">
            <div className="bg-card rounded-2xl border-2 border-dashed border-primary/30 p-6">
              <div className="flex items-start gap-3 flex-wrap">
                {product.badge && (
                  <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold shrink-0">
                    {product.badge}
                  </span>
                )}
                <h1 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
                  {product.name}
                </h1>
              </div>
              <p className="text-muted-foreground mt-2">{product.description}</p>
            </div>

            {/* Price */}
            <div className="bg-card rounded-2xl border-2 border-dashed border-border p-5 flex items-center justify-between">
              {product.old_price && (
                <span className="text-muted-foreground line-through text-lg">{product.old_price} د.م</span>
              )}
              <div className="flex items-center gap-3">
                {discount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    تخفيض {discount}%-
                  </span>
                )}
                <span className="text-3xl font-bold text-foreground">{product.price} د.م</span>
              </div>
            </div>

            {/* Age Selector */}
            {product.ages && product.ages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-center text-foreground">العمر</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {product.ages.map((age) => (
                    <button
                      key={age}
                      onClick={() => setSelectedAge(age)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedAge === age
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Order Form */}
            <div className="bg-card rounded-2xl border-2 border-dashed border-border p-6 space-y-4">
              <h3 className="text-center font-bold text-foreground text-lg">
                لإتمام الطلب أدخل المعلومات التالية
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-1 w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                />
                <input
                  type="tel"
                  placeholder="الهاتف"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="col-span-1 w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm text-right"
                />
              </div>
              <input
                type="text"
                placeholder="العنوان"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>

            {/* CTA Button */}
            <button
              onClick={handleOrder}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              أطلب الآن
            </button>
          </div>

          {/* Product Image */}
          <div className="order-1 md:order-2">
            <div className="sticky top-24 rounded-2xl overflow-hidden bg-card border border-border shadow-[var(--shadow-card)]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-8xl text-muted-foreground bg-muted">
                  👕
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden p-3 bg-background/80 backdrop-blur-lg border-t border-border z-50">
        <button
          onClick={handleOrder}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          أطلب الآن
        </button>
      </div>

      <FooterSection />
    </div>
  );
}
