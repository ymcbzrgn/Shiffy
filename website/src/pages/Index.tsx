import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import VideoSection from "@/components/VideoSection";
import TechnologySection from "@/components/TechnologySection";
import BenefitsSection from "@/components/BenefitsSection";
import TargetAudienceSection from "@/components/TargetAudienceSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <ProblemSection />
          <SolutionSection />
          <VideoSection />
          <HowItWorksSection />
          <TechnologySection />
          <BenefitsSection />
          <TargetAudienceSection />
          <ContactSection />
        </main>
        <Footer />
        <ChatBot />
      </div>
    </LanguageProvider>
  );
};

export default Index;
