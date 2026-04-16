import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useProduct } from "@/hooks/useProducts";

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
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
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
    if (!name.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      alert("يرجى إدخال الاسم والهاتف والمدينة والعنوان");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("orders").insert({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        selected_age: selectedAge,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        city: city.trim(),
        customer_address: address.trim(),
      });
      if (error) throw error;
      setSuccess(true);
      setName("");
      setPhone("");
      setCity("");
      setAddress("");
      setSelectedAge(null);
    } catch (e) {
      console.error("Failed to save order", e);
      alert("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setSubmitting(false);
    }
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
            <div className="bg-card rounded-2xl border-2 border-dashed border-border p-8 md:p-10 space-y-6">
              <h3 className="text-center font-bold text-foreground text-2xl">
                لإتمام الطلب أدخل المعلومات التالية
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-1 w-full px-6 py-6 rounded-2xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-lg"
                />
                <input
                  type="tel"
                  placeholder="الهاتف"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="col-span-1 w-full px-6 py-6 rounded-2xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-lg text-right"
                />
              </div>
              <input
                type="text"
                placeholder="المدينة"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-6 py-6 rounded-2xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-lg"
              />
              <input
                type="text"
                placeholder="العنوان"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-6 py-6 rounded-2xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-lg"
              />
            </div>

            {/* CTA Button */}
            {success ? (
              <div className="w-full py-4 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 font-bold text-center border-2 border-green-500/30">
                ✓ تم استلام طلبك بنجاح، سنتواصل معك قريباً
              </div>
            ) : (
              <button
                onClick={handleOrder}
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {submitting ? "جاري الإرسال..." : "أطلب الآن"}
              </button>
            )}
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
      {!success && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden p-3 bg-background/80 backdrop-blur-lg border-t border-border z-50">
          <button
            onClick={handleOrder}
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {submitting ? "جاري الإرسال..." : "أطلب الآن"}
          </button>
        </div>
      )}

      <FooterSection />
    </div>
  );
}
