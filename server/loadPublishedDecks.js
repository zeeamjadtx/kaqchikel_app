import fs from 'fs/promises'
import path from 'path'
import { parseVocabularyCsv } from './parseVocabularyCsv.js'

const VOCABULARY_DIR = path.resolve(process.cwd(), 'data', 'vocabulary')

function deckNameFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '').trim()
  const topicMatch = base.match(/vocabulario de kaqchikel\s+\d+[ab]\s*-\s*(.+)/i)
  if (topicMatch) {
    return topicMatch[1].trim()
  }
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function deckIdFromFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function loadDeckFromCsv(filePath, filename, stats) {
  const text = await fs.readFile(filePath, 'utf-8')
  const vocabulary = parseVocabularyCsv(text).filter((c) => c.term.trim() || c.definition.trim())
  if (vocabulary.length === 0) return null

  return {
    id: deckIdFromFilename(filename),
    name: deckNameFromFilename(filename),
    vocabulary,
    createdAt: stats?.mtime?.toISOString?.() || new Date().toISOString()
  }
}

async function loadDeckFromJson(filePath, filename, stats) {
  const raw = await fs.readFile(filePath, 'utf-8')
  const data = JSON.parse(raw)
  const vocabulary = Array.isArray(data.vocabulary)
    ? data.vocabulary
    : Array.isArray(data)
      ? data
      : []
  const cleaned = vocabulary
    .map((c) => ({
      term: typeof c.term === 'string' ? c.term : '',
      definition: typeof c.definition === 'string' ? c.definition : ''
    }))
    .filter((c) => c.term.trim() || c.definition.trim())

  if (cleaned.length === 0) return null

  return {
    id: data.id ? String(data.id) : deckIdFromFilename(filename),
    name: data.name?.trim() || deckNameFromFilename(filename),
    vocabulary: cleaned,
    createdAt: data.createdAt || stats?.mtime?.toISOString?.() || new Date().toISOString()
  }
}

/**
 * Load all vocabulary decks from data/vocabulary/ (CSV and JSON files).
 * This is the only source of shared decks — not editable from the browser.
 */
export async function loadPublishedDecks() {
  try {
    await fs.mkdir(VOCABULARY_DIR, { recursive: true })
    const entries = await fs.readdir(VOCABULARY_DIR, { withFileTypes: true })
    const decks = []

    for (const entry of entries) {
      if (!entry.isFile()) continue
      const lower = entry.name.toLowerCase()
      if (lower.startsWith('.') || lower === 'readme.md') continue

      const filePath = path.join(VOCABULARY_DIR, entry.name)
      const stats = await fs.stat(filePath)

      try {
        let deck = null
        if (lower.endsWith('.csv')) {
          deck = await loadDeckFromCsv(filePath, entry.name, stats)
        } else if (lower.endsWith('.json')) {
          deck = await loadDeckFromJson(filePath, entry.name, stats)
        }
        if (deck) decks.push(deck)
      } catch (err) {
        console.error(`loadPublishedDecks: skipped ${entry.name}:`, err.message)
      }
    }

    decks.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    return decks
  } catch (err) {
    console.error('loadPublishedDecks:', err)
    return []
  }
}

export function getVocabularyDir() {
  return VOCABULARY_DIR
}
