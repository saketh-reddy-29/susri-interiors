import { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Camera,
  ChevronDown,
  ChevronUp,
  Download,
  Grid,
  Layers,
  Moon,
  Plus,
  RotateCcw,
  RotateCw,
  Save,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import {
  CAMERA_PRESETS,
  CameraPresetId,
  DEFAULT_ROOM_STATE,
  FLOOR_MATERIALS,
  FURNITURE_CATALOG,
  FurnitureType,
  INITIAL_SAVED_DESIGNS,
  LightingMode,
  PlacedFurniture,
  RoomDesignState,
  SavedRoomDesign,
  WALL_COLORS,
} from '../data/studioData';
import {
  addFurniturePiece,
  clampFurniturePosition,
  createSavedDesign,
  getCatalogItem,
  parseSavedDesigns,
  rotateFurnitureAngle,
  validateRoomDesignName,
} from '../utils/roomConfigLogic';
import { Room3DScene, Room3DSceneHandle } from '../three/Room3DScene';

const STORAGE_KEY = 'susri_saved_designs_v1';

type DockTab = 'furniture' | 'materials' | 'lighting' | 'saved';

export function RoomDesignerSection() {
  const sceneRef = useRef<Room3DSceneHandle | null>(null);

  const [roomState, setRoomState] = useState<RoomDesignState>(DEFAULT_ROOM_STATE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cameraPresetId, setCameraPresetId] = useState<CameraPresetId>('overview');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<DockTab>('furniture');
  const [controlsCollapsed, setControlsCollapsed] = useState<boolean>(false);

  const [savedDesigns, setSavedDesigns] = useState<SavedRoomDesign[]>(() => {
    try {
      return parseSavedDesigns(localStorage.getItem(STORAGE_KEY), INITIAL_SAVED_DESIGNS);
    } catch {
      return INITIAL_SAVED_DESIGNS;
    }
  });

  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  const [statusFeedback, setStatusFeedback] = useState<string>('');

  // Persist saved designs whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDesigns));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [savedDesigns]);

  // Keyboard shortcut H to toggle dock visibility
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setControlsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showTransientStatus = (msg: string) => {
    setStatusFeedback(msg);
    window.setTimeout(() => {
      setStatusFeedback((curr) => (curr === msg ? '' : curr));
    }, 3200);
  };

  const selectedPlacement = selectedId
    ? roomState.furniture.find((f) => f.id === selectedId) ?? null
    : null;
  const selectedCatalog = selectedPlacement ? getCatalogItem(selectedPlacement.type) : null;

  const handleMoveFurniture = (id: string, x: number, z: number) => {
    setRoomState((prev) => ({
      ...prev,
      furniture: prev.furniture.map((item) => (item.id === id ? { ...item, x, z } : item)),
    }));
  };

  const handleNudgeSelected = (dx: number, dz: number) => {
    if (!selectedPlacement) return;
    const next = clampFurniturePosition(
      selectedPlacement.x + dx,
      selectedPlacement.z + dz,
      selectedPlacement.type,
      selectedPlacement.rotationY,
      snapToGrid
    );
    handleMoveFurniture(selectedPlacement.id, next.x, next.z);
  };

  const handleRotateSelected = (deltaDeg: number) => {
    if (!selectedPlacement) return;
    const nextRot = rotateFurnitureAngle(selectedPlacement.rotationY, deltaDeg);
    const nextPos = clampFurniturePosition(
      selectedPlacement.x,
      selectedPlacement.z,
      selectedPlacement.type,
      nextRot,
      false
    );
    setRoomState((prev) => ({
      ...prev,
      furniture: prev.furniture.map((item) =>
        item.id === selectedPlacement.id
          ? { ...item, rotationY: nextRot, x: nextPos.x, z: nextPos.z }
          : item
      ),
    }));
  };

  const handleAddFurniture = (type: FurnitureType) => {
    const { nextList, addedId } = addFurniturePiece(roomState.furniture, type);
    setRoomState((prev) => ({ ...prev, furniture: nextList }));
    setSelectedId(addedId);
    const catalog = getCatalogItem(type);
    showTransientStatus(`Added ${catalog.name} to room`);
  };

  const handleRemoveSelected = () => {
    if (!selectedPlacement) return;
    const removedName = getCatalogItem(selectedPlacement.type).name;
    setRoomState((prev) => ({
      ...prev,
      furniture: prev.furniture.filter((item) => item.id !== selectedPlacement.id),
    }));
    setSelectedId(null);
    showTransientStatus(`Removed ${removedName}`);
  };

  const handleResetRoom = () => {
    setRoomState(DEFAULT_ROOM_STATE);
    setSelectedId('sofa-1');
    setCameraPresetId('overview');
    showTransientStatus('Restored studio default layout');
  };

  const handleSaveDesignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateRoomDesignName(saveName);
    if (!check.valid) {
      setSaveError(check.error || 'Invalid design name.');
      return;
    }
    const created = createSavedDesign(saveName, roomState);
    setSavedDesigns((prev) => [created, ...prev]);
    setSaveName('');
    setSaveError('');
    setSaveDialogOpen(false);
    setActiveTab('saved');
    setControlsCollapsed(false);
    showTransientStatus(`Saved "${created.name}"`);
  };

  const handleLoadDesign = (design: SavedRoomDesign) => {
    setRoomState({
      ...design.state,
      furniture: design.state.furniture.map((f: PlacedFurniture) => ({ ...f })),
    });
    setSelectedId(design.state.furniture[0]?.id ?? null);
    showTransientStatus(`Loaded "${design.name}"`);
  };

  const handleDeleteSavedDesign = (id: string) => {
    setSavedDesigns((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDownloadPreview = () => {
    const dataUrl = sceneRef.current?.exportPngPreview();
    if (!dataUrl) {
      showTransientStatus('Preview export unavailable in current context');
      return;
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `susri-interiors-3d-room-${roomState.lightingMode}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showTransientStatus('Downloaded 3D room PNG preview');
  };

  const currentWall = WALL_COLORS.find((w) => w.id === roomState.wallColorId) ?? WALL_COLORS[0];
  const currentFloor =
    FLOOR_MATERIALS.find((f) => f.id === roomState.floorMaterialId) ?? FLOOR_MATERIALS[0];

  return (
    <div
      id="designer"
      className="w-full"
    >
      {/* Top Studio Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1C1C1B]/5 border border-[#1C1C1B]/10 text-[#1C1C1B]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>
              {currentWall.name} · {currentFloor.name} ·{' '}
              {roomState.lightingMode === 'day' ? 'Daylight' : 'Evening Atmosphere'}
            </span>
          </div>
          {statusFeedback && (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center px-3 py-1.5 bg-[#1C1C1B] text-[#FAF9F6] rounded-full text-xs font-medium shadow-sm transition-all"
            >
              {statusFeedback}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetRoom}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#1C1C1B] bg-[#FAF9F6] border border-[#1C1C1B]/14 rounded-full hover:bg-[#EAE4DA] transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Layout
          </button>

          <button
            type="button"
            onClick={() => {
              setSaveError('');
              setSaveDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#1C1C1B] bg-[#FAF9F6] border border-[#1C1C1B]/14 rounded-full hover:bg-[#EAE4DA] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preset
          </button>

          <button
            type="button"
            onClick={handleDownloadPreview}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-[#FAF9F6] bg-[#38321E] rounded-full hover:bg-[#221E12] transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export High-Res (PNG)
          </button>
        </div>
      </div>

      {/* Main 3D Studio Viewport Container */}
      <div className="relative w-full h-[70vh] min-h-[550px] max-h-[720px] rounded-2xl overflow-hidden border border-[#1C1C1B]/15 bg-[#ECE7DF] shadow-[0_24px_70px_rgba(28,28,27,0.12)]">
        <Room3DScene
          ref={sceneRef}
          mode="studio"
          wallColorId={roomState.wallColorId}
          floorMaterialId={roomState.floorMaterialId}
          lightingMode={roomState.lightingMode}
          furniture={roomState.furniture}
          selectedFurnitureId={selectedId}
          cameraPresetId={cameraPresetId}
          snapToGrid={snapToGrid}
          orbitEnabled={true}
          onSelectFurniture={(id) => setSelectedId(id)}
          onMoveFurniture={handleMoveFurniture}
        />

        {/* Top-Left Compact Studio Summary */}
        <div className="pointer-events-none absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="pointer-events-auto inline-flex items-center gap-3 px-3.5 py-2 bg-[#FAF9F6]/92 border border-[#1C1C1B]/12 rounded-lg text-xs text-[#1C1C1B] shadow-sm">
            <span>
              {currentWall.name} · {currentFloor.name} ·{' '}
              {roomState.lightingMode === 'day' ? 'Daylight' : 'Evening'}
            </span>
          </div>

          {statusFeedback && (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center px-3.5 py-2 bg-[#1C1C1B] text-[#FAF9F6] rounded-lg text-xs font-medium shadow-md"
            >
              {statusFeedback}
            </div>
          )}
        </div>

        {/* Top-Right Selected Furniture Inspector (only visible when a piece is selected) */}
        {selectedPlacement && selectedCatalog && (
          <div
            role="region"
            aria-label="Selected furniture controls"
            className="absolute top-4 right-4 z-10 w-[min(300px,calc(100%-2rem))] p-4 bg-[#FAF9F6]/94 border border-[#1C1C1B]/14 rounded-xl shadow-lg text-[#1C1C1B]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] text-[#64615B] font-mono-tabular">
                  {selectedCatalog.dimensions} · X:{selectedPlacement.x.toFixed(2)}m Z:
                  {selectedPlacement.z.toFixed(2)}m
                </p>
                <h3 className="font-display text-base font-medium mt-0.5">
                  {selectedCatalog.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Deselect furniture"
                className="p-1.5 rounded-md text-[#64615B] hover:text-[#1C1C1B] hover:bg-[#EAE4DA]/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-1.5 text-xs text-[#524F4A] leading-relaxed">
              {selectedCatalog.materials} · {selectedCatalog.priceEstimate}
            </p>

            {/* Position & Rotation Controls */}
            <div className="mt-3 pt-3 border-t border-[#1C1C1B]/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleRotateSelected(-45)}
                  aria-label="Rotate counter-clockwise 45 degrees"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[#EAE4DA]/80 hover:bg-[#EAE4DA] rounded-md cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  -45°
                </button>
                <button
                  type="button"
                  onClick={() => handleRotateSelected(45)}
                  aria-label="Rotate clockwise 45 degrees"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[#EAE4DA]/80 hover:bg-[#EAE4DA] rounded-md cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  +45°
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleNudgeSelected(-0.25, 0)}
                  aria-label="Move selected furniture left"
                  className="px-2 py-1.5 text-xs bg-[#EAE4DA]/70 hover:bg-[#EAE4DA] rounded-md cursor-pointer"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeSelected(0, -0.25)}
                  aria-label="Move selected furniture back"
                  className="px-2 py-1.5 text-xs bg-[#EAE4DA]/70 hover:bg-[#EAE4DA] rounded-md cursor-pointer"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeSelected(0, 0.25)}
                  aria-label="Move selected furniture forward"
                  className="px-2 py-1.5 text-xs bg-[#EAE4DA]/70 hover:bg-[#EAE4DA] rounded-md cursor-pointer"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeSelected(0.25, 0)}
                  aria-label="Move selected furniture right"
                  className="px-2 py-1.5 text-xs bg-[#EAE4DA]/70 hover:bg-[#EAE4DA] rounded-md cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#64615B]">
                Drag piece in 3D or use arrows
              </span>
              <button
                type="button"
                onClick={handleRemoveSelected}
                aria-label={`Remove ${selectedCatalog.name}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#8B2E2E] hover:bg-[#8B2E2E]/10 rounded-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Save Design Inline Dialog */}
        {saveDialogOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-design-heading"
            className="absolute inset-0 z-30 flex items-center justify-center bg-[#1C1C1B]/55 p-4"
          >
            <form
              onSubmit={handleSaveDesignSubmit}
              className="w-full max-w-md bg-[#FAF9F6] p-6 rounded-xl border border-[#1C1C1B]/14 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 id="save-design-heading" className="font-display text-xl font-medium text-[#1C1C1B]">
                  Save Custom Room Design
                </h3>
                <button
                  type="button"
                  onClick={() => setSaveDialogOpen(false)}
                  aria-label="Close save dialog"
                  className="p-1.5 rounded-md text-[#64615B] hover:text-[#1C1C1B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[#524F4A]">
                Store your furniture layout, wall palette, flooring, and lighting setup locally so you can reload or compare variations anytime.
              </p>

              <label htmlFor="room-design-name" className="block mt-4 text-xs font-medium text-[#1C1C1B]">
                Design Title
              </label>
              <input
                id="room-design-name"
                type="text"
                value={saveName}
                onChange={(e) => {
                  setSaveName(e.target.value);
                  if (saveError) setSaveError('');
                }}
                placeholder="e.g., Hyderabad Villa Evening"
                className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-white border border-[#1C1C1B]/20 rounded-lg text-[#1C1C1B] focus:outline-2 focus:outline-[#1C1C1B]"
              />
              {saveError && (
                <p role="alert" className="mt-1.5 text-xs text-[#8B2E2E]">
                  {saveError}
                </p>
              )}

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSaveDialogOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#524F4A] hover:text-[#1C1C1B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-medium text-[#FAF9F6] bg-[#1C1C1B] rounded-lg hover:bg-[#333230] cursor-pointer"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Collapsible Bottom Control Dock (Zero Center Occlusion) */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(940px,calc(100%-1.5rem))] transition-transform duration-300 ease-out ${
            controlsCollapsed ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'
          }`}
        >
          {/* Dock Collapse Handle */}
          <div className="flex justify-center mb-1.5">
            <button
              type="button"
              onClick={() => setControlsCollapsed((prev) => !prev)}
              aria-expanded={!controlsCollapsed}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-[#1C1C1B] bg-[#FAF9F6]/94 border border-[#1C1C1B]/14 rounded-lg shadow-sm hover:bg-[#FAF9F6] cursor-pointer"
            >
              {controlsCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Show Studio Controls
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Hide Controls (H)
                </>
              )}
            </button>
          </div>

          {/* Dock Body */}
          <div className="bg-[#FAF9F6]/95 border border-[#1C1C1B]/14 rounded-xl shadow-xl p-4">
            {/* Dock Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1C1C1B]/10">
              <div role="tablist" aria-label="3D Studio customization panels" className="flex flex-wrap items-center gap-1">
                <button
                  role="tab"
                  type="button"
                  aria-selected={activeTab === 'furniture'}
                  onClick={() => setActiveTab('furniture')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'furniture'
                      ? 'bg-[#1C1C1B] text-[#FAF9F6]'
                      : 'text-[#524F4A] hover:bg-[#EAE4DA]/60 hover:text-[#1C1C1B]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Furniture ({roomState.furniture.length})
                </button>
                <button
                  role="tab"
                  type="button"
                  aria-selected={activeTab === 'materials'}
                  onClick={() => setActiveTab('materials')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'materials'
                      ? 'bg-[#1C1C1B] text-[#FAF9F6]'
                      : 'text-[#524F4A] hover:bg-[#EAE4DA]/60 hover:text-[#1C1C1B]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Walls & Floor
                </button>
                <button
                  role="tab"
                  type="button"
                  aria-selected={activeTab === 'lighting'}
                  onClick={() => setActiveTab('lighting')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'lighting'
                      ? 'bg-[#1C1C1B] text-[#FAF9F6]'
                      : 'text-[#524F4A] hover:bg-[#EAE4DA]/60 hover:text-[#1C1C1B]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Lighting & Camera
                </button>
                <button
                  role="tab"
                  type="button"
                  aria-selected={activeTab === 'saved'}
                  onClick={() => setActiveTab('saved')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'saved'
                      ? 'bg-[#1C1C1B] text-[#FAF9F6]'
                      : 'text-[#524F4A] hover:bg-[#EAE4DA]/60 hover:text-[#1C1C1B]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Saved Designs ({savedDesigns.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSnapToGrid((prev) => !prev)}
                aria-pressed={snapToGrid}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                  snapToGrid
                    ? 'bg-[#EAE4DA] border-[#1C1C1B]/20 text-[#1C1C1B]'
                    : 'bg-transparent border-[#1C1C1B]/12 text-[#64615B]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Grid Snap: {snapToGrid ? 'On' : 'Off'}
              </button>
            </div>

            {/* Tab Panels */}
            <div className="pt-3 max-h-[168px] overflow-y-auto">
              {activeTab === 'furniture' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {FURNITURE_CATALOG.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => handleAddFurniture(item.type)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1C1C1B] bg-[#EAE4DA]/70 hover:bg-[#EAE4DA] border border-[#1C1C1B]/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#9A7B4F]" />
                        {item.name}
                      </button>
                    ))}
                  </div>

                  {roomState.furniture.length > 0 && (
                    <div className="pt-2 border-t border-[#1C1C1B]/10 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-[#64615B] mr-1">Placed:</span>
                      {roomState.furniture.map((piece) => {
                        const info = getCatalogItem(piece.type);
                        const active = selectedId === piece.id;
                        return (
                          <button
                            key={piece.id}
                            type="button"
                            onClick={() => setSelectedId(piece.id)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                              active
                                ? 'bg-[#1C1C1B] text-[#FAF9F6]'
                                : 'bg-white border border-[#1C1C1B]/10 text-[#524F4A] hover:text-[#1C1C1B]'
                            }`}
                          >
                            {info.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-[#1C1C1B] mb-2">
                      Wall Finish — <span className="text-[#64615B]">{currentWall.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {WALL_COLORS.map((wall) => {
                        const active = roomState.wallColorId === wall.id;
                        return (
                          <button
                            key={wall.id}
                            type="button"
                            onClick={() =>
                              setRoomState((prev) => ({ ...prev, wallColorId: wall.id }))
                            }
                            aria-label={`Wall color ${wall.name}`}
                            aria-pressed={active}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                              active
                                ? 'border-[#1C1C1B] bg-white font-medium text-[#1C1C1B]'
                                : 'border-[#1C1C1B]/12 bg-white/70 text-[#524F4A] hover:border-[#1C1C1B]/30'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-sm border border-[#1C1C1B]/20 shrink-0"
                              style={{ backgroundColor: wall.hex }}
                            />
                            {wall.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#1C1C1B] mb-2">
                      Flooring Material — <span className="text-[#64615B]">{currentFloor.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {FLOOR_MATERIALS.map((floor) => {
                        const active = roomState.floorMaterialId === floor.id;
                        return (
                          <button
                            key={floor.id}
                            type="button"
                            onClick={() =>
                              setRoomState((prev) => ({ ...prev, floorMaterialId: floor.id }))
                            }
                            aria-label={`Flooring ${floor.name}`}
                            aria-pressed={active}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                              active
                                ? 'border-[#1C1C1B] bg-white font-medium text-[#1C1C1B]'
                                : 'border-[#1C1C1B]/12 bg-white/70 text-[#524F4A] hover:border-[#1C1C1B]/30'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-sm border border-[#1C1C1B]/20 shrink-0"
                              style={{ backgroundColor: floor.swatchHex }}
                            />
                            {floor.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'lighting' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-[#1C1C1B] mb-2">
                      Lighting Atmosphere
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: 'day', label: 'Indian Daylight', icon: Sun },
                          { id: 'night', label: 'Architectural Evening', icon: Moon },
                        ] as { id: LightingMode; label: string; icon: typeof Sun }[]
                      ).map((opt) => {
                        const Icon = opt.icon;
                        const active = roomState.lightingMode === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setRoomState((prev) => ({ ...prev, lightingMode: opt.id }))
                            }
                            aria-pressed={active}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#1C1C1B] text-[#FAF9F6] border-[#1C1C1B]'
                                : 'bg-white text-[#524F4A] border-[#1C1C1B]/14 hover:text-[#1C1C1B]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#1C1C1B] mb-2">
                      Camera Viewpoint
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CAMERA_PRESETS.map((preset) => {
                        const active = cameraPresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setCameraPresetId(preset.id)}
                            aria-pressed={active}
                            className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#EAE4DA] text-[#1C1C1B] border-[#1C1C1B]/25'
                                : 'bg-white text-[#524F4A] border-[#1C1C1B]/12 hover:text-[#1C1C1B]'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {savedDesigns.map((design) => {
                    const wall =
                      WALL_COLORS.find((w) => w.id === design.state.wallColorId)?.name ?? 'Custom';
                    const floor =
                      FLOOR_MATERIALS.find((f) => f.id === design.state.floorMaterialId)?.name ??
                      'Custom';
                    return (
                      <div
                        key={design.id}
                        className="flex items-center justify-between gap-3 p-3 bg-white border border-[#1C1C1B]/12 rounded-lg"
                      >
                        <button
                          type="button"
                          onClick={() => handleLoadDesign(design)}
                          className="text-left min-w-0 flex-1 cursor-pointer"
                        >
                          <p className="text-xs font-medium text-[#1C1C1B] truncate">
                            {design.name}
                          </p>
                          <p className="text-[11px] text-[#64615B] truncate mt-0.5">
                            {wall} · {floor} · {design.state.furniture.length} pcs
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedDesign(design.id)}
                          aria-label={`Delete saved design ${design.name}`}
                          className="p-1.5 rounded-md text-[#64615B] hover:text-[#8B2E2E] hover:bg-[#8B2E2E]/10 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
