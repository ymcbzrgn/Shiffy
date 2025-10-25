import { useState } from "react";
import { Mail, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const ContactSection = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    industry: "",
    message: "",
  });

  const content = {
    en: {
      title: "Ready to Transform Your Scheduling?",
      subtitle: "Get a personalized demo and see Shiffy in action",
      form: {
        businessName: "Business Name",
        contactName: "Your Name",
        email: "Email",
        phone: "Phone",
        industry: "Industry",
        message: "Tell us about your needs",
        selectPlaceholder: "Select your industry",
        industries: {
          cafe: "Cafe / Coffee Shop",
          restaurant: "Restaurant",
          retail: "Retail Store",
          other: "Other"
        },
        submit: "Request Demo",
        sending: "Sending..."
      },
      contact: {
        title: "Get in Touch",
        subtitle: "We'll respond within 24 hours to schedule your demo",
        email: "demo@shiffy.app"
      },
      validation: {
        missing: "Missing Information",
        missingDesc: "Please fill in all required fields",
        invalidEmail: "Invalid Email",
        invalidEmailDesc: "Please enter a valid email address"
      },
      success: {
        title: "Request Sent! 🎉",
        desc: "We'll get back to you within 24 hours"
      }
    },
    tr: {
      title: "Planlamanızı Dönüştürmeye Hazır mısınız?",
      subtitle: "Kişiselleştirilmiş demo alın ve Shiffy'yi iş başında görün",
      form: {
        businessName: "İşletme Adı",
        contactName: "Adınız",
        email: "E-posta",
        phone: "Telefon",
        industry: "Sektör",
        message: "İhtiyaçlarınızı anlatın",
        selectPlaceholder: "Sektörünüzü seçin",
        industries: {
          cafe: "Kafe / Kahve Dükkanı",
          restaurant: "Restoran",
          retail: "Perakende Mağaza",
          other: "Diğer"
        },
        submit: "Demo Talep Et",
        sending: "Gönderiliyor..."
      },
      contact: {
        title: "İletişime Geçin",
        subtitle: "Demonuzu planlamak için 24 saat içinde yanıt vereceğiz",
        email: "demo@shiffy.app"
      },
      validation: {
        missing: "Eksik Bilgi",
        missingDesc: "Lütfen tüm gerekli alanları doldurun",
        invalidEmail: "Geçersiz E-posta",
        invalidEmailDesc: "Lütfen geçerli bir e-posta adresi girin"
      },
      success: {
        title: "Talep Gönderildi! 🎉",
        desc: "24 saat içinde size geri döneceğiz"
      }
    }
  };

  const t = content[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessName || !formData.contactName || !formData.email || !formData.industry) {
      toast({
        title: t.validation.missing,
        description: t.validation.missingDesc,
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: t.validation.invalidEmail,
        description: t.validation.invalidEmailDesc,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Demo request submitted:", formData);
    
    toast({
      title: t.success.title,
      description: t.success.desc,
    });
    
    // Reset form
    setFormData({
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      industry: "",
      message: "",
    });
    
    setIsLoading(false);
  };

  return (
    <section id="contact" className="section-padding gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Form */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.form.businessName} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder={t.form.businessName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.form.contactName} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    placeholder={t.form.contactName}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.form.email} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@business.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.form.phone}</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+90 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.form.industry} <span className="text-destructive">*</span>
                </label>
                <Select
                  required
                  value={formData.industry}
                  onValueChange={(value) =>
                    setFormData({ ...formData, industry: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.form.selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cafe">{t.form.industries.cafe}</SelectItem>
                    <SelectItem value="restaurant">{t.form.industries.restaurant}</SelectItem>
                    <SelectItem value="retail">{t.form.industries.retail}</SelectItem>
                    <SelectItem value="other">{t.form.industries.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.form.message}
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder={t.form.message}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-primary text-white btn-hero"
                size="lg"
              >
                {isLoading ? t.form.sending : t.form.submit}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center text-white space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">{t.contact.title}</h3>
              <p className="text-white/90 text-lg mb-6">
                {t.contact.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:demo@shiffy.app"
                className="flex items-center gap-3 text-white/90 hover:text-white transition-smooth group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-smooth">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-lg">{t.contact.email}</span>
              </a>

              <div className="flex gap-4 mt-8">
                <a
                  href="#"
                  className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-smooth"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-smooth"
                  aria-label="Twitter"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
