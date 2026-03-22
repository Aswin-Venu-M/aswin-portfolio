"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const certifications = [
  { title: "Python Django Full Stack with React", issuer: "Luminar Technolab, Kochi", color: "#FFD93D" },
  { title: "Foundations of UX Design", issuer: "Google / Coursera", color: "#FF6B6B" },
  { title: "Responsive Web Design", issuer: "freeCodeCamp", color: "#6BCB77" },
  { title: "Introduction to Front-End Development", issuer: "Meta / Coursera", color: "#FFD93D" },
  { title: "Introduction to Git and GitHub", issuer: "Google / Coursera", color: "#FF6B6B" },
  { title: "Using Python with the OS", issuer: "Google / Coursera", color: "#6BCB77" },
];

export default function Education() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const eduCardRef = useRef<HTMLDivElement>(null);
  const certsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        x: -80,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
        },
      });

      gsap.from(eduCardRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: eduCardRef.current,
          start: "top 85%",
        },
      });

      const cards = certsRef.current?.querySelectorAll(".cert-card");
      gsap.from(cards ? Array.from(cards) : [], {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: certsRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="education"
      className="py-24 lg:py-32 bg-bg"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Label */}
        <div className="mb-4">
          <span className="mono-tag px-3 py-1 bg-black text-accent">
            06 / EDUCATION & CERTS
          </span>
        </div>

        <h2
          ref={headingRef}
          className="section-heading text-5xl md:text-7xl mb-12 relative inline-block"
        >
          LEARNING & GROWTH
          <span className="absolute -bottom-1 left-0 w-full h-3 bg-accent -z-10" />
        </h2>

        {/* University Card */}
        <div ref={eduCardRef} className="mb-10">
          <div
            className="brutal-border brutal-shadow bg-accent p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
            data-cursor-card
          >
            <div>
              <span className="mono-tag text-black/50 block mb-2">B.Tech</span>
              <h3 className="section-heading text-2xl md:text-3xl mb-1">
                APJ Abdul Kalam Technological University
              </h3>
              <p className="font-body text-black/70 text-base">
                Electrical and Electronics Engineering
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="mono-tag font-bold">2019 – 2023</span>
              <span className="mono-tag text-black/50">Trivandrum, India</span>
            </div>
          </div>
        </div>

        {/* Certifications grid */}
        <div className="mb-4">
          <span className="mono-tag text-black/50 tracking-widest">CERTIFICATIONS</span>
        </div>

        <div
          ref={certsRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {certifications.map((cert, i) => (
            <div
              key={i}
              className="cert-card brutal-border brutal-shadow brutal-hover bg-bg p-5 flex flex-col gap-2"
              data-cursor-card
            >
              <div
                className="w-8 h-1.5 mb-1"
                style={{ backgroundColor: cert.color }}
              />
              <p className="font-body font-semibold text-sm leading-snug text-black">
                {cert.title}
              </p>
              <span className="mono-tag text-black/40 text-xs mt-auto pt-2">
                {cert.issuer}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
