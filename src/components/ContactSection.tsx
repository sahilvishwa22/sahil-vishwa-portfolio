import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageSquare, Download, ArrowRight, Check, Send } from 'lucide-react';
import { PROFILE_INFO } from '../data/projects';

interface ContactSectionProps {
  selectedServices: string[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({ selectedServices }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const whatsappMessage = encodeURIComponent(
    `Hi Sahil, I came across your portfolio and I'm interested in discussing a project${
      selectedServices.length > 0 ? ` regarding ${selectedServices.join(', ')}` : ''
    }.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Project Inquiry - ${selectedServices.length > 0 ? selectedServices.join(', ') : '3D / Motion'}`
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInterested in: ${
        selectedServices.join(', ') || 'General Collaboration'
      }\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:${PROFILE_INFO.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative w-full max-w-7xl mx-auto px-6 py-20 sm:py-28 border-t border-white/[0.08] bg-[#090a0d] overflow-hidden select-none">
      


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative z-10">
        {/* Left Column: Contact Channels */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-3">
              Get in Touch
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight mb-6">
              Let's connect and discuss your next project.
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed mb-8">
              Available for 3D CGI projects, motion graphics, and creative collaborations. Feel free to reach out via WhatsApp or email.
            </p>

            {/* Direct Contact Links */}
            <div className="space-y-4 mb-8">
              {/* WhatsApp direct */}
              <a
                href={`https://wa.me/919892142797?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-[#111217]/90 border border-white/[0.08] hover:border-emerald-500/50 transition-colors flex items-center justify-between group cursor-pointer backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider block">
                      Quick Chat &bull; WhatsApp
                    </span>
                    <span className="text-base font-medium text-white">
                      +91 9892142797
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </a>

              {/* Email direct */}
              <a
                href={`mailto:${PROFILE_INFO.email}`}
                className="p-4 rounded-2xl bg-[#111217]/90 border border-white/[0.08] hover:border-white/20 transition-colors flex items-center justify-between group cursor-pointer backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 text-neutral-200 flex items-center justify-center border border-white/10">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider block">
                      Direct Email
                    </span>
                    <span className="text-base font-medium text-white">
                      {PROFILE_INFO.email}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </a>

              {/* Phone direct */}
              <a
                href={`tel:${PROFILE_INFO.phone}`}
                className="p-4 rounded-2xl bg-[#111217]/90 border border-white/[0.08] hover:border-white/20 transition-colors flex items-center justify-between group cursor-pointer backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 text-neutral-200 flex items-center justify-center border border-white/10">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider block">
                      Voice Call
                    </span>
                    <span className="text-base font-medium text-white">
                      {PROFILE_INFO.phone}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.08]">
            <a
              href={PROFILE_INFO.resumePath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Resume PDF</span>
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#111217]/90 rounded-3xl p-6 sm:p-10 border border-white/[0.08] shadow-2xl backdrop-blur-md">
            {selectedServices.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-[#090a0d] border border-white/10">
                <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono block mb-2">
                  Selected Services
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Your Name / Studio
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Studio / Alex Rivers"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#090a0d] border border-white/10 focus:outline-none focus:border-emerald-400 text-white placeholder-neutral-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#090a0d] border border-white/10 focus:outline-none focus:border-emerald-400 text-white placeholder-neutral-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Project Scope & Timeline
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about your brand, campaign goals, target deliverables, or deadline..."
                  className="w-full px-4 py-3.5 rounded-xl bg-[#090a0d] border border-white/10 focus:outline-none focus:border-emerald-400 text-white placeholder-neutral-500 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-emerald-500 text-black font-semibold text-sm tracking-wide hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>Send Project Brief</span>
                <Send className="w-4 h-4" />
              </button>

              {submitted && (
                <p className="text-xs text-center text-emerald-400 font-medium">
                  Opening your email client to send the project brief...
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
