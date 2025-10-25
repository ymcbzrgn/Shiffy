import shiffyLogo from "@/assets/shiffy-logo.png";
import metaLogo from "@/assets/Shiffy (1).png";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { language } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const content = {
    en: {
      tagline: "AI-powered shift management for modern businesses. Smarter scheduling, happier teams.",
      quickLinks: "Quick Links",
      links: {
        features: "Features",
        howItWorks: "How It Works",
        benefits: "Benefits",
        contact: "Contact"
      },
      legal: "Legal",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      copyright: "© 2025 Shiffy - Team Golden Head | Built for Meta & YTU Llama Hackathon"
    },
    tr: {
      tagline: "Modern işletmeler için yapay zeka destekli vardiya yönetimi. Daha akıllı planlama, daha mutlu ekipler.",
      quickLinks: "Hızlı Bağlantılar",
      links: {
        features: "Özellikler",
        howItWorks: "Nasıl Çalışır",
        benefits: "Avantajlar",
        contact: "İletişim"
      },
      legal: "Yasal",
      privacy: "Gizlilik Politikası",
      terms: "Kullanım Koşulları",
      copyright: "© 2025 Shiffy - Team Golden Head | Meta & YTÜ Llama Hackathon için geliştirildi"
    }
  };

  const t = content[language];

  return (
    <footer className="bg-foreground text-background">
      <div className="container-custom px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          {/* Column 1: Logo & Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={shiffyLogo} alt="Shiffy Logo" className="h-12 w-12" />
              <span className="text-2xl font-bold">Shiffy</span>
            </div>
            <p className="text-background/80 leading-relaxed">
              {t.tagline}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t.quickLinks}</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-background/80 hover:text-background transition-smooth"
                >
                  {t.links.features}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-background/80 hover:text-background transition-smooth"
                >
                  {t.links.howItWorks}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("benefits")}
                  className="text-background/80 hover:text-background transition-smooth"
                >
                  {t.links.benefits}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-background/80 hover:text-background transition-smooth"
                >
                  {t.links.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t.legal}</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-smooth">
                  {t.privacy}
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-smooth">
                  {t.terms}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex items-center justify-center gap-2">
            <img src={metaLogo} alt="Meta Logo" className="w-5 h-5 opacity-70" />
            <p className="text-center text-background/70 text-sm">
              {t.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
