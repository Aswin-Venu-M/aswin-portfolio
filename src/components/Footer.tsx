"use client";

import { FiArrowUp, FiGithub, FiLinkedin, FiDownload } from "react-icons/fi";
import { navLinks, socialLinks } from "@/data/navLinks";

export default function Footer() {
  return (
    <footer
      className="border-t-4 border-[#F0EBE0] text-[#F0EBE0]"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-8">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">

          {/* Col 1 — Identity */}
          <div className="flex flex-col gap-4">
            <h2
              className="section-heading text-4xl md:text-5xl text-[#F0EBE0] leading-none"
            >
              ASWIN<br />
              VENU{" "}
              <span className="text-accent2">M.</span>
            </h2>
            <p className="mono-tag text-[#F0EBE0]/50">
              Full-stack developer · Trivandrum, India
            </p>
            <div className="flex gap-3 mt-2">
              <a
                href={socialLinks.find((l) => l.label === "LinkedIn")!.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 flex items-center justify-center border-2 border-[#F0EBE0]/30 text-[#F0EBE0]/60 hover:border-accent hover:text-accent transition-colors brutal-hover"
              >
                <FiLinkedin size={16} aria-hidden="true" />
              </a>
              <a
                href={socialLinks.find((l) => l.label === "GitHub")!.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-10 h-10 flex items-center justify-center border-2 border-[#F0EBE0]/30 text-[#F0EBE0]/60 hover:border-accent hover:text-accent transition-colors brutal-hover"
              >
                <FiGithub size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Col 2 — Navigation */}
          <div className="flex flex-col gap-3">
            <span className="mono-tag text-accent mb-1">NAVIGATION</span>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="mono-tag text-[#F0EBE0]/60 hover:text-[#F0EBE0] transition-colors w-fit relative group"
              >
                <span className="absolute -left-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent">
                  ›
                </span>
                {link.label}
              </a>
            ))}
          </div>

          {/* Col 3 — Status + Resume */}
          <div className="flex flex-col gap-4">
            <span className="mono-tag text-accent mb-1">STATUS</span>
            <div className="inline-flex items-center gap-2 px-3 py-2 border-2 border-accent3 w-fit">
              <span className="w-2 h-2 rounded-full bg-accent3 animate-pulse" />
              <span className="mono-tag text-accent3">OPEN TO WORK</span>
            </div>
            <a
              href="/resume.pdf"
              download="Aswin_Venu_M_Resume.pdf"
              className="inline-flex items-center gap-2 mono-tag text-[#F0EBE0]/60 hover:text-[#F0EBE0] transition-colors group w-fit"
            >
              <FiDownload size={13} aria-hidden="true" />
              Download Resume
              <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                ↓
              </span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#F0EBE0]/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="mono-tag text-[#F0EBE0]/40">© {new Date().getFullYear()} Aswin Venu M</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#F0EBE0]/30 mono-tag text-[#F0EBE0]/60 hover:border-[#F0EBE0] hover:text-[#F0EBE0] transition-colors brutal-hover"
            aria-label="Back to top"
          >
            <FiArrowUp size={13} aria-hidden="true" />
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}
