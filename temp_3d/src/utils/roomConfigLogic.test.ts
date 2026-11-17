import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addFurniturePiece,
  buildWhatsAppUrl,
  clampFurniturePosition,
  createSavedDesign,
  filterProjectsByCategory,
  parseSavedDesigns,
  rotateFurnitureAngle,
  validateInquiryForm,
  validateRoomDesignName,
} from './roomConfigLogic';
import {
  DEFAULT_ROOM_STATE,
  INITIAL_SAVED_DESIGNS,
  PROJECTS,
} from '../data/studioData';

test('clampFurniturePosition keeps sofa strictly within room bounds', () => {
  const clamped = clampFurniturePosition(99, -99, 'boucle-sofa', 0, false);
  assert.ok(clamped.x <= 4.3 - 1.3);
  assert.ok(clamped.z >= -3.4 + 0.525);
});

test('clampFurniturePosition snaps to 0.25m architectural grid when enabled', () => {
  const snapped = clampFurniturePosition(0.37, -0.61, 'coffee-table', 0, true);
  assert.equal(snapped.x, 0.25);
  assert.equal(snapped.z, -0.5);
});

test('rotateFurnitureAngle wraps cleanly between 0 and 2*PI', () => {
  const r1 = rotateFurnitureAngle(0, 90);
  assert.ok(Math.abs(r1 - Math.PI / 2) < 0.001);
  const r2 = rotateFurnitureAngle(0, -45);
  assert.ok(Math.abs(r2 - (7 * Math.PI) / 4) < 0.001);
});

test('addFurniturePiece appends a uniquely identified piece within bounds', () => {
  const { nextList, addedId } = addFurniturePiece(DEFAULT_ROOM_STATE.furniture, 'lounge-chair');
  assert.equal(nextList.length, DEFAULT_ROOM_STATE.furniture.length + 1);
  const added = nextList.find((p) => p.id === addedId);
  assert.ok(added);
  assert.equal(added.type, 'lounge-chair');
});

test('filterProjectsByCategory filters accurately and preserves All', () => {
  const all = filterProjectsByCategory(PROJECTS, 'All');
  assert.equal(all.length, PROJECTS.length);
  const kitchens = filterProjectsByCategory(PROJECTS, 'Kitchens');
  assert.equal(kitchens.length, 1);
  assert.equal(kitchens[0].id, 'casa-brera');
});

test('saved design validation and serialization round-trip', () => {
  assert.equal(validateRoomDesignName(' ').valid, false);
  assert.equal(validateRoomDesignName('Oslo Penthouse').valid, true);

  const saved = createSavedDesign('Oslo Penthouse', DEFAULT_ROOM_STATE);
  const serialized = JSON.stringify([saved]);
  const parsed = parseSavedDesigns(serialized, INITIAL_SAVED_DESIGNS);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].name, 'Oslo Penthouse');

  const malformed = parseSavedDesigns('{not-json', INITIAL_SAVED_DESIGNS);
  assert.equal(malformed.length, INITIAL_SAVED_DESIGNS.length);
});

test('validateInquiryForm rejects invalid inputs and accepts complete inquiries', () => {
  const bad = validateInquiryForm({
    name: '',
    email: 'not-an-email',
    projectType: '',
    preferredDate: '',
    message: 'hi',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.name);
  assert.ok(bad.errors.email);
  assert.ok(bad.errors.projectType);
  assert.ok(bad.errors.message);

  const good = validateInquiryForm({
    name: 'Soren Lindqvist',
    email: 'soren@nordhus.example',
    projectType: 'Residential Interiors',
    preferredDate: '2026-12-01',
    message: 'Full penthouse architectural renovation in Copenhagen.',
  });
  assert.equal(good.valid, true);
  assert.deepEqual(good.errors, {});
});

test('buildWhatsAppUrl encodes client name and project type cleanly', () => {
  const url = buildWhatsAppUrl({ name: 'Freja Holm', projectType: 'Modular Kitchens' });
  assert.ok(url.startsWith('https://wa.me/4533142090?text='));
  assert.ok(url.includes('Freja%20Holm'));
  assert.ok(url.includes('Modular%20Kitchens'));
});
