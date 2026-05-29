const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

function isHeaderLine(line) {
  const n = normalize(line)
  const hasTerm = n.includes('termino') || n.includes('term')
  const hasDef = n.includes('definicion') || n.includes('definition')
  return hasTerm && hasDef
}

/** Parse CSV text into { term, definition } rows (server-side). */
export function parseVocabularyCsv(text) {
  const lines = text.split('\n').filter((line) => line.trim())
  const vocabulary = []
  const startIndex = lines[0] && isHeaderLine(lines[0]) ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = []
    let current = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    parts.push(current.trim())

    if (parts.length >= 2) {
      vocabulary.push({
        term: parts[0].replace(/^"|"$/g, ''),
        definition: parts.slice(1).join(',').replace(/^"|"$/g, '')
      })
    } else if (parts.length === 1 && parts[0]) {
      vocabulary.push({
        term: parts[0].replace(/^"|"$/g, ''),
        definition: ''
      })
    }
  }

  return vocabulary
}
