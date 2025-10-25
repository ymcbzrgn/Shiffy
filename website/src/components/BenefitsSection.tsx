import { Clock, Users, Smartphone, TrendingUp, Shield, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BenefitsSection = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "The Shiffy Difference",
      subtitle: "Real results from businesses like yours",
      benefits: [
        {
          icon: Clock,
          stat: "90%",
          title: "Time Saved",
          description: "From 3 hours to 15 minutes per week on scheduling",
        },
        {
          icon: Users,
          stat: "95%",
          title: "Team Satisfaction",
          description: "Employees love having their preferences respected",
        },
        {
          icon: Shield,
          stat: "Zero",
          title: "Scheduling Conflicts",
          description: "AI prevents double-bookings and availability issues",
        },
        {
          icon: DollarSign,
          stat: "40%",
          title: "Lower Turnover",
          description: "Fair scheduling means happier, longer-staying staff",
        },
        {
          icon: Smartphone,
          stat: "100%",
          title: "Mobile Access",
          description: "Manage shifts anywhere, anytime from your phone",
        },
        {
          icon: TrendingUp,
          stat: "3x",
          title: "Faster Scheduling",
          description: "Publish next week's shifts in minutes, not hours",
        },
      ]
    },
    tr: {
      title: "Shiffy Farkı",
      subtitle: "Sizin gibi işletmelerden gerçek sonuçlar",
      benefits: [
        {
          icon: Clock,
          stat: "%90",
          title: "Zaman Tasarrufu",
          description: "Haftalık planlamada 3 saatten 15 dakikaya",
        },
        {
          icon: Users,
          stat: "%95",
          title: "Ekip Memnuniyeti",
          description: "Çalışanlar tercihlerine saygı duyulmasını seviyor",
        },
        {
          icon: Shield,
          stat: "Sıfır",
          title: "Planlama Çakışması",
          description: "Yapay zeka çift rezervasyon ve müsaitlik sorunlarını önlüyor",
        },
        {
          icon: DollarSign,
          stat: "%40",
          title: "Düşük Personel Kaybı",
          description: "Adil planlama, daha mutlu ve uzun süre kalan personel demek",
        },
        {
          icon: Smartphone,
          stat: "%100",
          title: "Mobil Erişim",
          description: "Vardiyalarınızı her yerden, her zaman telefonunuzdan yönetin",
        },
        {
          icon: TrendingUp,
          stat: "3x",
          title: "Daha Hızlı Planlama",
          description: "Gelecek haftanın vardiyalarını saatler değil, dakikalar içinde yayınlayın",
        },
      ]
    }
  };

  const t = content[language];
  const benefits = t.benefits;

  return (
    <section id="benefits" className="section-padding bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-2xl p-6 shadow-md hover:shadow-xl transition-smooth border border-border/50 hover:border-primary/30 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-smooth" />
              
              {/* Content */}
              <div className="relative">
                {/* Icon & Stat */}
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-primary shadow-md group-hover:scale-110 transition-bounce">
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gradient">{benefit.stat}</div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
