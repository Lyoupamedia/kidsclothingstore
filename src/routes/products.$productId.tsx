import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Navbar } from "@/components/Navbar";
import { FooterSection } from "@/components/FooterSection";
import productRomper from "@/assets/product-romper.jpg";
import productDress from "@/assets/product-dress.jpg";
import productCasual from "@/assets/product-casual.jpg";
import productFashion from "@/assets/product-fashion.jpg";



const productsData: Record<string, {
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
  ages: string[];
}> = {
  "romper": {
    name: "رومبير قطني للرضع 💛",
    description: "قطن طبيعي 100% ناعم على بشرة طفلك، مثالي لجميع الفصول",
    price: 89,
    oldPrice: 149,
    discount: 40,
    image: productRomper,
    ages: ["من 0 الى 6 أشهر", "من 6 أشهر الى 12", "من 12 الى 18 شهر", "من 18 الى 24 شهر"],
  },
  "dress": {
    name: "فستان صيفي بناتي 💛",
    description: "تصميم أنيق بألوان زاهية، مريح للعب والخروجات",
    price: 99,
    oldPrice: 179,
    discount: 45,
    image: productDress,
    ages: ["من 3 سنوات الى 4", "من 5 سنوات الى 6", "من 6 سنوات الى 7", "من 8 سنوات الى 9"],
  },
  "casual": {
    name: "طقم كاجوال للأطفال 💛",
    description: "طقم عصري من قطعتين، مناسب للمدرسة والنزهات",
    price: 119,
    oldPrice: 199,
    discount: 40,
    image: productCasual,
    ages: ["من 3 سنوات الى 4", "من 5 سنوات الى 6", "من 6 سنوات الى 7", "من 8 سنوات الى 9", "من 10 سنوات الى 11"],
  },
  "fashion": {
    name: "طقم موضة أنيق 💛",
    description: "تشكيلة عصرية بخامات ممتازة تدوم طويلاً",
    price: 139,
    oldPrice: 219,
    discount: 35,
    image: productFashion,
    ages: ["من 3 سنوات الى 4", "من 5 سنوات الى 6", "من 6 سنوات الى 7", "من 8 سنوات الى 9", "من 10 سنوات الى 11"],
  },
};

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
  head: ({ params }) => {
    const product = productsData[params.productId];
    const title = product ? `${product.name} - KidsClothing` : "منتج - KidsClothing";
    const desc = product?.description || "ملابس أطفال بجودة عالية";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
});

function ProductPage() {
  const { productId } = Route.useParams();
  const product = productsData[productId];
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

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

  const handleOrder = () => {
    const message = encodeURIComponent(
      `مرحباً، أريد طلب:\n${product.name}\nالعمر: ${selectedAge || "غير محدد"}\nالاسم: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}`
    );
    window.open(`https://wa.me/212600000000?text=${message}`, "_blank");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Details - Left side */}
          <div className="order-2 md:order-1 space-y-6">
            {/* Title & Badge */}
            <div className="bg-card rounded-2xl border-2 border-dashed border-primary/30 p-6">
              <div className="flex items-start gap-3 flex-wrap">
                <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold shrink-0">
                  عرض خاص!
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
                  {product.name}
                </h1>
              </div>
              <p className="text-muted-foreground mt-2">{product.description}</p>
            </div>

            {/* Price */}
            <div className="bg-card rounded-2xl border-2 border-dashed border-border p-5 flex items-center justify-between">
              <span className="text-muted-foreground line-through text-lg">{product.oldPrice} د.م</span>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                  تخفيض {product.discount}%-
                </span>
                <span className="text-3xl font-bold text-foreground">{product.price} د.م</span>
              </div>
            </div>

            {/* Age Selector */}
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

            {/* Order Form */}
            <div className="bg-card rounded-2xl border-2 border-dashed border-border p-6 space-y-4">
              <h3 className="text-center font-bold text-foreground text-lg">
                لإتمام الطلب أدخل المعلومات التالية
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="الاسم الكامل - Nom complet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-1 w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                />
                <input
                  type="tel"
                  placeholder="الهاتف - Téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="col-span-1 w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>
              <input
                type="text"
                placeholder="العنوان - Address"
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
              اطلـــب الآن : التوصيل ب 10 دراهم فقط
            </button>
          </div>

          {/* Product Image - Right side */}
          <div className="order-1 md:order-2">
            <div className="sticky top-24 rounded-2xl overflow-hidden bg-card border border-border shadow-[var(--shadow-card)]">
              <img
                src={product.image}
                alt={product.name}
                width={800}
                height={800}
                className="w-full aspect-square object-cover"
              />
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
          اطلـــب الآن : التوصيل ب 10 دراهم فقط
        </button>
      </div>

      <FooterSection />
    </div>
  );
}
