import { TEAM_MEMBERS } from '../data/studioData';

export function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-24 py-24 md:py-32 px-6 md:px-10 max-w-[1280px] mx-auto"
    >
      {/* Editorial Story Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-5">
          <p className="text-xs font-medium tracking-wider text-[#64615B]">
            About NORDHUS Atelier
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-[#1C1C1B] mt-3 text-balance">
            Quiet geometry, honest materials, enduring warmth.
          </h2>
        </div>

        <div className="lg:col-span-7 space-y-5 text-base leading-relaxed text-[#4A4742]">
          <p>
            Founded in Copenhagen in 2014 with satellite studios in Zurich and Milan, NORDHUS Atelier unites architectural rigor with Indian Contemporary material restraint. We design spaces that age gracefully—favoring quarried limestone, quarter-sawn Indian oak, hand-troweled mineral limewash, and bespoke unlacquered brass over fleeting seasonal trends.
          </p>
          <p>
            Every commission begins with real-time 3D light and proportion modeling. Before a single wall is moved or slab is cut, our clients walk through their future rooms across shifting Indian daylight and evening illumination.
          </p>
        </div>
      </div>

      {/* Full-Width Studio Photograph */}
      <div className="mt-14 relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#EAE4DA]">
        <img
          src="/src/assets/images/about_atelier_studio_1794905578387.jpg"
          alt="NORDHUS Atelier architects reviewing travertine, walnut, and linen material samples in our studio"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Practice Proof Metrics Row */}
      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-[#1C1C1B]/12">
        <div>
          <p className="font-display text-3xl md:text-4xl font-medium text-[#1C1C1B] tabular-nums">
            140+
          </p>
          <p className="mt-1 text-xs text-[#64615B]">
            Completed Private & Flagship Interiors
          </p>
        </div>
        <div>
          <p className="font-display text-3xl md:text-4xl font-medium text-[#1C1C1B] tabular-nums">
            12 Years
          </p>
          <p className="mt-1 text-xs text-[#64615B]">
            Copenhagen, Zurich & Milan Practice
          </p>
        </div>
        <div>
          <p className="font-display text-3xl md:text-4xl font-medium text-[#1C1C1B] tabular-nums">
            18
          </p>
          <p className="mt-1 text-xs text-[#64615B]">
            Indian Architectural Design Honors
          </p>
        </div>
        <div>
          <p className="font-display text-3xl md:text-4xl font-medium text-[#1C1C1B] tabular-nums">
            100%
          </p>
          <p className="mt-1 text-xs text-[#64615B]">
            Bespoke 3D Digital Twin Pre-Visualization
          </p>
        </div>
      </div>

      {/* Leadership Grid (3-column) */}
      <div className="mt-16">
        <p className="text-xs font-medium tracking-wider text-[#64615B] mb-8">
          Studio Principals
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="p-7 bg-[#FAF9F6] border border-[#1C1C1B]/10 rounded-xl flex flex-col justify-between"
            >
              <div>
                <p className="text-xs text-[#64615B]">
                  {member.location} · {member.credentials}
                </p>
                <h3 className="font-display text-xl font-medium text-[#1C1C1B] mt-2">
                  {member.name}
                </h3>
                <p className="text-xs font-medium text-[#9A7B4F] mt-0.5">
                  {member.role}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[#524F4A]">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
