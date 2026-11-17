import {
  ArchitecturalProject,
  FURNITURE_CATALOG,
  FurnitureType,
  PlacedFurniture,
  ProjectCategory,
  ROOM_BOUNDS,
  RoomDesignState,
  SavedRoomDesign,
} from '../data/studioData';

export interface InquiryFormInput {
  name: string;
  email: string;
  projectType: string;
  preferredDate: string;
  message: string;
}

export interface InquiryValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof InquiryFormInput, string>>;
}

export function getCatalogItem(type: FurnitureType) {
  return FURNITURE_CATALOG.find((item) => item.type === type) ?? FURNITURE_CATALOG[0];
}

export function clampFurniturePosition(
  x: number,
  z: number,
  type: FurnitureType,
  rotationY: number,
  snapToGrid = false
): { x: number; z: number } {
  const item = getCatalogItem(type);
  const cos = Math.abs(Math.cos(rotationY));
  const sin = Math.abs(Math.sin(rotationY));
  const halfW = (item.footprintWidth * cos + item.footprintDepth * sin) / 2;
  const halfD = (item.footprintWidth * sin + item.footprintDepth * cos) / 2;

  const minX = ROOM_BOUNDS.minX + halfW;
  const maxX = ROOM_BOUNDS.maxX - halfW;
  const minZ = ROOM_BOUNDS.minZ + halfD;
  const maxZ = ROOM_BOUNDS.maxZ - halfD;

  let clampedX = Math.max(minX, Math.min(maxX, x));
  let clampedZ = Math.max(minZ, Math.min(maxZ, z));

  if (snapToGrid) {
    clampedX = Math.round(clampedX * 4) / 4;
    clampedZ = Math.round(clampedZ * 4) / 4;
    clampedX = Math.max(minX, Math.min(maxX, clampedX));
    clampedZ = Math.max(minZ, Math.min(maxZ, clampedZ));
  }

  return {
    x: Number(clampedX.toFixed(3)),
    z: Number(clampedZ.toFixed(3)),
  };
}

export function rotateFurnitureAngle(currentRad: number, deltaDeg: number): number {
  const deltaRad = (deltaDeg * Math.PI) / 180;
  const twoPi = Math.PI * 2;
  let next = (currentRad + deltaRad) % twoPi;
  if (next < 0) next += twoPi;
  return Number(next.toFixed(4));
}

export function addFurniturePiece(
  current: PlacedFurniture[],
  type: FurnitureType
): { nextList: PlacedFurniture[]; addedId: string } {
  const id = `${type}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
  // Offset slightly from origin based on count so newly added items do not stack identically
  const offsetIndex = current.length % 5;
  const rawX = (offsetIndex - 2) * 0.55;
  const rawZ = -0.35 + (offsetIndex % 2) * 0.5;
  const pos = clampFurniturePosition(rawX, rawZ, type, 0, true);

  const piece: PlacedFurniture = {
    id,
    type,
    x: pos.x,
    z: pos.z,
    rotationY: 0,
  };

  return {
    nextList: [...current, piece],
    addedId: id,
  };
}

export function filterProjectsByCategory(
  projects: ArchitecturalProject[],
  category: ProjectCategory
): ArchitecturalProject[] {
  if (category === 'All') return projects;
  return projects.filter((p) => p.category === category);
}

export function validateRoomDesignName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'Please enter a design title (at least 2 characters).' };
  }
  if (trimmed.length > 48) {
    return { valid: false, error: 'Design title must be 48 characters or fewer.' };
  }
  return { valid: true };
}

export function createSavedDesign(name: string, state: RoomDesignState): SavedRoomDesign {
  return {
    id: `design-${Date.now().toString(36)}`,
    name: name.trim(),
    savedAt: new Date().toISOString(),
    state: {
      ...state,
      furniture: state.furniture.map((item) => ({ ...item })),
    },
  };
}

export function parseSavedDesigns(raw: string | null, fallback: SavedRoomDesign[]): SavedRoomDesign[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const valid = parsed.filter(
      (d): d is SavedRoomDesign =>
        Boolean(d) &&
        typeof d.id === 'string' &&
        typeof d.name === 'string' &&
        Boolean(d.state) &&
        Array.isArray(d.state.furniture)
    );
    return valid.length > 0 ? valid : fallback;
  } catch {
    return fallback;
  }
}

export function validateInquiryForm(input: InquiryFormInput): InquiryValidationResult {
  const errors: InquiryValidationResult['errors'] = {};

  if (!input.name.trim() || input.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email.trim() || !emailPattern.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!input.projectType.trim()) {
    errors.projectType = 'Please select a project discipline.';
  }

  if (!input.message.trim() || input.message.trim().length < 10) {
    errors.message = 'Please share a brief overview of your space (at least 10 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildWhatsAppUrl(input: Partial<InquiryFormInput>): string {
  const phone = '4533142090';
  const greeting = input.name?.trim()
    ? `Hello NORDHUS Atelier, my name is ${input.name.trim()}.`
    : 'Hello NORDHUS Atelier, I would like to book an architectural interior consultation.';
  const typePart = input.projectType ? ` Project scope: ${input.projectType}.` : '';
  const msgPart = input.message?.trim() ? ` Notes: ${input.message.trim()}` : '';
  const text = encodeURIComponent(`${greeting}${typePart}${msgPart}`);
  return `https://wa.me/${phone}?text=${text}`;
}
