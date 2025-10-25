import { MessageCircle, X } from "lucide-react";
import shiffyCharacter from "@/assets/Shiffy (4).png";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

const ChatButton = ({ isOpen, onClick, unreadCount = 0 }: ChatButtonProps) => {
  const { language } = useLanguage();

  const tooltipText = {
    en: "Let's talk, Shiffy AI!",
    tr: "Hadi konuşalım, Shiffy AI!"
  };

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ${
        isOpen ? "scale-0" : "scale-100"
      }`}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {/* Main button */}
      <div className="relative">
        {/* Shiffy Character - NO BACKGROUND */}
        <img 
          src={shiffyCharacter} 
          alt="Shiffy AI" 
          className="w-20 h-20 object-contain drop-shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer"
        />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
            {unreadCount}
          </div>
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
          {tooltipText[language]} ✨
        </div>
      </div>
    </button>
  );
};

export default ChatButton;
