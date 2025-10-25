import { Calendar, Brain, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorksSection = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Simple 3-Step Process",
      subtitle: "From employee preferences to published schedules in minutes",
      steps: [
        {
          number: "01",
          icon: Calendar,
          title: "Employees Submit Preferences",
          description: "Team members easily input their availability through an intuitive calendar interface",
        },
        {
          number: "02",
          icon: Brain,
          title: "AI Generates Schedule",
          description: "Meta's Llama AI analyzes preferences and creates optimized, fair shift assignments in seconds",
        },
        {
          number: "03",
          icon: CheckCircle,
          title: "Manager Approves & Publishes",
          description: "Review AI suggestions, make final adjustments if needed, and publish to your team instantly",
        },
      ]
    },
    tr: {
      title: "Basit 3 Adımlı Süreç",
      subtitle: "Çalışan tercihlerinden yayınlanmış programlara dakikalar içinde",
      steps: [
        {
          number: "01",
          icon: Calendar,
          title: "Çalışanlar Tercih Gönderir",
          description: "Ekip üyeleri sezgisel takvim arayüzü üzerinden müsaitlik durumlarını kolayca girer",
        },
        {
          number: "02",
          icon: Brain,
          title: "Yapay Zeka Program Oluşturur",
          description: "Meta'nın Llama yapay zekası tercihleri analiz eder ve saniyeler içinde optimize edilmiş, adil vardiya atamaları oluşturur",
        },
        {
          number: "03",
          icon: CheckCircle,
          title: "Yönetici Onaylar ve Yayınlar",
          description: "Yapay zeka önerilerini inceleyin, gerekirse son ayarlamaları yapın ve ekibinize anında yayınlayın",
        },
      ]
    }
  };

  const t = content[language];
  const steps = t.steps;

  return (
    <section id="how-it-works" className="section-padding bg-gradient-to-br from-muted to-background">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="relative">
          {/* Timeline line - desktop only */}
          <div className="hidden lg:block absolute left-0 right-0 h-1 gradient-primary" style={{ top: "140px" }} />

          <div className="grid lg:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Card */}
                <div className="relative bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-smooth card-hover border border-border/50">
                  {/* Step number - top right corner */}
                  <div className="absolute -top-4 -right-4 lg:top-4 lg:right-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-6 shadow-glow">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
