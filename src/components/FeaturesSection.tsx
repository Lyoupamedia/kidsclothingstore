import { motion } from "framer-motion";

const features = [
  {
    icon: "🚚",
    title: "شحن مجاني",
    description: "توصيل مجاني لجميع أنحاء المملكة",
  },
  {
    icon: "💵",
    title: "الدفع عند الاستلام",
    description: "ادفع نقداً عند استلام طلبك",
  },
  {
    icon: "⚡",
    title: "تسليم سريع",
    description: "توصيل سريع خلال 24-48 ساعة",
  },
  {
    icon: "🛡️",
    title: "جودة مضمونة",
    description: "منتجات عالية الجودة بضمان كامل",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center p-6 rounded-2xl bg-background border border-border hover:shadow-[var(--shadow-soft)] transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
