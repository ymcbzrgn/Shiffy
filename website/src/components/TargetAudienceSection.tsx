import { Coffee, Utensils, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TargetAudienceSection = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Built for Your Business",
      subtitle: "Perfect for any business with part-time workforce needs",
      audiences: [
        {
          icon: Coffee,
          title: "Cafes & Coffee Shops",
          description: "Manage baristas across morning, afternoon, and evening shifts with ease. Handle peak hours without scheduling stress.",
          features: ["Multiple shift types", "Rush hour coverage", "Part-time flexibility"]
        },
        {
          icon: Utensils,
          title: "Restaurants",
          description: "Coordinate kitchen and service staff seamlessly. Balance lunch and dinner shifts while respecting preferences.",
          features: ["Kitchen + FOH teams", "Split shift support", "Weekend optimization"]
        },
        {
          icon: ShoppingBag,
          title: "Retail Stores",
          description: "Optimize floor coverage for weekends and holidays. Ensure adequate staffing without overscheduling.",
          features: ["Peak day planning", "Holiday scheduling", "Sales associate rotation"]
        },
      ]
    },
    tr: {
      title: "İşletmeniz İçin Tasarlandı",
      subtitle: "Part-time personel ihtiyacı olan her işletme için mükemmel",
      audiences: [
        {
          icon: Coffee,
          title: "Kafeler ve Kahve Dükkanları",
          description: "Sabah, öğleden sonra ve akşam vardiyalarında baristalarınızı kolayca yönetin. Yoğun saatlerde planlama stresi olmadan çalışın.",
          features: ["Çoklu vardiya tipleri", "Yoğun saat kapsamı", "Part-time esneklik"]
        },
        {
          icon: Utensils,
          title: "Restoranlar",
          description: "Mutfak ve servis personelini sorunsuzca koordine edin. Öğle ve akşam vardiyalarını tercihlerine saygı göstererek dengeleyin.",
          features: ["Mutfak + Servis ekipleri", "Bölünmüş vardiya desteği", "Hafta sonu optimizasyonu"]
        },
        {
          icon: ShoppingBag,
          title: "Perakende Mağazalar",
          description: "Hafta sonları ve tatiller için zemin kapsamını optimize edin. Fazla planlama yapmadan yeterli personel sağlayın.",
          features: ["Yoğun gün planlaması", "Tatil planlaması", "Satış danışmanı rotasyonu"]
        },
      ]
    }
  };

  const t = content[language];
  const audiences = t.audiences;

  return (
    <section className="section-padding bg-gradient-to-br from-muted to-background">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative h-full bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-smooth card-hover border border-border">
                {/* Gradient background on hover */}
                <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 rounded-3xl transition-smooth" />

                {/* Icon */}
                <div className="relative mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-glow group-hover:scale-110 transition-bounce">
                    <audience.icon className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 relative">{audience.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-6 relative">
                  {audience.description}
                </p>

                {/* Features list */}
                <div className="relative space-y-2">
                  {audience.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
