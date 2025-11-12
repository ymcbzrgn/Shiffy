import { ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import shiffyLogo from "@/assets/shiffy-logo.png";
import metaLogo from "@/assets/Shiffy (1).png";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { language } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const content = {
    en: {
      badge: "Powered by Meta Llama AI",
      title1: "AI-powered Shift Planning System",
      title2: "",
      subtitle: "Transform chaos into order. AI-powered shift management that saves hours, reduces conflicts, and keeps your team happy.",
      demo: "Get Started Free",
      learn: "See How It Works",
      stats: {
        time: "90% Time Saved",
        satisfaction: "Happier Teams",
        conflicts: "Zero Conflicts"
      }
    },
    tr: {
      badge: "Meta Llama Yapay Zeka Destekli",
      title1: "Yapay zeka destekli Vardiya planlama sistemi",
      title2: "",
      subtitle: "Kaosu düzene çevirin. Saatler kazandıran, çakışmaları önleyen ve ekibinizi mutlu eden yapay zeka destekli vardiya yönetimi.",
      demo: "Ücretsiz Başla",
      learn: "Nasıl Çalışır?",
      stats: {
        time: "%90 Zaman Tasarrufu",
        satisfaction: "Mutlu Ekipler",
        conflicts: "Sıfır Çakışma"
      }
    }
  };

  const t = content[language];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom px-4 text-center">
        <div className="animate-fade-in">
          {/* AI Badge */}
          <a 
            href="https://ai.meta.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6 hover:bg-white/20 hover:border-white/30 transition-smooth cursor-pointer"
          >
            <img src={metaLogo} alt="Meta Logo" className="w-5 h-5" />
            <span className="text-white/90 text-sm font-medium">{t.badge}</span>
          </a>

          {/* Logo */}