import React, { useState } from 'react';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FolioScrollSection } from './components/FolioScrollSection';
import { ShowreelSection } from './components/ShowreelSection';
import { WorksGallery } from './components/WorksGallery';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { VideoModal } from './components/VideoModal';
import { Project, ALL_PROJECTS } from './data/projects';

export function App() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  // Helper for Next/Prev in modal
  const handleNextProject = () => {
    if (!activeModalProject) return;
    const currentIndex = ALL_PROJECTS.findIndex(p => p.id === activeModalProject.id);
    const nextIndex = (currentIndex + 1) % ALL_PROJECTS.length;
    setActiveModalProject(ALL_PROJECTS[nextIndex]);
  };

  const handlePrevProject = () => {
    if (!activeModalProject) return;
    const currentIndex = ALL_PROJECTS.findIndex(p => p.id === activeModalProject.id);
    const prevIndex = (currentIndex - 1 + ALL_PROJECTS.length) % ALL_PROJECTS.length;
    setActiveModalProject(ALL_PROJECTS[prevIndex]);
  };

  const handleScrollToShowreel = () => {
    const showreel = document.querySelector('#showreel');
    if (showreel) {
      showreel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-[#090a0d] text-neutral-100 font-sans selection:bg-emerald-900/60 selection:text-emerald-300 antialiased overflow-x-hidden flex flex-col lg:block lg:min-h-screen">
      {/* 3D Viewport / Camera Reticle Custom Cursor */}
      <CustomCursor />

      {/* 4. Interactive Navbar */}
      <Navbar onContactClick={() => {
        const contact = document.querySelector('#contact');
        if (contact) contact.scrollIntoView({ behavior: 'smooth' });
      }} />

      {/* Hero Section (Includes 3. Background Video with Smooth Scrubbing, 6. Typewriter, 7. Subtitle, 8. Service Pills) */}
      <Hero 
        onServiceSelect={setSelectedServices}
        onOpenShowreel={handleScrollToShowreel}
      />

      {/* 3D Interactive Folio Book Scroll of Works (Coverflow Effect) */}
      <FolioScrollSection 
        onSelectProject={setActiveModalProject}
      />

      {/* Commercial 2026 Showreel Spotlight: Edit-Timline.mov in Auto-Play Loop */}
      <ShowreelSection />

      {/* The Vault: All 35 Works with Categories & Zero-Lag Hover Preview */}
      <WorksGallery 
        onSelectProject={setActiveModalProject}
      />

      {/* Creative Profile, Software Arsenal & Career Journey */}
      <AboutSection />

      {/* Studio Footer with Live Time */}
      <Footer />

      {/* Cinema Theatre Modal */}
      <VideoModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
        onNext={handleNextProject}
        onPrev={handlePrevProject}
        onSelectProject={setActiveModalProject}
      />
    </div>
  );
}

export default App;
