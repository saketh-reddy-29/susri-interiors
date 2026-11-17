import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { SERVICES } from '../data/studioData';
import { buildWhatsAppUrl, validateInquiryForm } from '../utils/roomConfigLogic';

interface ContactSectionProps {
  preselectedScope?: string;
  preselectedNote?: string;
}

const CONSULTATION_SLOTS = [
  '10:00 CET · Copenhagen Studio',
  '14:00 CET · Zurich Studio',
  '16:30 CET · Private Video Briefing',
];

export function ContactSection({ preselectedScope, preselectedNote }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState(preselectedScope || SERVICES[0].title);
  const [preferredDate, setPreferredDate] = useState('2026-12-03');
  const [consultationSlot, setConsultationSlot] = useState(CONSULTATION_SLOTS[0]);
  const [message, setMessage] = useState(preselectedNote || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    reference: string;
    name: string;
    email: string;
    projectType: string;
    date: string;
    slot: string;
  } | null>(null);

  useEffect(() => {
    if (preselectedScope) {
      setProjectType(preselectedScope);
    }
  }, [preselectedScope]);

  useEffect(() => {
    if (preselectedNote) {
      setMessage(preselectedNote);
    }
  }, [preselectedNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateInquiryForm({
      name,
      email,
      projectType,
      preferredDate,
      message,
    });

    if (!validation.valid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    setErrors({});
    setSubmittedReceipt({
      reference: `NH-${Math.floor(10000 + Math.random() * 89999)}`,
      name: name.trim(),
      email: email.trim(),
      projectType,
      date: preferredDate || 'Flexible',
      slot: consultationSlot,
    });
  };

  const whatsAppHref = buildWhatsAppUrl({ name, projectType, message });

  return (
    <section
      id="contact"
      className="scroll-mt-24 py-24 md:py-32 px-6 md:px-10 bg-[#1C1C1B] text-[#FAF9F6]"
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Consultation & Direct Channels */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-xs font-medium tracking-wider text-[#B7B0A4]">
              Private Consultation
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-[#FAF9F6] mt-3 text-balance">
              Begin your architectural dialogue.
            </h2>
            <p className="mt-4 text-sm md:text-base leading-relaxed text-[#C9C3B8]">
              Share your architectural plans, timeline, or spatial aspirations. Our principals review every residential and commercial brief within 24 hours.
            </p>
          </div>

          <div className="pt-6 border-t border-white/12 space-y-5 text-sm">
            <div>
              <p className="text-xs text-[#9C9589]">Direct WhatsApp Studio Concierge</p>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2.5 px-5 py-3 text-xs font-medium text-[#1C1C1B] bg-[#FAF9F6] rounded-lg hover:bg-[#EAE4DA] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp (+45 33 14 20 90)
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-xs text-[#9C9589]">Copenhagen Atelier</p>
                <p className="mt-1 text-sm text-[#FAF9F6]">Bredgade 45, 1260 København</p>
              </div>
              <div>
                <p className="text-xs text-[#9C9589]">Zurich Studio</p>
                <p className="mt-1 text-sm text-[#FAF9F6]">Seefeldstrasse 102, 8008 Zürich</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Project Inquiry & Consultation Booking Form */}
        <div className="lg:col-span-7 bg-[#FAF9F6] text-[#1C1C1B] rounded-2xl p-7 md:p-10">
          {submittedReceipt ? (
            <div
              role="status"
              aria-live="polite"
              className="py-6 space-y-5"
            >
              <div className="inline-flex items-center gap-2.5 text-[#1C1C1B]">
                <CheckCircle2 className="w-6 h-6 text-[#9A7B4F]" />
                <span className="font-mono-tabular text-xs text-[#64615B]">
                  Brief Reference {submittedReceipt.reference}
                </span>
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-medium">
                Consultation request confirmed.
              </h3>
              <p className="text-sm leading-relaxed text-[#4A4742]">
                Thank you, {submittedReceipt.name}. We have reserved a provisional{' '}
                <strong className="font-medium text-[#1C1C1B]">
                  {submittedReceipt.projectType}
                </strong>{' '}
                briefing for{' '}
                <span className="font-mono-tabular">{submittedReceipt.date}</span> (
                {submittedReceipt.slot}) and sent confirmation details to{' '}
                <span className="underline">{submittedReceipt.email}</span>.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReceipt(null);
                    setMessage('');
                  }}
                  className="px-5 py-2.5 text-xs font-medium text-[#FAF9F6] bg-[#1C1C1B] rounded-lg hover:bg-[#333230] cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-[#1C1C1B] border border-[#1C1C1B]/20 rounded-lg hover:bg-[#EAE4DA]/60"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Continue on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="inquiry-name" className="block text-xs font-medium text-[#1C1C1B]">
                    Full Name
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                    }}
                    placeholder="Soren Lindqvist"
                    className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-white border border-[#1C1C1B]/20 rounded-lg text-[#1C1C1B] focus:outline-2 focus:outline-[#1C1C1B]"
                  />
                  {errors.name && (
                    <p role="alert" className="mt-1 text-xs text-[#8B2E2E]">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="inquiry-email" className="block text-xs font-medium text-[#1C1C1B]">
                    Email Address
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                    }}
                    placeholder="client@residence.eu"
                    className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-white border border-[#1C1C1B]/20 rounded-lg text-[#1C1C1B] focus:outline-2 focus:outline-[#1C1C1B]"
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1 text-xs text-[#8B2E2E]">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="inquiry-scope" className="block text-xs font-medium text-[#1C1C1B]">
                    Project Scope
                  </label>
                  <select
                    id="inquiry-scope"
                    value={projectType}
                    onChange={(e) => {
                      setProjectType(e.target.value);
                      if (errors.projectType) setErrors((p) => ({ ...p, projectType: '' }));
                    }}
                    className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-white border border-[#1C1C1B]/20 rounded-lg text-[#1C1C1B] focus:outline-2 focus:outline-[#1C1C1B]"
                  >
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  {errors.projectType && (
                    <p role="alert" className="mt-1 text-xs text-[#8B2E2E]">
                      {errors.projectType}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="inquiry-date" className="block text-xs font-medium text-[#1C1C1B]">
                    Preferred Consultation Date
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="inquiry-date"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#1C1C1B]/20 rounded-lg text-[#1C1C1B] focus:outline-2 focus:outline-[#1C1C1B]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#1C1C1B] mb-2">
                  Consultation Session Format
                </span>
                <div className="flex flex-wrap gap-2">
                  {CONSULTATION_SLOTS.map((slot) => {
                    const active = consultationSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setConsultationSlot(slot)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#1C1C1B] text-[#FAF9F6] border-[#1C1C1B]'
                            : 'bg-white text-[#524F4A] border-[#1C1C1B]/16 hover:border-[#1C1C1B]/40'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="inquiry-message" className="block text-xs font-medium text-[#1C1C1B]">
                  Spatial Brief & Location
                </label>
                <textarea
                  id="inquiry-message"
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((p) => ({ ...p, message: '' }));
                  }}
                  placeholder="Tell us about your property location, approximate square meters, and target completion season..."
                  className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-white border border-[#1C1C1B]/20 rounded-lg text-[#1C1C1B] focus:outline-2 focus:outline-[#1C1C1B]"
                />
                {errors.message && (
                  <p role="alert" className="mt-1 text-xs text-[#8B2E2E]">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-medium text-[#FAF9F6] bg-[#1C1C1B] rounded-lg hover:bg-[#333230] transition-colors cursor-pointer"
              >
                Request Architectural Consultation
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
