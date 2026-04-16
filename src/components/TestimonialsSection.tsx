const testimonials = [
  {
    name: "فاطمة الزهراء",
    text: "ملابس رائعة وجودة ممتازة! وصل الطلب بسرعة. شكراً KidsClothing",
    rating: 5,
    city: "الدار البيضاء",
  },
  {
    name: "أمينة بنعلي",
    text: "أحسن متجر لملابس الأطفال في المغرب. الأسعار معقولة والقماش ناعم جداً",
    rating: 5,
    city: "الرباط",
  },
  {
    name: "سناء المراكشي",
    text: "طلبت لبنتي فستان وكان أجمل من الصورة! خدمة عملاء ممتازة",
    rating: 5,
    city: "مراكش",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold mb-4">
            💬 آراء عملائنا
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ماذا يقول عملاؤنا؟
          </h2>
          <p className="text-muted-foreground text-lg">+5,000 عميل سعيد بتجربتهم معنا</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-6 rounded-2xl bg-background border border-border"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-accent text-lg">⭐</span>
                ))}
              </div>
              <p className="text-foreground mb-4 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
