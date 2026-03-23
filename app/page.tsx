import Nav from "@/components/Nav";
import Hero from "@/components/landing/Hero";
import SocialProofBar from "@/components/landing/SocialProofBar";
import ProblemStatement from "@/components/landing/ProblemStatement";
import RateRevealDemo from "@/components/landing/RateRevealDemo";
import UniqueFeatures from "@/components/landing/UniqueFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import DemoSection from "@/components/landing/DemoSection";
import CompetitorGrid from "@/components/landing/CompetitorGrid";
import StatsSection from "@/components/landing/StatsSection";
import PricingPreview from "@/components/landing/PricingPreview";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "DealWise",
      url: "https://dealwise.app",
      description:
        "AI-powered freelance contract analysis. Upload any contract to see your real effective hourly rate, detect 30+ red flags, and get a sign/negotiate/walk recommendation in 30 seconds.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "5 free credits on signup. No credit card required.",
      },
      featureList: [
        "Effective hourly rate calculator",
        "30+ red flag pattern detection",
        "Sign/Negotiate/Walk Away recommendation",
        "What-If Simulator",
        "Negotiation email generator",
        "AI contract chat",
        "Multi-country legal context (US, India, UK, EU, Australia, Canada)",
        "PDF, DOCX, and text file support",
      ],
    },
    {
      "@type": "Organization",
      name: "DealWise",
      url: "https://dealwise.app",
      description:
        "AI-powered contract analysis platform helping freelancers understand their true earning potential.",
      foundingDate: "2025",
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-dvh bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Nav />
      <Hero />
      <SocialProofBar />
      <ProblemStatement />
      <RateRevealDemo />
      <UniqueFeatures />
      <HowItWorks />
      <DemoSection />
      <CompetitorGrid />
      <StatsSection />
      <PricingPreview />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
