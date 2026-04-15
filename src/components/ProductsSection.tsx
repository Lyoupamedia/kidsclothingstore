import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import productsShowcase from "@/assets/products-showcase.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productDress from "@/assets/product-dress.jpg";
import productCasual from "@/assets/product-casual.jpg";
import productFashion from "@/assets/product-fashion.jpg";

const STORE_URL = "https://zinababy.shop";

const products = [
  {
    slug: "romper",
    name: "رومبير قطني للرضع",
    description: "قطن طبيعي 100% ناعم على بشرة طفلك، مثالي لجميع الفصول",
    price: "89",
    oldPrice: "149",
    image: productRomper,
    badge: "الأكثر مبيعاً",
  },
  {
    slug: "dress",
    name: "فستان صيفي بناتي",
    description: "تصميم أنيق بألوان زاهية، مريح للعب والخروجات",
    price: "99",
    oldPrice: "179",
    image: productDress,
    badge: "جديد",
  },
  {
    slug: "casual",
    name: "طقم كاجوال للأطفال",
    description: "طقم عصري من قطعتين، مناسب للمدرسة والنزهات",
    price: "119",
    oldPrice: "199",
    image: productCasual,
    badge: "عرض خاص",
  },
  {
    slug: "fashion",
    name: "طقم موضة أنيق",
    description: "تشكيلة عصرية بخامات ممتازة تدوم طويلاً",
    price: "139",
    oldPrice: "219",
    image: productFashion,
    badge: "حصري",
  },
];

export function ProductsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold mb-4">
            🔥 الأكثر طلباً
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            منتجاتنا الحصرية
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            اكتشف أحدث تشكيلاتنا بأسعار لا تقاوم
          </p>
        </motion.div>

        {/* Products grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => (
            <motion.a
              key={product.name}
              href={`${STORE_URL}/collections/all`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
                {/* Badge */}
                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {product.badge}
                </div>

                {/* Image */}
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-primary">{product.price} د.م</span>
                    <span className="text-sm text-muted-foreground line-through">{product.oldPrice} د.م</span>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Showcase banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <img
            src={productsShowcase}
            alt="تشكيلة ملابس أطفال"
            loading="lazy"
            width={1200}
            height={800}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-foreground/80 to-foreground/30 flex items-center">
            <div className="text-right p-8 md:p-12 mr-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
                العروض الجديدة
              </h3>
              <p className="text-primary-foreground/80 mb-6 max-w-sm">
                تخفيضات تصل إلى 50% على مجموعة مختارة
              </p>
              <a
                href={`${STORE_URL}/collections/all`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
              >
                استعراض المزيد
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
