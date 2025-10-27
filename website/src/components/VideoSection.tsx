import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef } from "react";

const VideoSection = () => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const content = {
    en: {
      title: "See Shiffy in Action",
      subtitle: "Watch how our AI-powered app transforms shift management",
      play: "Play Demo",
      pause: "Pause",
    },
    tr: {
      title: "Shiffy'yi İş Başında Görün",
      subtitle: "Yapay zeka destekli uygulamamızın vardiya yönetimini nasıl dönüştürdığünü izleyin",
      play: "Demoyu İzle",
      pause: "Duraklat",
    }
  };

  const t = content[language];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="section-padding bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative group animate-fade-in-up">
            {/* Glow effect background */}
            <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl group-hover:opacity-30 transition-smooth" />
            
            {/* Video container - Mobile optimized (9:16) */}
            <div className="relative mx-auto max-w-md">
              <div className="relative aspect-[9/16] bg-card rounded-3xl border-2 border-border shadow-2xl overflow-hidden">
                {/* Video */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onClick={togglePlay}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src="/videos/WhatsApp Video 2025-10-26 saat 12.36.17_c674fef0.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Play/Pause overlay */}
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-[2px] cursor-pointer transition-opacity hover:bg-black/50"
                    onClick={togglePlay}
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-smooth shadow-glow">
                      <Play className="w-10 h-10 text-white fill-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Video controls */}
                {isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-smooth"
                      >
                        <Pause className="w-6 h-6 text-white" />
                      </button>
                      
                      <button
                        onClick={toggleMute}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-smooth"
                      >
                        {isMuted ? (
                          <VolumeX className="w-6 h-6 text-white" />
                        ) : (
                          <Volume2 className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile phone frame effect */}
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-[2.5rem] -z-10 blur-xl opacity-60" />
              <div className="absolute -inset-1 bg-gradient-to-br from-border/50 to-border/30 rounded-[2rem] -z-10" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
