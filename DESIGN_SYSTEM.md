# Smart Campus AI — Design System Specification

## 1. Philosophy & Brand Identity
- **Craft Level**: High-density, utilitarian SaaS (inspired by Linear, Notion, Raycast).
- **AI Stance**: AI is a backend utility, not a decorative theme. No generic robot avatars, no sparkle/star icons, no floating widgets, no purple-to-blue gradient combos.
- **Color Discipline**: Strict Zero-Gradients policy. Every single color token is a flat, solid hex value.

---

## 2. Palette: "Warm Signal" (Committed Direction)

| Token Name | Hex Value | Usage |
|---|---|---|
| `bg-primary` (Dark) | `#161512` | Main viewport canvas & sidebar background |
| `bg-surface` | `#1C1B17` | Card surfaces, modal bodies, table rows |
| `bg-surface-elevated` | `#24221E` | Hover states, dropdown menus, elevated panels |
| `text-primary` | `#F2F0EA` | Primary headlines, task titles, active labels |
| `text-secondary` | `#A6A29A` | Subtext, metadata values, form labels |
| `text-muted` | `#6E6A62` | Timestamps, borders labels, disabled states |
| `border-subtle` | `#2B2924` | Default card borders, structural dividers |
| `border-strong` | `#3D3A33` | Interactive borders, focus states, active tabs |
| `accent-primary` | `#FF5A1F` | Primary CTAs, active tab indicators, urgent badges |
| `accent-primary-hover` | `#E04B14` | Hover state for primary buttons |
| `accent-success` | `#0B6E4F` | Completed tasks, eligible status, high profile match |
| `accent-critical` | `#D9402B` | Critical/overdue deadlines, strict warnings |
| `accent-warning` | `#D97706` | Approaching deadlines, moderate priority |

---

## 3. Typography & Scale
- **Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Scale**:
  - `Display / H1`: 20px (1.25rem), weight 600, letter-spacing -0.02em
  - `Section / H2`: 16px (1.0rem), weight 600, letter-spacing -0.015em
  - `Card Title / H3`: 14px (0.875rem), weight 600, letter-spacing -0.01em
  - `Body / Default`: 13px (0.8125rem), weight 400, line-height 1.5
  - `Small / Metadata`: 11px–12px, weight 500
  - `Micro / Badges`: 10px, weight 600, uppercase, tracking +0.04em

---

## 4. Spacing & Radius System
- **Base Grid**: 8px baseline (`space-1` = 4px, `space-2` = 8px, `space-3` = 12px, `space-4` = 16px, `space-6` = 24px, `space-8` = 32px)
- **Border Radius**:
  - `Cards / Panels / Modals`: `8px` (`rounded-lg` / `rounded-[8px]`)
  - `Buttons / Inputs / Dropdowns`: `6px` (`rounded-[6px]`)
  - `Badges / Avatars / Pills`: `9999px` (`rounded-full`)

---

## 5. Component Standards
- **Buttons**:
  - Primary: Solid `#FF5A1F` fill, white text, 6px radius, no glow, no gradients.
  - Secondary: Neutral `#24221E` background, 1px `#2B2924` border, `#F2F0EA` text.
- **Urgency Tags**:
  - Solid color-coded badge tags (e.g. Critical = solid `#D9402B`/15 text `#F87171` border `#D9402B`/40).
- **Task Cards**:
  - Solid left border accent indicator (Critical = `#D9402B`, High = `#FF5A1F`, Normal = `#2B2924`).
  - 1px neutral border (`#2B2924`) with hover shift to `#3D3A33`.
- **RAG Chat Panel**:
  - Neutral surface background (`#161512` / `#1C1B17`), neutral user message boxes (`#FF5A1F`), neutral assistant message boxes (`#1C1B17` + `#2B2924` border).
  - No chatbot avatars or sparkling icons; clean functional terminal/query iconography.
