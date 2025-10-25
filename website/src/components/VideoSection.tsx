import { Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const VideoSection = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "See Shiffy in Action",
      subtitle: "Watch how our app makes shift management effortless",
      placeholder: "Demo Video Placeholder",
      note: "(Video will be embedded here)"
    },
    tr: {
      title: "Shiffy'yi İş Başında Görün",
      subtitle: "Uygulamamızın vardiya yönetimini nasıl kolaylaştırdığını izleyin",
      placeholder: "Demo Video Yer Tutucu",
      note: "(Video buraya yerleştirilecek)"
    }
  };

  const t = content[language];

  return (
    <section className="section-padding bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative group animate-fade-in-up">
            <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl group-hover:opacity-30 transition-smooth" />
            
            {/* Video placeholder */}
            <div className="relative aspect-video bg-card rounded-3xl border-2 border-border shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
                <div className="w-24 h-24 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-smooth shadow-glow">
                  <Play className="w-12 h-12 text-primary fill-primary" />
                </div>
                <p className="text-center text-muted-foreground font-medium text-lg mb-2">
                  {t.placeholder}
                </p>
                <p className="text-center text-muted-foreground/60 text-sm">
                  {t.note}
                </p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
