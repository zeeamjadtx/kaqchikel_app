/** Accent-fold + lowercase for matching Kaqchikel terms (köj → koj, b'alam → balam). */
export function normalizeAnimalTermKey(term) {
  return String(term || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[''`]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Term celebrations with drawings in public/animals/ or public/fruits/.
 * animation selects the CSS dance style. Celebration only appears if the PNG loads.
 */
const ANIMAL_CELEBRATIONS = [
  {
    id: 'koj',
    terms: ['koj', 'leon'],
    imageSrc: '/animals/koj.png',
    fallbackSrc: '/lion-celebration.png',
    animation: 'lion',
    label: '¡Köj!'
  },
  {
    id: 'balam',
    terms: ['balam', 'tigre'],
    imageSrc: '/animals/balam.png',
    animation: 'tiger',
    label: '¡B\'alam!'
  },
  {
    id: 'utiw',
    terms: ['utiw', 'coyote'],
    imageSrc: '/animals/utiw.png',
    animation: 'coyote',
    label: '¡Utiw!'
  },
  {
    id: 'nimaqul',
    terms: ['nimaqul', 'cocodrilo'],
    imageSrc: '/animals/nimaqul.png',
    animation: 'crocodile',
    label: '¡Nimaq\'ul!'
  },
  {
    id: 'tix',
    terms: ['tix', 'elefante'],
    imageSrc: '/animals/tix.png',
    animation: 'elephant',
    label: '¡Tix!'
  },
  {
    id: 'ixpach',
    terms: ['ixpach', 'lagartija'],
    imageSrc: '/animals/ixpach.png',
    animation: 'lizard',
    label: '¡Ixpa\'ch!'
  },
  {
    id: 'oxox',
    terms: ['oxox', 'oso'],
    imageSrc: '/animals/oxox.png',
    animation: 'bear',
    label: '¡Oxox!'
  },
  {
    id: 'par',
    terms: ['par', 'zorillo'],
    imageSrc: '/animals/par.png',
    animation: 'skunk',
    label: '¡Par!'
  },
  {
    id: 'batz',
    terms: ['batz', 'mono'],
    imageSrc: '/animals/batz.png',
    animation: 'monkey',
    label: '¡B\'atz\'!'
  },
  {
    id: 'koy',
    terms: ['koy', 'mico'],
    imageSrc: '/animals/koy.png',
    animation: 'monkey',
    label: '¡K\'oy!'
  },
  {
    id: 'kumatz',
    terms: ['kumatz', 'serpiente'],
    imageSrc: '/animals/kumatz.png',
    animation: 'snake',
    label: '¡Kumatz!'
  },
  {
    id: 'masat',
    terms: ['masat', 'venado'],
    imageSrc: '/animals/masat.png',
    animation: 'deer',
    label: '¡Masat!'
  }
]

/** Frutas deck — Spanish term + Kaqchikel definition aliases; images in public/fruits/{id}.png */
const FRUIT_CELEBRATIONS = [
  { id: 'coco', terms: ['coco', 'wachxan'], imageSrc: '/fruits/coco.png', animation: 'fruit-bounce', label: '¡Coco!' },
  { id: 'banano', terms: ['banano', 'saqul'], imageSrc: '/fruits/banano.png', animation: 'fruit-sway', label: '¡Banano!' },
  { id: 'durazno', terms: ['durazno', 'turas'], imageSrc: '/fruits/durazno.png', animation: 'fruit-bounce', label: '¡Durazno!' },
  { id: 'limon', terms: ['limon', 'limonix'], imageSrc: '/fruits/limon.png', animation: 'fruit-wobble', label: '¡Limón!' },
  { id: 'pina', terms: ['pina', 'chop'], imageSrc: '/fruits/pina.png', animation: 'fruit-sway', label: '¡Piña!' },
  { id: 'melon', terms: ['melon', 'qanaqoq'], imageSrc: '/fruits/melon.png', animation: 'fruit-wobble', label: '¡Melón!' },
  { id: 'aguacate', terms: ['aguacate', 'oj'], imageSrc: '/fruits/aguacate.png', animation: 'fruit-bounce', label: '¡Aguacate!' },
  { id: 'papaya', terms: ['papaya', 'kaqrab'], imageSrc: '/fruits/papaya.png', animation: 'fruit-sway', label: '¡Papaya!' },
  { id: 'manzana', terms: ['manzana', 'nimamixku'], imageSrc: '/fruits/manzana.png', animation: 'fruit-wobble', label: '¡Manzana!' },
  { id: 'mango', terms: ['mango', 'qanatzub'], imageSrc: '/fruits/mango.png', animation: 'fruit-bounce', label: '¡Mango!' },
  { id: 'anona', terms: ['anona', 'pak'], imageSrc: '/fruits/anona.png', animation: 'fruit-wobble', label: '¡Anona!' },
  { id: 'naranja', terms: ['naranja', 'aranazo'], imageSrc: '/fruits/naranja.png', animation: 'fruit-wobble', label: '¡Naranja!' },
  { id: 'fresa', terms: ['fresa', 'saqatokan'], imageSrc: '/fruits/fresa.png', animation: 'fruit-bounce', label: '¡Fresa!' },
  { id: 'sandia', terms: ['sandia', 'kaqaqoq'], imageSrc: '/fruits/sandia.png', animation: 'fruit-sway', label: '¡Sandía!' }
]

const TERM_LOOKUP = new Map()
for (const entry of [...ANIMAL_CELEBRATIONS, ...FRUIT_CELEBRATIONS]) {
  for (const t of entry.terms) {
    TERM_LOOKUP.set(t, entry)
  }
}

export function getAnimalCelebration(term) {
  const raw = normalizeAnimalTermKey(term).replace(/^(el|la|los|las|un|una)\s+/i, '').trim()
  return TERM_LOOKUP.get(raw) || null
}

/** Same lookup (animals + fruits). */
export const getCelebration = getAnimalCelebration

/** @deprecated Use getAnimalCelebration */
export function isLionCelebrationTerm(term) {
  const animal = getAnimalCelebration(term)
  return animal?.id === 'koj'
}

export function getAnimalDanceClass(animation) {
  return `animate-animal-dance-${animation || 'lion'}`
}
