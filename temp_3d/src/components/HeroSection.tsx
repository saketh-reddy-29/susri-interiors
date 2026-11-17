import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowDownRight, Moon, Sun, X } from 'lucide-react';
import {
  CAMERA_PRESETS,
  CameraPresetId,
  DEFAULT_ROOM_STATE,
  LightingMode,
} from '../data/studioData';
import { getCatalogItem } from '../utils/roomConfigLogic';
import { Room3DScene } from '../three/Room3DScene';

interface HeroSectionProps {
  onExploreProjects: () => void;
  onOpenDesigner: () => void;
}

export function HeroSection({ onExploreProjects, onOpenDesigner }: HeroSectionProps) {
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const [lightingMode, setLightingMode] = useState<LightingMode>('day');
  const [cameraPresetId, setCameraPresetId] = useState<CameraPresetId>('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const el = heroCopyRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        y: 22,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const selectedPlacement = selectedId
    ? DEFAULT_ROOM_STATE.furniture.find((f) => f.id === selectedId)
    : null;
  const selectedInfo = selectedPlacement ? getCatalogItem(selectedPlacement.type) : null;

  return (
    <section
      id="home"
      className="relative w-full h-screen min-h-[680px] max-h-[1040px] overflow-hidden bg-[#ECE7DF]"
    >
      {/* Interactive 3D Living Room Viewport */}
      <div className="absolute inset-0 z-0">
        <Room3DScene
          mode="hero"
          wallColorId="limestone"
          floorMaterialId="oak-herringbone"
          lightingMode={lightingMode}
          furniture={DEFAULT_ROOM_STATE.furniture}
          selectedFurnitureId={selectedId}
          cameraPresetId={cameraPresetId}
          onSelectFurniture={(id) => setSelectedId(id)}
        />
      </div>

      {/* Subtle architectural contrast gradient on bottom-left for text legibility without obscuring center 3D room */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          lightingMode === 'night'
            ? 'bg-gradient-to-tr from-[#111110]/80 via-[#111110]/25 to-transparent'
            : 'bg-gradient-to-tr from-[#F4F1EC]/85 via-[#F4F1EC]/25 to-transparent'
        }`}
      />

      {/* Hero Editorial Overlay */}
      <div
        ref={heroCopyRef}
        className="relative z-10 pointer-events-none h-full max-w-[1280px] mx-auto px-6 md:px-10 pt-28 pb-10 flex flex-col justify-between"
      >
        {/* Top micro-guidance */}
        <div className="flex items-center justify-between gap-4">
          <p
            className={`hero-stagger text-xs tracking-wide transition-colors ${
              lightingMode === 'night' ? 'text-[#E8E1D5]/80' : 'text-[#524F4A]'
            }`}
          >
            <span className="hidden sm:inline">Copenhagen · Zurich · Milan — </span>
            Drag to orbit 360° or click any piece
          </p>
        </div>

        {/* Bottom split: Headline & primary CTA on left, discreet 3D view & lighting dock on right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="pointer-events-auto max-w-xl">
            <h1
              className={`hero-stagger font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] font-medium tracking-tight text-balance transition-colors ${
                lightingMode === 'night' ? 'text-[#FAF9F6]' : 'text-[#1C1C1B]'
              }`}
            >
              DESIGN YOUR WORLD.
            </h1>
            <p
              className={`hero-stagger mt-4 text-base md:text-lg leading-relaxed max-w-md transition-colors ${
                lightingMode === 'night' ? 'text-[#D6D0C5]' : 'text-[#4A4742]'
              }`}
            >
              Spaces crafted around the way you live.
            </p>

            <div className="hero-stagger mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreProjects}
                className={`inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  lightingMode === 'night'
                    ? 'bg-[#FAF9F6] text-[#1C1C1B] hover:bg-[#EAE4DA] focus-visible:outline-[#FAF9F6]'
                    : 'bg-[#1C1C1B] text-[#FAF9F6] hover:bg-[#333230] focus-visible:outline-[#1C1C1B]'
                }`}
              >
                Explore Projects
                <ArrowDownRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenDesigner}
                className={`inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium rounded-lg border transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                  lightingMode === 'night'
                    ? 'border-[#FAF9F6]/25 text-[#FAF9F6] bg-[#1C1C1B]/75 hover:bg-[#1C1C1B]'
                    : 'border-[#1C1C1B]/18 text-[#1C1C1B] bg-[#FAF9F6]/88 hover:bg-[#FAF9F6]'
                }`}
              >
                Customize in 3D Studio
              </button>
            </div>
          </div>

          {/* Right-side compact Hero 3D Controls & Clicked Object Card */}
          <div className="pointer-events-auto flex flex-col items-start lg:items-end gap-3">
            {selectedInfo && (
              <div
                role="region"
                aria-label="Selected furniture specification"
                className="w-full max-w-xs p-4 bg-[#FAF9F6]/94 border border-[#1C1C1B]/12 rounded-xl shadow-lg text-[#1C1C1B]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#64615B]">
                      {selectedInfo.category} · {selectedInfo.dimensions}
                    </p>
                    <h2 className="font-display text-base font-medium mt-0.5">
                      {selectedInfo.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Close object details"
                    className="p-1.5 rounded-md text-[#64615B] hover:text-[#1C1C1B] hover:bg-[#EAE4DA]/60 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#4A4742]">
                  {selectedInfo.description}
                </p>
                <p className="mt-2.5 pt-2.5 border-t border-[#1C1C1B]/10 text-xs text-[#64615B]">
                  {selectedInfo.materials}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF9F6]/92 border border-[#1C1C1B]/12 rounded-xl shadow-sm">
              <div className="flex items-center gap-1 pr-1.5 border-r border-[#1C1C1B]/10">
                <button
                  type="button"
                  onClick={() => setLightingMode('day')}
                  aria-pressed={lightingMode === 'day'}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    lightingMode === 'day'
                      ? 'bg-[#1C1C1B] text-[#FAF9F6]'
                      : 'text-[#524F4A] hover:text-[#1C1C1B]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Daylight
                </button>
                <button
                  type="button"
                  onClick={() => setLightingMode('night')}
                  aria-pressed={lightingMode === 'night'}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    lightingMode === 'night'
                      ? 'bg-[#1C1C1B] text-[#FAF9F6]'
                      : 'text-[#524F4A] hover:text-[#1C1C1B]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Evening
                </button>
              </div>

              <div className="flex items-center gap-1">
                {CAMERA_PRESETS.slice(0, 3).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setCameraPresetId(preset.id)}
                    aria-pressed={cameraPresetId === preset.id}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      cameraPresetId === preset.id
                        ? 'bg-[#EAE4DA] text-[#1C1C1B]'
                        : 'text-[#524F4A] hover:text-[#1C1C1B]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
