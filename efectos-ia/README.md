# EFECTOS-IA — Frontend

Interfaz web para analizar audios de guitarra y detectar efectos/procesamiento DSP.

## Inicio rápido

```bash
npm install --legacy-peer-deps
npm run dev          # → http://localhost:5173  (modo mock, sin backend)
npm test             # 63 tests / 8 suites
npm run build        # build de producción
```

## Conectar backend real

```bash
# .env.local
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=false
```

## Contrato POST /analyze

```
multipart/form-data  { file: <audio> }

Response 200:
{
  "effect": "distortion"|"overdrive"|"clean"|"fuzz",
  "confidence": 0.87,
  "parameters": { "gain":72, "tone":45, "bass":38, "mid":55, "treble":62, "reverb":20 },
  "features": { "rms_db":-18.4, "centroid":3200, "bandwidth":2400,
                "flatness":0.35, "zcr":175, "hp_ratio":0.61,
                "onset_count":12, "reverb_ratio":0.18 }
}
```

## Estructura

```
src/
├── api/            client.ts · analyze.ts · mock.ts
├── schemas/        Zod — archivo + response
├── types/          Tipos TypeScript del dominio
├── hooks/          useAnalyze (TanStack) · useHistory (localStorage)
├── utils/          formatters · exportJSON · cn()
├── components/
│   ├── Layout/         AppShell · Header
│   ├── AudioUploader/  Drag-drop + validación
│   ├── WaveformPlayer/ WaveSurfer.js
│   ├── EffectCard/     Hero — efecto + confianza
│   ├── DSPMetrics/     Radar chart + 8 feature cards
│   ├── AnalysisResults/ Knobs SVG + export
│   └── HistoryPanel/   Historial local
└── features/analyzer/  AnalyzerPage — orquesta todo
```
