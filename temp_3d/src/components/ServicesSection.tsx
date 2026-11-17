import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SERVICES } from '../data/studioData';

interface ServicesSectionProps {
  onSelectServiceForInquiry: (serviceTitle: string) => void;
}

export function ServicesSection({ onSelectServiceForInquiry }: ServicesSectionProps) {
  const [activeServiceId, setActiveServiceId] = useState<string>(SERVICES[0].id);
  const activeService = SERVICES.find((s) => s.id === activeServiceId) ?? SERVICES[0];

  return (
    <section
      id="services"
      className="scroll-mt-24 py-24 md:py-32 px-6 md:px-10 bg-[#FAF9F6] border-y border-[#1C1C1B]/10"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="max-w-2xl pb-12">
          <p className="text-xs font-medium tracking-wider text-[#64615B]">
            Architectural Disciplines
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-[#1C1C1B] mt-3 text-balance">
            Comprehensive interior architecture from concept through completion.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left 5-Service Interactive Index */}
          <div className="lg:col-span-6 divide-y divide-[#1C1C1B]/12 border-t border-b border-[#1C1C1B]/12">
            {SERVICES.map((service) => {
              const isSelected = service.id === activeService.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setActiveServiceId(service.id)}
                  aria-expanded={isSelected}
                  className={`w-full text-left py-6 px-3 transition-colors duration-150 flex items-start justify-between gap-6 cursor-pointer ${
                    isSelected ? 'bg-[#F4F1EC]' : 'hover:bg-[#F4F1EC]/50'
                  }`}
                >
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono-tabular text-xs text-[#9A7B4F] shrink-0">
                      {service.number}.
                    </span>
                    <div>
                      <h3 className="font-display text-xl md:text-2xl font-medium text-[#1C1C1B]">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#524F4A]">{service.tagline}</p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 mt-2 shrink-0 transition-transform duration-200 ${
                      isSelected ? 'translate-x-1 text-[#1C1C1B]' : 'text-[#64615B]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Detailed Scope Panel */}
          <div className="lg:col-span-6 bg-[#F4F1EC] border border-[#1C1C1B]/10 rounded-2xl p-8 md:p-10">
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#1C1C1B]/10">
              <span className="text-xs font-mono-tabular text-[#64615B]">
                Discipline {activeService.number} · {activeService.typicalTimeline}
              </span>
            </div>

            <h3 className="font-display text-2xl md:text-3xl font-medium text-[#1C1C1B] mt-6">
              {activeService.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#4A4742]">
              {activeService.description}
            </p>

            <div className="mt-8">
              <p className="text-xs font-medium tracking-wide text-[#64615B] mb-4">
                Core Architectural Deliverables
              </p>
              <ul className="space-y-3">
                {activeService.deliverables.map((item, idx) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-3 text-sm text-[#1C1C1B] pb-3 border-b border-[#1C1C1B]/8 last:border-b-0 last:pb-0"
                  >
                    <span className="font-mono-tabular text-xs text-[#9A7B4F]">
                      0{idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectServiceForInquiry(activeService.title)}
              className="mt-8 inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium text-[#FAF9F6] bg-[#1C1C1B] rounded-lg hover:bg-[#333230] transition-colors cursor-pointer"
            >
              Inquire About {activeService.title}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
