"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FiMail, FiPhone, FiMapPin,
  FiLinkedin, FiGithub,
  FiSend, FiCheckCircle,
  FiArrowUpRight,
} from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Scrub-based heading animation
      gsap.from(headingRef.current, {
        x: 120,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 90%",
          end: "top 50%",
          scrub: 1,
        },
      });

      gsap.from(infoRef.current, {
        x: -60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: infoRef.current,
          start: "top 85%",
        },
      });

      gsap.from(formRef.current, {
        x: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData(e.currentTarget);
    data.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY!);
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: data,
    });
    if (res.ok) setSubmitted(true);
    setLoading(false);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-24 lg:py-32 dot-grid overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Label */}
        <div className="mb-4">
          <span className="mono-tag px-3 py-1 section-label">
            07 / CONTACT
          </span>
        </div>

        {/* Large Heading */}
        <h2
          ref={headingRef}
          className="section-heading mb-14"
          style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)", lineHeight: 0.95 }}
        >
          LET&apos;S BUILD
          <br />
          <span className="text-accent2">SOMETHING.</span>
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div ref={infoRef} className="flex flex-col gap-8">
            <div>
              <span className="mono-tag text-black/40 flex items-center gap-1.5 mb-2">
                <FiMail size={11} /> EMAIL
              </span>
              <a
                href="mailto:aswinvg001@gmail.com"
                className="section-heading text-2xl md:text-3xl text-black hover:text-accent2 transition-colors underline decoration-4 underline-offset-4 decoration-accent"
                data-cursor-label="MAIL"
              >
                aswinvg001@gmail.com
              </a>
            </div>

            <div>
              <span className="mono-tag text-black/40 flex items-center gap-1.5 mb-2">
                <FiPhone size={11} /> PHONE
              </span>
              <a
                href="tel:+919074941551"
                className="font-display text-xl text-black hover:text-accent transition-colors"
              >
                +91 9074941551
              </a>
            </div>

            <div>
              <span className="mono-tag text-black/40 flex items-center gap-1.5 mb-2">
                <FiMapPin size={11} /> LOCATION
              </span>
              <p className="font-body text-lg text-black/70">Trivandrum, India</p>
            </div>

            <div>
              <span className="mono-tag text-black/40 block mb-3">SOCIALS</span>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://linkedin.com/in/aswin-venu-m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-5 py-3 bg-surface brutal-border brutal-shadow brutal-hover font-mono text-xs font-bold uppercase tracking-widest"
                  data-cursor-label="LI"
                >
                  <FiLinkedin size={14} />
                  LinkedIn
                  <FiArrowUpRight size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a
                  href="https://github.com/aswinvg001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-5 py-3 bg-surface brutal-border brutal-shadow brutal-hover font-mono text-xs font-bold uppercase tracking-widest"
                  data-cursor-label="GH"
                >
                  <FiGithub size={14} />
                  GitHub
                  <FiArrowUpRight size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          {submitted ? (
            <div className="brutal-border brutal-shadow bg-accent3 p-10 flex flex-col items-center justify-center text-center gap-4">
              <FiCheckCircle size={48} strokeWidth={1.5} />
              <h3 className="section-heading text-2xl">Message sent!</h3>
              <p className="font-body text-black/70">I&apos;ll get back to you as soon as possible.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="brutal-border brutal-shadow brutal-hover bg-surface px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest mt-2"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <label className="mono-tag text-black/50">NAME</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your name"
                  className="brutal-border bg-bg px-5 py-4 font-body text-base focus:outline-none focus:bg-accent/10 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mono-tag text-black/50">EMAIL</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  className="brutal-border bg-bg px-5 py-4 font-body text-base focus:outline-none focus:bg-accent/10 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mono-tag text-black/50">MESSAGE</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell me about your project..."
                  className="brutal-border bg-bg px-5 py-4 font-body text-base focus:outline-none focus:bg-accent/10 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="brutal-border brutal-shadow brutal-hover bg-accent px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest w-full text-[#0A0A0A] disabled:opacity-60 disabled:cursor-not-allowed"
                data-cursor-label="SEND"
              >
                {loading ? "Sending..." : <>Send Message <FiSend size={14} className="inline ml-1" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
