"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiMenu } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { label: "Work", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Slide down on page load
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.1,
      });

      // Scroll-aware border activation
      ScrollTrigger.create({
        start: "top+=50 top",
        onEnter: () => {
          gsap.to(navRef.current, {
            borderBottomWidth: "4px",
            duration: 0.3,
          });
        },
        onLeaveBack: () => {
          gsap.to(navRef.current, {
            borderBottomWidth: "0px",
            duration: 0.3,
          });
        },
      });

      // Nav link underline animations
      const links = linksRef.current?.querySelectorAll("a");
      links?.forEach((link) => {
        const underline = link.querySelector(".link-underline") as HTMLElement;
        if (!underline) return;
        link.addEventListener("mouseenter", () => {
          gsap.to(underline, { scaleX: 1, duration: 0.25, ease: "power2.out" });
        });
        link.addEventListener("mouseleave", () => {
          gsap.to(underline, { scaleX: 0, duration: 0.2, ease: "power2.in" });
        });
      });
    }, navRef);

    // ── Scroll progress bar ──────────────────────────
    const progressBar = progressRef.current;

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      if (max <= 0 || !progressBar) return;
      progressBar.style.width = `${Math.min((window.scrollY / max) * 100, 100)}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Active section nav highlight ─────────────────
    const navSectionIds = ["projects", "about", "skills", "contact"];
    let activeId: string | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible intersecting section from this batch
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          const best = intersecting.reduce((a, b) =>
            a.intersectionRatio >= b.intersectionRatio ? a : b
          );
          const id = best.target.getAttribute("id")!;
          if (id !== activeId) {
            // Deactivate previous
            if (activeId) {
              const prev = linksRef.current?.querySelector(
                `a[href="#${activeId}"]`
              ) as HTMLElement | null;
              prev?.classList.remove("nav-link-active");
            }
            // Activate new
            const link = linksRef.current?.querySelector(
              `a[href="#${id}"]`
            ) as HTMLElement | null;
            link?.classList.add("nav-link-active");
            activeId = id;
          }
        } else {
          // All observed entries left the viewport — clear active state
          entries.forEach((entry) => {
            const id = entry.target.getAttribute("id")!;
            if (activeId === id) {
              const link = linksRef.current?.querySelector(
                `a[href="#${id}"]`
              ) as HTMLElement | null;
              link?.classList.remove("nav-link-active");
              activeId = null;
            }
          });
        }
      },
      { threshold: 0.3 }
    );

    navSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-bg border-black border-b-0"
      style={{ borderBottomStyle: "solid", borderBottomColor: "#0A0A0A" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          ref={logoRef}
          href="#"
          className="font-mono text-sm font-bold tracking-wider text-black hover:text-accent transition-colors"
          style={{ letterSpacing: "0.1em" }}
        >
          [ASWIN_VENU]
        </a>

        {/* Nav Links */}
        <div ref={linksRef} className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative px-4 py-2 font-mono text-xs font-semibold tracking-widest uppercase text-black brutal-border brutal-shadow brutal-hover bg-surface hover:bg-accent hover:text-[#0A0A0A] transition-colors"
            >
              <span className="link-underline absolute bottom-0 left-0 h-0.5 w-full bg-black origin-left scale-x-0" />
              {link.label}
            </a>
          ))}
        </div>

        {/* Theme toggle + Mobile hamburger */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="md:hidden cursor-pointer p-2" aria-label="Open menu">
            <FiMenu size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      {/* Scroll progress bar */}
      <div
        id="scroll-progress"
        ref={progressRef}
        className="absolute bottom-0 left-0 h-3 brutal-border brutal-shadow-sm"
        style={{
          width: "0%",
          backgroundColor: "var(--accent)",
          willChange: "width",
          transition: "width 0.1s linear",
          boxSizing: "border-box",
        }}
      />
    </nav>
  );
}
