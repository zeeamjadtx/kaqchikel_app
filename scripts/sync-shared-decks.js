import fs from 'fs/promises'
import path from 'path'
import { loadPublishedDecks } from '../server/loadPublishedDecks.js'

const outPath = path.resolve(process.cwd(), 'public', 'shared-decks.json')

const decks = await loadPublishedDecks()
await fs.writeFile(outPath, `${JSON.stringify(decks, null, 2)}\n`)
console.log(`Wrote ${decks.length} deck(s) to public/shared-decks.json`)
