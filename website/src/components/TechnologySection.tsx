import { useLanguage } from "@/contexts/LanguageContext";
import metaLogo from "@/assets/Shiffy (1).png";

const TechnologySection = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Powered by Cutting-Edge AI",
      subtitle: "Built with Meta's Llama AI for intelligent shift optimization and seamless mobile experience",
      badge: "🏆 Developed for Meta & YTU Llama Hackathon 2025"
    },
    tr: {
      title: "Son Teknoloji Yapay Zeka ile Güçlendirildi",
      subtitle: "Akıllı vardiya optimizasyonu ve kusursuz mobil deneyim için Meta'nın Llama yapay zekası ile geliştirildi",
      badge: "🏆 Meta & YTÜ Llama Hackathon 2025 için geliştirildi"
    }
  };

  const t = content[language];

  const technologies = [
    { name: "React Native", color: "from-blue-400 to-cyan-400" },
    { name: "Expo", color: "from-purple-400 to-pink-400" },
    { name: "Meta Llama", color: "from-orange-400 to-red-400" },
    { name: "Supabase", color: "from-green-400 to-teal-400" },
  ];

  return (
    <section className="section-padding gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.title}
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            {t.subtitle}
          </p>
        </div>

        {/* Tech stack badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`relative bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20 
                transition-smooth hover:scale-110 hover:bg-white/20 hover:shadow-2xl`}
              >
                <div className="flex items-center gap-2">
                  {tech.name === "Meta Llama" && (
                    <img src={metaLogo} alt="Meta Logo" className="w-6 h-6" />
                  )}
                  <div className="text-white font-semibold text-lg">{tech.name}</div>
                </div>
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${tech.color} opacity-0 group-hover:opacity-20 
                  rounded-2xl transition-smooth`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Hackathon badge */}
        <div className="text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20">
            <p className="text-white/90 text-sm md:text-base">
              {t.badge}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
