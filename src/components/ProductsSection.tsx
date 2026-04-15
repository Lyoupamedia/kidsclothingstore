import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useProducts } from "@/hooks/useProducts";

export function ProductsSection() {
  const { products, loading } = useProducts();

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

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border animate-pulse">
                <div className="aspect-square bg-muted rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-5 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Products grid */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <Link
                key={product.id}
                to="/products/$productId"
                params={{ productId: product.slug }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {product.badge}
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
                          👕
                        </div>
                      )}
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
                        {product.old_price && (
                          <span className="text-sm text-muted-foreground line-through">{product.old_price} د.م</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
