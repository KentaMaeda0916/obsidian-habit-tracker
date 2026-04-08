# Habit Tracker for Obsidian

Un plugin de seguimiento de hábitos simple y enfocado para [Obsidian](https://obsidian.md). Un toque para registrar tus hábitos diarios. Los datos se guardan como archivos Markdown planos, totalmente compatibles con [Dataview](https://github.com/blacksmithgu/obsidian-dataview).

**Otros idiomas:** [English](README.md) | [日本語](README.ja.md) | [中文](README.zh.md) | [한국어](README.ko.md)

---

## Características

- **Check-in con un toque** — marca o desmarca los hábitos de hoy al instante
- **Racha de días** — visualiza tus días consecutivos en tiempo real 🔥
- **Archivo Markdown por hábito** — cada hábito genera su propio `.md` con un calendario DataviewJS integrado
- **Dashboard autogenerado** — al primer inicio se crea un resumen en `habits/stats/dashboard.md`
- **Compatible con Dataview** — consulta tus datos de hábitos con cualquier bloque Dataview o DataviewJS
- **Multiplataforma** — panel lateral en escritorio, pestaña a pantalla completa en iOS/móvil
- **Sin dependencias** — funciona sin Dataview instalado (Dataview necesario para el calendario y dashboard)

## Instalación

### Desde Plugins de Comunidad (recomendado)
1. Abre Ajustes de Obsidian → Plugins de Comunidad
2. Busca **Habit Tracker**
3. Instala y activa

### Instalación manual
1. Descarga `main.js`, `manifest.json` y `styles.css` desde la [última versión](https://github.com/KentaMaeda0916/obsidian-habit-tracker/releases/latest)
2. Cópialos a `.obsidian/plugins/habit-tracker/`
3. Actívalo en Ajustes → Plugins de Comunidad

## Uso

1. El panel **Habit Tracker** se abre automáticamente al iniciar (barra lateral en escritorio, pestaña en móvil)
2. Toca **+ Añadir hábito** para crear un nuevo hábito
3. Toca un checkbox para alternar la compleción de hoy
4. Cada archivo de hábito se crea en `habits/tracker/<nombre>.md` con calendario DataviewJS
5. El dashboard resumen se autogenera en `habits/stats/dashboard.md`

## Estructura de archivos

```
habits/
├── tracker/
│   ├── Ejercicio.md    ← un archivo por hábito (frontmatter + calendario DataviewJS)
│   └── Lectura.md
└── stats/
    └── dashboard.md    ← dashboard resumen autogenerado
```

## Formato del archivo de hábito

```markdown
---
habit: "Ejercicio"
description: "30 min"
created: 2026-01-01
completions:
  - 2026-04-07
  - 2026-04-08
---
```

## Ejemplos de consultas Dataview

```dataview
TABLE habit, length(completions) AS Total
FROM "habits/tracker"
SORT length(completions) DESC
```

## Ajustes

| Ajuste | Descripción | Valor por defecto |
|---|---|---|
| Carpeta de hábitos | Ruta donde se guardan los archivos de hábitos | `habits/tracker` |

## Licencia

MIT © [maedakenta](https://github.com/maedakenta)
