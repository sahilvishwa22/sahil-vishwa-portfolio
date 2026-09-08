import React, { useState } from 'react';

interface NavbarProps {
  onContactClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onContactClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Showreel", href: "#showreel" },
    { label: "Works", href: "#works" },
    { label: "About Me", href: "#about" },
    { label: "Skills", href: "#skills" },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center bg-[#090a0d]/60 backdrop-blur-md border-b border-white/[0.06]">
        {/* Logo (Left side) */}
        <a href="#" className="flex flex-row items-center gap-2.5 group">
          <span className="font-funnel text-[20px] sm:text-[24px] tracking-tight text-white font-medium select-none">
            Sahil Vishwa
          </span>
          <span className="text-[22px] sm:text-[26px] text-emerald-400 select-none tracking-[-0.02em] font-medium leading-none mb-0.5 group-hover:rotate-45 transition-transform duration-300">
            &#10033;
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex flex-row items-center gap-7 lg:gap-10 text-[18px] lg:text-[20px] text-white/90">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="relative py-1 text-white/80 hover:text-emerald-300 transition-all duration-300 font-medium group hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100 shadow-[0_0_8px_rgba(52,211,153,1)] shrink-0" />
              <span className="group-hover:drop-shadow-[0_0_10px_rgba(52,211,153,0.4)] transition-all duration-300">{link.label}</span>
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </a>
          ))}
        </nav>

        {/* Hamburger button visible below md */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden z-50 p-2 flex flex-col justify-center items-center gap-[5px] w-10 h-10 focus:outline-none cursor-pointer"
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </header>

      {/* Full screen Mobile Navigation Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-30 bg-[#090a0d]/95 backdrop-blur-xl flex flex-col justify-center items-center px-8 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-7 text-center">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="text-3xl text-white font-medium hover:text-emerald-400 transition-colors flex items-center justify-center gap-3 group py-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100 shadow-[0_0_12px_rgba(52,211,153,1)] shrink-0" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
            </a>
          ))}
          <a
            href="/resume/Sahil_Vishwa_Resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-400 hover:text-white mt-4"
          >
            Download Resume (PDF)
          </a>
        </div>
      </div>
    </>
  );
};
