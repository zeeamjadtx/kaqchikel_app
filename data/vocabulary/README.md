# Vocabulary decks (backend only)

Place CSV or JSON files in this folder. The app reads them from the server — **students cannot upload files in the browser**.

## CSV format

One deck per file. Filename becomes the deck title (e.g. `animales-salvajes.csv` → “Animales Salvajes”).

```csv
termino,definicion
Matyöx,Gracias
Jas awäch?,¿Cómo estás?
```

Optional header row with `term` / `definition` is supported.

## JSON format (optional)

```json
{
  "id": "mi-mazo",
  "name": "Mi mazo",
  "vocabulary": [
    { "term": "ja'", "definition": "casa" }
  ]
}
```

## After adding files

1. **Development:** restart `npm run dev` (or refresh practice page — API reloads files on each request).
2. **Production build:** run `npm run sync-decks` before `npm run build`.
