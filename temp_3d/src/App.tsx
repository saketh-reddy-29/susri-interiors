import { useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { RoomDesignerSection } from './components/RoomDesignerSection';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

export default function App() {
  const [inquiryScope, setInquiryScope] = useState<string | undefined>(undefined);
  const [inquiryNote, setInquiryNote] = useState<string | undefined>(undefined);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Support ?autostart=1 or ?section=designer deep linking for immediate 3D studio focus
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('section') === 'designer') {
      const target = document.getElementById('designer');
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
  }, []);

  const handleCommissionSimilar = (projectTitle: string) => {
    setInquiryScope('Residential Interiors');
    setInquiryNote(
      `Interested in commissioning a space inspired by "${projectTitle}". Looking for architectural material palette and 3D spatial planning.`
    );
    scrollToSection('contact');
  };

  const handleSelectServiceForInquiry = (serviceTitle: string) => {
    setInquiryScope(serviceTitle);
    scrollToSection('contact');
  };

  return (
    <div className="min-h-screen bg-[#F4F1EC] text-[#1C1C1B]">
      <Navbar onNavigate={scrollToSection} />

      <main>
        <HeroSection
          onExploreProjects={() => scrollToSection('projects')}
          onOpenDesigner={() => scrollToSection('designer')}
        />

        <ProjectsSection onCommissionSimilar={handleCommissionSimilar} />

        <RoomDesignerSection />

        <ServicesSection onSelectServiceForInquiry={handleSelectServiceForInquiry} />

        <AboutSection />

        <ContactSection
          preselectedScope={inquiryScope}
          preselectedNote={inquiryNote}
        />
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
}
