"use client";

import { FiArrowUp, FiGithub, FiLinkedin } from "react-icons/fi";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0 });
  };

  return (
    <footer className="bg-black text-bg py-8 border-t-4 border-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left */}
          <p className="mono-tag text-bg/50">
            © 2025 Aswin Venu M
          </p>

          {/* Center — Back to top */}
          <button
            onClick={scrollToTop}
            className="brutal-hover inline-flex items-center gap-2 px-6 py-3 border-2 border-bg font-mono text-xs font-bold uppercase tracking-widest text-bg hover:bg-bg hover:text-black transition-colors"
            aria-label="Back to top"
          >
            <FiArrowUp size={14} />
            Back to Top
          </button>

          {/* Right — socials + credit */}
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com/in/aswin-venu-m"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-bg/50 hover:text-accent transition-colors"
            >
              <FiLinkedin size={18} />
            </a>
            <a
              href="https://github.com/aswinvg001"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-bg/50 hover:text-accent transition-colors"
            >
              <FiGithub size={18} />
            </a>
            <span className="mono-tag text-bg/30">|</span>
            <p className="mono-tag text-bg/50">Built with ☕ &amp; Next.js</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
