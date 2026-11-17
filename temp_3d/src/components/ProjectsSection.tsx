import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import {
  ArchitecturalProject,
  ProjectCategory,
  PROJECTS,
} from '../data/studioData';
import { filterProjectsByCategory } from '../utils/roomConfigLogic';

const CATEGORIES: ProjectCategory[] = [
  'All',
  'Living Rooms',
  'Bedrooms',
  'Kitchens',
  'Offices',
  'Commercial',
];

interface ProjectsSectionProps {
  onCommissionSimilar: (projectTitle: string) => void;
}

export function ProjectsSection({ onCommissionSimilar }: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');
  const [selectedProject, setSelectedProject] = useState<ArchitecturalProject | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const visibleProjects = filterProjectsByCategory(PROJECTS, activeCategory);

  return (
    <section
      id="projects"
      className="scroll-mt-24 py-24 md:py-32 px-6 md:px-10 max-w-[1280px] mx-auto"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-[#1C1C1B]/12">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-wider text-[#64615B]">
            Selected Works · 2025 – 2026
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-[#1C1C1B] mt-3 text-balance">
            Architectural interiors defined by proportion and light.
          </h2>
        </div>

        {/* Interactive Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter projects by typology"
          className="flex flex-wrap items-center gap-1 p-1 bg-[#EAE4DA]/75 rounded-lg"
        >
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#FAF9F6] text-[#1C1C1B] shadow-sm'
                    : 'text-[#524F4A] hover:text-[#1C1C1B]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Curated Architectural Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {visibleProjects.map((project, idx) => (
          <motion.article
            key={project.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: Math.min(idx * 0.06, 0.24) }}
            className="group flex flex-col"
          >
            <button
              type="button"
              onClick={() => setSelectedProject(project)}
              aria-label={`Inspect project ${project.title}`}
              className="text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1C1C1B]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#EAE4DA]">
                {!imgErrors[project.id] ? (
                  <img
                    src={project.image}
                    alt={`${project.title} in ${project.location}`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [project.id]: true }))
                    }
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E4DDD2] to-[#CFC6B8] p-6">
                    <span className="font-display text-lg text-[#4A4742]">
                      {project.title}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-xs text-[#64615B] tabular-nums">
                  {project.category} · {project.location} · {project.areaSqm} m²
                </p>
                <span className="text-xs text-[#64615B] tabular-nums">
                  {project.year}
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-3">
                <h3 className="font-display text-xl font-medium text-[#1C1C1B] group-hover:text-[#9A7B4F] transition-colors">
                  {project.title}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-[#64615B] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#1C1C1B]" />
              </div>

              <p className="mt-2 text-sm leading-relaxed text-[#524F4A] line-clamp-2">
                {project.summary}
              </p>
            </button>
          </motion.article>
        ))}
      </div>

      {/* Lightbox Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#1C1C1B]/72"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.14 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FAF9F6] rounded-2xl border border-[#1C1C1B]/10 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#FAF9F6]/92 border border-[#1C1C1B]/12 text-[#1C1C1B] hover:bg-[#EAE4DA] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-7 bg-[#EAE4DA] min-h-[280px]">
                  <img
                    src={selectedProject.image}
                    alt={`${selectedProject.title} architectural interior`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#64615B] tabular-nums">
                      {selectedProject.category} · {selectedProject.location} ·{' '}
                      {selectedProject.year}
                    </p>
                    <h3
                      id="project-modal-title"
                      className="font-display text-2xl md:text-3xl font-medium text-[#1C1C1B] mt-2"
                    >
                      {selectedProject.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-[#4A4742]">
                      {selectedProject.narrative}
                    </p>

                    <div className="mt-6 pt-5 border-t border-[#1C1C1B]/10 space-y-3 text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-[#64615B]">Floor Area</span>
                        <span className="font-medium text-[#1C1C1B] tabular-nums">
                          {selectedProject.areaSqm} m²
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#64615B]">Lead Architect</span>
                        <span className="font-medium text-[#1C1C1B]">
                          {selectedProject.leadArchitect}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64615B] block mb-1">
                          Primary Material Palette
                        </span>
                        <span className="text-[#1C1C1B] leading-relaxed">
                          {selectedProject.materials.join(' · ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64615B] block mb-1">
                          Lighting Architecture
                        </span>
                        <span className="text-[#1C1C1B] leading-relaxed">
                          {selectedProject.lightingStrategy}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const title = selectedProject.title;
                      setSelectedProject(null);
                      onCommissionSimilar(title);
                    }}
                    className="mt-8 w-full px-5 py-3 text-sm font-medium text-[#FAF9F6] bg-[#1C1C1B] rounded-lg hover:bg-[#333230] transition-colors cursor-pointer"
                  >
                    Commission a Similar Space
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
