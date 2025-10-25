import { useState, useEffect } from "react";
import { Menu, X, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import shiffyLogo from "@/assets/shiffy-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = language === "en" 
    ? [
        { label: "Features", id: "features" },
        { label: "How It Works", id: "how-it-works" },
        { label: "Benefits", id: "benefits" },
        { label: "Contact", id: "contact" },
      ]
    : [
        { label: "Özellikler", id: "features" },
        { label: "Nasıl Çalışır", id: "how-it-works" },
        { label: "Avantajlar", id: "benefits" },
        { label: "İletişim", id: "contact" },
      ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/98 backdrop-blur-lg shadow-elegant border-b border-border/50"
          : "bg-gradient-to-b from-black/20 to-transparent"
      }`}
    >
      <nav className="container-custom px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 transition-smooth hover:scale-105"
          >
            <img src={shiffyLogo} alt="Shiffy Logo" className="h-12 w-12" />
            <span className={`text-2xl font-bold transition-smooth ${
              isScrolled ? "text-gradient" : "text-white"
            }`}>
              Shiffy
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`font-medium transition-smooth ${
                  isScrolled 
                    ? "text-foreground/80 hover:text-primary" 
                    : "text-white/90 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={toggleLanguage}
              className={`p-2 rounded-lg transition-smooth flex items-center gap-2 ${
                isScrolled
                  ? "text-foreground/80 hover:text-primary hover:bg-muted/50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Toggle language"
            >
              <Languages size={18} />
              <span className="text-sm font-medium">{language === "en" ? "TR" : "EN"}</span>
            </button>
            <Button
              onClick={() => scrollToSection("contact")}
              className="gradient-primary text-white btn-hero shadow-lg hover:shadow-xl"
            >
              {language === "en" ? "Request Demo" : "Demo Talep Et"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className={`p-2 rounded-lg transition-smooth ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
              aria-label="Toggle language"
            >
              <Languages size={20} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 ${isScrolled ? "text-foreground" : "text-white"}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in bg-background/95 backdrop-blur-lg rounded-b-2xl border-b border-border/50">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left py-3 px-2 text-foreground/80 hover:text-primary font-medium transition-smooth hover:bg-muted/50 rounded-lg"
              >
                {item.label}
              </button>
            ))}
            <Button
              onClick={() => scrollToSection("contact")}
              className="w-full mt-4 gradient-primary text-white shadow-lg"
            >
              {language === "en" ? "Request Demo" : "Demo Talep Et"}
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
