interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#151514] text-[#9C9589] px-6 md:px-10 py-12 border-t border-white/10">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="font-display text-base font-semibold tracking-[0.14em] text-[#FAF9F6]">
            NORDHUS
          </span>
          <p className="mt-1.5 text-xs">
            Architectural Interior Design · Copenhagen · Zurich · Milan
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6 text-xs">
          {[
            { id: 'home', label: 'Home' },
            { id: 'projects', label: 'Projects' },
            { id: 'designer', label: '3D Studio' },
            { id: 'services', label: 'Services' },
            { id: 'about', label: 'About' },
            { id: 'contact', label: 'Contact' },
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(link.id);
              }}
              className="hover:text-[#FAF9F6] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-xs">© 2026 NORDHUS Atelier ApS. All rights reserved.</p>
      </div>
    </footer>
  );
}
