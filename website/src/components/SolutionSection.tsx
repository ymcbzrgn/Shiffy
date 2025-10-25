import { LayoutDashboard, Calendar, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ImageCarousel from "@/components/ImageCarousel";
import { managerScreenshots, employeeScreenshots } from "@/assets/screenshots";

const SolutionSection = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Meet Shiffy: Your AI Scheduling Assistant",
      subtitle: "Powerful features designed for both managers and employees",
      features: [
        {
          title: "For Managers",
          icon: LayoutDashboard,
          description: "Complete control with intelligent automation",
          points: [
            "Add employees with one click",
            "AI generates optimal schedules in seconds",
            "Approve or manually adjust with drag-and-drop",
            "Real-time conflict detection",
          ],
          imagePlaceholder: "Manager Dashboard",
        },
        {
          title: "For Employees",
          icon: Calendar,
          description: "Simple, intuitive shift preference submission",
          points: [
            "Submit availability via calendar grid",
            "Instant push notifications",
            "Track work hours and history",
            "Request shift swaps easily",
          ],
          imagePlaceholder: "Employee App",
        },
      ]
    },
    tr: {
      title: "Shiffy ile Tanışın: Yapay Zeka Planlama Asistanınız",
      subtitle: "Hem yöneticiler hem de çalışanlar için tasarlanmış güçlü özellikler",
      features: [
        {
          title: "Yöneticiler İçin",
          icon: LayoutDashboard,
          description: "Akıllı otomasyon ile tam kontrol",
          points: [
            "Tek tıkla çalışan ekleyin",
            "Yapay zeka saniyeler içinde optimal program oluşturur",
            "Sürükle-bırak ile onaylayın veya düzenleyin",
            "Gerçek zamanlı çakışma tespiti",
          ],
          imagePlaceholder: "Yönetici Paneli",
        },
        {
          title: "Çalışanlar İçin",
          icon: Calendar,
          description: "Basit, sezgisel vardiya tercihi gönderimi",
          points: [
            "Takvim üzerinden müsaitlik bildirin",
            "Anlık bildirimler alın",
            "Çalışma saatlerini takip edin",
            "Kolayca vardiya değişimi talep edin",
          ],
          imagePlaceholder: "Çalışan Uygulaması",
        },
      ]
    }
  };

  const t = content[language];
  const features = t.features;

  return (
    <section id="features" className="section-padding bg-background">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-6 shadow-glow">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-xl text-muted-foreground mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-4">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full gradient-primary flex-shrink-0 flex items-center justify-center mt-1">
                        <Clock className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-lg text-foreground/90">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Carousel */}
              <div className={index % 2 === 1 ? "md:order-1" : ""}>
                <ImageCarousel
                  images={index === 0 ? managerScreenshots : employeeScreenshots}
                  alt={feature.title}
                  placeholderText={feature.imagePlaceholder}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
