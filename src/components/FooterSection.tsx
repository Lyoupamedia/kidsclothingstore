import { Link } from "@tanstack/react-router";

export function FooterSection() {
  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-primary">Kids</span>
              <span className="text-2xl font-bold text-background">Clothing</span>
            </div>
            <p className="text-background/60 mb-6 leading-relaxed">
              متجر متخصص في ملابس الأطفال بجودة عالية وأسعار مناسبة. شحن مجاني لجميع أنحاء المملكة.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-lg mb-4">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-background/60 hover:text-primary transition-colors">الصفحة الرئيسية</Link></li>
              <li><Link to="/products" className="text-background/60 hover:text-primary transition-colors">جميع المنتجات</Link></li>
              <li><Link to="/contact" className="text-background/60 hover:text-primary transition-colors">اتصل بنا</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-background/60">
              <li className="flex items-center gap-3">
                <span>📧</span>
                <span>contact@kidsclothing.shop</span>
              </li>
              <li className="flex items-center gap-3">
                <span>📱</span>
                <span dir="ltr">+212 672 492 366</span>
              </li>
              <li className="flex items-center gap-3">
                <span>📍</span>
                <span>المملكة المغربية</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 text-center text-background/40 text-sm">
          متجر ملابس الأطفال 2026 © - جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
