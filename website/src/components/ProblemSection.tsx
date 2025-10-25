import { Clock, UserX, Frown, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ProblemSection = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "The Shift Scheduling Nightmare",
      subtitle: "Managing part-time staff shouldn't be this hard",
      problems: [
        {
          icon: Clock,
          title: "3+ Hours Weekly",
          stat: "Average time spent on manual scheduling",
          description: "Managers waste precious hours every week juggling spreadsheets and availability requests",
        },
        {
          icon: UserX,
          title: "40% Conflicts",
          stat: "Of shifts have availability issues",
          description: "Employee preferences ignored, leading to last-minute no-shows and constant rescheduling",
        },
        {
          icon: Frown,
          title: "60% Turnover",
          stat: "Higher in businesses with unfair scheduling",
          description: "Unfair shift distribution destroys team morale and increases costly employee turnover",
        },
      ]
    },
    tr: {
      title: "Vardiya Planlaması Kabusu",
      subtitle: "Part-time personel yönetimi bu kadar zor olmamalı",
      problems: [
        {
          icon: Clock,
          title: "Haftada 3+ Saat",
          stat: "Manuel planlamaya harcanan ortalama süre",
          description: "Yöneticiler her hafta Excel tabloları ve müsaitlik talepleriyle boğuşarak değerli saatler kaybediyor",
        },
        {
          icon: UserX,
          title: "%40 Çakışma",
          stat: "Vardiyalarda müsaitlik sorunu yaşanıyor",
          description: "Çalışan tercihleri göz ardı ediliyor, son dakika iptallerine ve sürekli yeniden planlamaya yol açıyor",
        },
        {
          icon: Frown,
          title: "%60 Daha Fazla",
          stat: "Adaletsiz planlamada personel kaybı",
          description: "Adil olmayan vardiya dağılımı ekip moralini yok ediyor ve maliyetli personel devir hızını artırıyor",
        },
      ]
    }
  };

  const t = content[language];
  const problems = t.problems;

  return (
    <section id="problem" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="relative group animate-fade-in-up bg-muted/30 backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/30 transition-smooth hover:shadow-lg"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 group-hover:scale-110 transition-bounce shadow-glow">
                <problem.icon className="w-8 h-8 text-white" />
              </div>

              {/* Title & Stat */}
              <div className="mb-4">
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  {problem.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  {problem.stat}
                </p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {problem.description}
              </p>

              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-smooth" />
            </div>
          ))}
        </div>

        {/* Bottom CTA hint */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">
              {language === "en" 
                ? "Sound familiar? There's a better way..." 
                : "Tanıdık geliyor mu? Daha iyi bir yol var..."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
