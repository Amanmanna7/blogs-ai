import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CoursesSection from '@/components/landing/CoursesSection';
import AIFeaturesSection from '@/components/landing/AIFeaturesSection';
import ComingSoonSection from '@/components/landing/ComingSoonSection';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 landing-bg floating-particles">
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <AIFeaturesSection />
      <ComingSoonSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
