export type ProjectCategory =
  | 'All'
  | 'Living Rooms'
  | 'Bedrooms'
  | 'Kitchens'
  | 'Offices'
  | 'Commercial';

export interface ArchitecturalProject {
  id: string;
  title: string;
  category: Exclude<ProjectCategory, 'All'>;
  location: string;
  areaSqm: number;
  year: number;
  leadArchitect: string;
  image: string;
  summary: string;
  narrative: string;
  materials: string[];
  lightingStrategy: string;
}

export interface StudioService {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  typicalTimeline: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  credentials: string;
  bio: string;
}

export type FurnitureType =
  | 'boucle-sofa'
  | 'coffee-table'
  | 'lounge-chair'
  | 'floor-lamp'
  | 'credenza'
  | 'wool-rug'
  | 'olive-planter'
  | 'side-table'
  | 'dining-set';

export interface FurnitureCatalogItem {
  type: FurnitureType;
  name: string;
  designer: string;
  category: 'Seating' | 'Tables' | 'Storage' | 'Lighting' | 'Accents';
  dimensions: string;
  footprintWidth: number;
  footprintDepth: number;
  materials: string;
  description: string;
  priceEstimate: string;
  leadTime: string;
}

export interface PlacedFurniture {
  id: string;
  type: FurnitureType;
  x: number;
  z: number;
  rotationY: number; // radians
  fabricColor?: string;
}

export interface WallColorOption {
  id: string;
  name: string;
  hex: string;
  finish: string;
}

export type FloorMaterialId =
  | 'oak-herringbone'
  | 'smoked-walnut'
  | 'honed-travertine'
  | 'charcoal-microcement';

export interface FloorMaterialOption {
  id: FloorMaterialId;
  name: string;
  swatchHex: string;
  finish: string;
  roughness: number;
}

export type LightingMode = 'day' | 'night';

export type CameraPresetId = 'overview' | 'lounge' | 'window' | 'plan';

export interface CameraPreset {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface RoomDesignState {
  wallColorId: string;
  floorMaterialId: FloorMaterialId;
  lightingMode: LightingMode;
  furniture: PlacedFurniture[];
}

export interface SavedRoomDesign {
  id: string;
  name: string;
  savedAt: string;
  state: RoomDesignState;
}

export const ROOM_BOUNDS = {
  minX: -4.3,
  maxX: 4.3,
  minZ: -3.4,
  maxZ: 3.4,
};

export const PROJECTS: ArchitecturalProject[] = [
  {
    id: 'villa-bygdoy',
    title: 'Bygdøy Limestone Residence',
    category: 'Living Rooms',
    location: 'Bengaluru, Karnataka',
    areaSqm: 285,
    year: 2026,
    leadArchitect: 'Aarav Reddy',
    image: '/src/assets/images/project_living_oslo_1794905574624.jpg',
    summary:
      'Floor-to-ceiling blackened steel glazing frames winter pines against hand-troweled limewash walls and white oak herringbone.',
    narrative:
      'Designed for a coastal peninsula residence overlooking the Oslofjord, the living pavilion strips away ornamental clutter to elevate raw tactility. Acoustic lime plaster softens northern winter light, anchored by a monolithic Roman travertine plinth table and Belgian bouclé seating.',
    materials: ['Honed Rajasthan Honed Travertine', 'Indian White Oak', 'Mineral Limewash', 'Belgian Bouclé'],
    lightingStrategy: 'Diffused northern daylight paired with 2700K concealed perimeter grazing.',
  },
  {
    id: 'suite-seefeld',
    title: 'Seefeld Fluted Oak Suite',
    category: 'Bedrooms',
    location: 'Mumbai, Maharashtra',
    areaSqm: 92,
    year: 2026,
    leadArchitect: 'Priya Sharma',
    image: '/src/assets/images/project_bedroom_zurich_1794905576121.jpg',
    summary:
      'A serene lakeside sleeping sanctuary articulated with vertical smoked oak joinery, Belgian linen, and sculpted alabaster pendants.',
    narrative:
      'Positioned to capture morning reflections off Lake Zurich, the suite balances warmth and acoustic stillness. Full-height fluted oak millwork conceals wardrobe storage and softly absorbs sound, while raw alabaster globes cast an amber evening glow.',
    materials: ['Fluted Smoked Oak', 'Carved Spanish Alabaster', 'Unbleached Linen', 'Hand-knotted Wool'],
    lightingStrategy: 'Dimmable 2200K alabaster bedside pendants with automated sunrise drapery.',
  },
  {
    id: 'casa-brera',
    title: 'Brera Monolith Kitchen',
    category: 'Kitchens',
    location: 'Jubilee Hills, Hyderabad',
    areaSqm: 118,
    year: 2025,
    leadArchitect: 'Manav Goud Kuncha',
    image: '/src/assets/images/project_kitchen_milan_1794905576179.jpg',
    summary:
      'Cantilevered Calacatta travertine island meets matte charcoal pocket cabinetry and brushed unlacquered brass hardware.',
    narrative:
      'Set within a restored Milanese courtyard palazzo, this culinary atelier treats stone as architectural sculpture. A 4.2-meter honed travertine block is miter-folded to conceal induction, drainage, and waste systems while smoked oak niches display ceramic works.',
    materials: ['Calacatta Travertine', 'Charcoal Fenix Laminate', 'Smoked Oak Veneer', 'Unlacquered Brass'],
    lightingStrategy: 'Linear architectural ceiling coves and recessed micro-spots at 97 CRI.',
  },
  {
    id: 'atelier-bredgade',
    title: 'Bredgade Private Library & Studio',
    category: 'Offices',
    location: 'Goa, India',
    areaSqm: 145,
    year: 2025,
    leadArchitect: 'Aarav Reddy',
    image: '/src/assets/images/project_office_copenhagen_1794905575654.jpg',
    summary:
      'Bespoke sculpted walnut worktable, acoustic oak ceiling slats, and full-height architectural library millwork.',
    narrative:
      'Conceived as an executive retreat for a Danish architectural foundation, every surface prioritizes acoustic calm and tactile longevity. Saddle leather seating develops patina over decades beside custom quarter-sawn oak bookcases.',
    materials: ['American Black Walnut', 'Saddle Bridle Leather', 'Quarter-Sawn Oak', 'Brushed Bronze'],
    lightingStrategy: 'Opal glass globe pendant balanced with task-level brass table illumination.',
  },
  {
    id: 'aoyama-pavilion',
    title: 'Minami-Banjara Hills Design Studio',
    category: 'Commercial',
    location: 'Hyderabad, Telangana',
    areaSqm: 340,
    year: 2026,
    leadArchitect: 'Manav Goud Kuncha',
    image: '/src/assets/images/project_commercial_tokyo_1794905577563.jpg',
    summary:
      'Sweeping curved microcement walls and solid limestone display plinths create a contemplative retail gallery.',
    narrative:
      'Replacing traditional retail shelving with museum-grade spatial pacing, the Aoyama flagship guides visitors along a continuous plaster curve. Natural courtyard maple foliage filters through a blackened steel pivot portal.',
    materials: ['Troweled Microcement', 'Sawn Kota Stone', 'Blackened Patina Steel', 'Warm Plaster'],
    lightingStrategy: 'Concealed curved ceiling cove washes paired with narrow-beam framing spots.',
  },
  {
    id: 'fjord-penthouse',
    title: 'Kokapet Sky Lounge',
    category: 'Living Rooms',
    location: 'Bengaluru, Karnataka',
    areaSqm: 210,
    year: 2025,
    leadArchitect: 'Priya Sharma',
    image: '/src/assets/images/about_atelier_studio_1794905578387.jpg',
    summary:
      'An expansive waterfront atelier and living gallery unifying worktables, material archives, and panoramic harbor light.',
    narrative:
      'Blurring the boundary between private studio and residential salon, raw-edged travertine tables anchor collaborative life under exposed timber beams and harbor-facing steel casements.',
    materials: ['Split-Edge Travertine', 'Oiled Nagpur Seasoned Teak', 'Raw Indian Khadi Linen', 'Anodized Aluminum'],
    lightingStrategy: 'Daylight-harvesting perimeter glazing supplemented by track-mounted architectural spots.',
  },
];

export const SERVICES: StudioService[] = [
  {
    id: 'residential',
    number: '01',
    title: 'Residential Interiors',
    tagline: 'Private residences sculpted around daily rituals and natural light.',
    description:
      'From coastal villas to urban penthouses, we compose cohesive living environments that balance spatial flow, bespoke millwork, and tactile natural materials.',
    deliverables: [
      'Spatial zoning & architectural circulation plans',
      'Photorealistic 3D lighting & material simulations',
      'Custom furniture & joinery fabrication drawings',
      'Art curation, textiles & final styling installation',
    ],
    typicalTimeline: '16 – 28 Weeks',
  },
  {
    id: 'commercial',
    number: '02',
    title: 'Commercial Interiors',
    tagline: 'Flagship galleries, executive studios, and hospitality sanctuaries.',
    description:
      'Architectural environments for design-led brands that translate identity into physical proportion, acoustics, and memorable visitor choreography.',
    deliverables: [
      'Brand spatial strategy & customer journey mapping',
      'Custom display plinths & architectural lighting rigs',
      'Acoustic engineering & commercial material specs',
      'Turnkey contractor coordination & site supervision',
    ],
    typicalTimeline: '14 – 24 Weeks',
  },
  {
    id: 'kitchens',
    number: '03',
    title: 'Modular Kitchens',
    tagline: 'Monolithic stone islands and precision Indian cabinetry.',
    description:
      'Architectural culinary spaces engineered for effortless workflow, integrating concealed appliances, mitered stone blocks, and solid timber interiors.',
    deliverables: [
      'Ergonomic kitchen work-triangle & island engineering',
      'Slab selection (Travertine, Quartzite, Pietra Grey)',
      'Custom pocket-door & recessed lighting integration',
      'Precision MEP & plumbing coordination blueprints',
    ],
    typicalTimeline: '10 – 14 Weeks',
  },
  {
    id: 'bedrooms',
    number: '04',
    title: 'Bedroom Designs',
    tagline: 'Restorative suites anchored by acoustic calm and circadian light.',
    description:
      'Tailored master suites and dressing rooms crafted with fluted timber wall paneling, organic linens, and warm low-glare evening illumination.',
    deliverables: [
      'Custom upholstered bed frames & floating nightstands',
      'Walk-in wardrobe glass & smoked oak cabinetry',
      'Layered circadian & blackout drapery automation',
      'Tactile textile & rug pairing schedule',
    ],
    typicalTimeline: '8 – 12 Weeks',
  },
  {
    id: 'renovations',
    number: '05',
    title: 'Complete Renovations',
    tagline: 'End-to-end structural transformation from shell to key handover.',
    description:
      'Comprehensive architectural gut renovations managing structural modifications, permitting, bespoke finishes, and craftsmanship oversight under one roof.',
    deliverables: [
      'Structural wall realignment & glazing expansion',
      'Underfloor heating, smart climate & acoustic ceilings',
      'Full tender documentation & weekly site audits',
      'Dedicated project architect from concept to handover',
    ],
    typicalTimeline: '24 – 42 Weeks',
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'henrik',
    name: 'Aarav Reddy',
    role: 'Founding Principal Architect',
    location: 'Copenhagen',
    credentials: 'MAA · Royal Danish Academy',
    bio: 'Twenty years leading residential and cultural interiors across Scandinavia and Central Europe with a focus on quiet structural honesty.',
  },
  {
    id: 'astrid',
    name: 'Priya Sharma',
    role: 'Director of Spatial Materiality',
    location: 'Zurich',
    credentials: 'ETH Zurich · M.Sc. Architecture',
    bio: 'Specializes in mineral plasters, Indian quarry stone sourcing, and circadian architectural lighting design.',
  },
  {
    id: 'matteo',
    name: 'Manav Goud Kuncha',
    role: 'Head of Bespoke Millwork & 3D Studio',
    location: 'Milan',
    credentials: 'Politecnico di Milano',
    bio: 'Directs SUSRI INTERIORS custom furniture prototyping, monolithic kitchen engineering, and real-time 3D client visualization.',
  },
];

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  {
    type: 'boucle-sofa',
    name: 'Aarhus Modular Sofa',
    designer: 'Aarav Reddy, 2025',
    category: 'Seating',
    dimensions: '260 × 104 × 74 cm',
    footprintWidth: 2.6,
    footprintDepth: 1.05,
    materials: 'Belgian Wool Bouclé · Smoked Walnut Plinth',
    description: 'Deep low-profile three-seat lounge sofa with sculptural rounded bolsters and recessed timber plinth.',
    priceEstimate: '₹ 1,85,000',
    leadTime: '6 Weeks',
  },
  {
    type: 'coffee-table',
    name: 'Jaisalmer Stone Monolith Table',
    designer: 'Manav Goud Kuncha, 2026',
    category: 'Tables',
    dimensions: '140 × 85 × 34 cm',
    footprintWidth: 1.45,
    footprintDepth: 0.9,
    materials: 'Honed Rajasthan Honed Travertine · Brushed Brass',
    description: 'Low-slung architectural coffee table carved from tiered travertine blocks with curated ceramic vessels.',
    priceEstimate: '₹ 95,000',
    leadTime: '4 Weeks',
  },
  {
    type: 'lounge-chair',
    name: 'Mysore Teak Wing Lounge Chair',
    designer: 'Priya Sharma, 2025',
    category: 'Seating',
    dimensions: '78 × 82 × 76 cm',
    footprintWidth: 0.85,
    footprintDepth: 0.85,
    materials: 'Oiled Black Walnut · Saddle Linen Cushion',
    description: 'Cantilevered solid timber frame with angled backrest geometry and hand-stitched linen upholstery.',
    priceEstimate: '₹ 65,000',
    leadTime: '5 Weeks',
  },
  {
    type: 'floor-lamp',
    name: 'Solstice Arc Lamp',
    designer: 'SUSRI INTERIORS Lighting Lab',
    category: 'Lighting',
    dimensions: '42 × 42 × 188 cm',
    footprintWidth: 0.55,
    footprintDepth: 0.55,
    materials: 'Brushed Brass · Honed Travertine Base · Linen',
    description: 'Slender arched brass stem anchored in solid stone, casting warm 2400K ambient illumination.',
    priceEstimate: '₹ 42,000',
    leadTime: '3 Weeks',
  },
  {
    type: 'credenza',
    name: 'Bespoke Fluted Teak Credenza',
    designer: 'Manav Goud Kuncha, 2025',
    category: 'Storage',
    dimensions: '210 × 48 × 68 cm',
    footprintWidth: 2.1,
    footprintDepth: 0.55,
    materials: 'Fluted Indian Teakwood (CP Teak) · Banswara White Marble Top',
    description: 'Architectural sideboard featuring vertical fluted timber doors, blackened steel legs, and inset stone top.',
    priceEstimate: '₹ 1,45,000',
    leadTime: '7 Weeks',
  },
  {
    type: 'wool-rug',
    name: 'Kashmiri Handwoven Wool Rug',
    designer: 'Priya Sharma',
    category: 'Accents',
    dimensions: '360 × 260 × 2 cm',
    footprintWidth: 3.6,
    footprintDepth: 2.6,
    materials: '100% Handwoven Kashmiri Wool',
    description: 'Hand-loomed heavyweight wool rug with subtle tonal basketweave texture and tailored border.',
    priceEstimate: '₹ 75,000',
    leadTime: '4 Weeks',
  },
  {
    type: 'olive-planter',
    name: 'Handcrafted Indian Brass Planter',
    designer: 'SUSRI INTERIORS Botanicals',
    category: 'Accents',
    dimensions: '54 × 54 × 175 cm',
    footprintWidth: 0.6,
    footprintDepth: 0.6,
    materials: 'Ribbed Limestone Vessel · Sculptural Olive',
    description: 'Hand-turned limestone planter housing an architectural multi-branch indoor architectural plant.',
    priceEstimate: '₹ 28,000',
    leadTime: '2 Weeks',
  },
  {
    type: 'side-table',
    name: 'Cylindro Travertine Pedestal',
    designer: 'Manav Goud Kuncha, 2026',
    category: 'Tables',
    dimensions: '44 × 44 × 52 cm',
    footprintWidth: 0.5,
    footprintDepth: 0.5,
    materials: 'Fluted Honed Limestone',
    description: 'Solid drum side table ideal beside modular sofas or reading armchairs.',
    priceEstimate: '₹ 35,000',
    leadTime: '3 Weeks',
  },
  {
    type: 'dining-set',
    name: 'Monolithic Teakwood Dining Set',
    designer: 'Aarav Reddy, 2026',
    category: 'Tables',
    dimensions: '200 × 100 × 75 cm',
    footprintWidth: 2.1,
    footprintDepth: 1.5,
    materials: 'Smoked Walnut · Upholstered Dining Chairs',
    description: 'Monolithic chamfered timber dining table paired with four sculpted minimalist dining chairs.',
    priceEstimate: '₹ 2,40,000',
    leadTime: '8 Weeks',
  },
];

export const WALL_COLORS: WallColorOption[] = [
  { id: 'limestone', name: 'Warm Limestone', hex: '#E8E1D5', finish: 'Mineral Limewash' },
  { id: 'chalk', name: 'Indian Chalk', hex: '#F3F0EA', finish: 'Matte Clay Paint' },
  { id: 'greige', name: 'Fossil Greige', hex: '#CFC7BA', finish: 'Hand-Troweled Plaster' },
  { id: 'sage-clay', name: 'Lichen Clay', hex: '#BEC3B6', finish: 'Matte Mineral' },
  { id: 'taupe', name: 'Smoked Taupe', hex: '#8F8578', finish: 'Velvet Plaster' },
  { id: 'charcoal', name: 'Obsidian Plaster', hex: '#2D2C2A', finish: 'Deep Matte Limewash' },
];

export const FLOOR_MATERIALS: FloorMaterialOption[] = [
  {
    id: 'oak-herringbone',
    name: 'White Oak Herringbone',
    swatchHex: '#C7AF8B',
    finish: 'Matte Natural Soap',
    roughness: 0.58,
  },
  {
    id: 'smoked-walnut',
    name: 'Smoked Walnut Plank',
    swatchHex: '#5C4433',
    finish: 'Brushed Hardwax Oil',
    roughness: 0.46,
  },
  {
    id: 'honed-travertine',
    name: 'Honed Travertine',
    swatchHex: '#DDD3C2',
    finish: 'Unfilled Open-Pore Stone',
    roughness: 0.65,
  },
  {
    id: 'charcoal-microcement',
    name: 'Charcoal Microcement',
    swatchHex: '#3D3C3A',
    finish: 'Satin Mineral Seal',
    roughness: 0.42,
  },
];

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    label: 'Overview',
    position: [5.4, 3.85, 6.4],
    target: [-0.1, 0.25, -0.35],
  },
  {
    id: 'lounge',
    label: 'Lounge Focus',
    position: [2.8, 1.9, 3.6],
    target: [-0.2, 0.75, -0.5],
  },
  {
    id: 'window',
    label: 'Window & Hearth',
    position: [-3.9, 2.2, 4.4],
    target: [0.6, 1.0, -1.2],
  },
  {
    id: 'plan',
    label: 'Architectural Plan',
    position: [0.01, 8.8, 2.2],
    target: [0, 0, 0],
  },
];

export const DEFAULT_ROOM_STATE: RoomDesignState = {
  wallColorId: 'limestone',
  floorMaterialId: 'oak-herringbone',
  lightingMode: 'day',
  furniture: [
    { id: 'rug-1', type: 'wool-rug', x: 0, z: 0.15, rotationY: 0 },
    { id: 'sofa-1', type: 'boucle-sofa', x: 0, z: -1.15, rotationY: 0 },
    { id: 'table-1', type: 'coffee-table', x: 0, z: 0.25, rotationY: 0 },
    { id: 'chair-1', type: 'lounge-chair', x: -2.05, z: 0.2, rotationY: Math.PI * 0.35 },
    { id: 'lamp-1', type: 'floor-lamp', x: -2.55, z: -1.35, rotationY: Math.PI * 0.2 },
    { id: 'credenza-1', type: 'credenza', x: 2.95, z: -0.2, rotationY: -Math.PI / 2 },
    { id: 'plant-1', type: 'olive-planter', x: 2.75, z: -2.35, rotationY: 0 },
    { id: 'side-1', type: 'side-table', x: 1.75, z: -1.1, rotationY: 0 },
  ],
};

export const INITIAL_SAVED_DESIGNS: SavedRoomDesign[] = [
  {
    id: 'preset-hyderabad-day',
    name: 'Hyderabad Daylight Villa',
    savedAt: '2026-10-12T10:30:00Z',
    state: DEFAULT_ROOM_STATE,
  },
  {
    id: 'preset-bengaluru-evening',
    name: 'Bengaluru Bronze Evening',
    savedAt: '2026-10-28T19:15:00Z',
    state: {
      wallColorId: 'charcoal',
      floorMaterialId: 'smoked-walnut',
      lightingMode: 'night',
      furniture: DEFAULT_ROOM_STATE.furniture,
    },
  },
  {
    id: 'preset-jubilee-hills',
    name: 'Jubilee Hills Minimal Sanctuary',
    savedAt: '2026-11-05T14:20:00Z',
    state: {
      wallColorId: 'limestone',
      floorMaterialId: 'limestone-slab',
      lightingMode: 'day',
      furniture: DEFAULT_ROOM_STATE.furniture,
    },
  },
];
