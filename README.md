# Oxydata Tools — Complete Codex Build Specification

---

## 1. Project Overview

Build a dark-themed, multi-tab web application called **Oxydata Tools** for an AI-powered recruitment platform. The app has three tools accessible via tabs in a single topbar:

1. **JD Clarity Bot** — Analyse a job description using slash commands
2. **Rubric Generator** — Generate a scoring rubric by selecting a job from Manatal
3. **CV Formatter** — Upload a candidate CV and reformat it to the Oxydata standard template

**Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4  
**Backend:** FastAPI on Render  
**Repo:** GitHub (oxysub account)  
**Hosting:** Render (frontend as Static Site, backend as Web Service)

---

## 2. Global Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| Background base | `#0a0a0a` | Page background |
| Surface | `rgba(255,255,255,0.04)` | Cards, panels, inputs |
| Accent cyan | `#06B6D4` | Primary actions, active states |
| Accent violet | `#7C3AED` | Download button |
| Word blue | `#2b579a` | MS Word topbar simulation |
| Navy | `#1A3C5E` | CV heading color |
| Text primary | `#f1f5f9` | Headings |
| Text secondary | `#cbd5e1` | Labels |
| Text muted | `#64748b` | Descriptions |
| Text placeholder | `#2d3f52` | Input placeholders |
| Border default | `rgba(255,255,255,0.1)` | All borders |
| Border emphasis | `rgba(255,255,255,0.18)` | Glass button borders |

### Typography
- Font: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`
- Section labels: `10px`, `font-weight: 600`, `letter-spacing: 0.12em`, `uppercase`, color `#cbd5e1`
- Body: `13px`, `line-height: 1.6`
- All borders: `0.5px` unless specified as `1px` for glass buttons

### Border Radius
- Inputs / small buttons: `10px`
- Cards / panels: `16px`
- Pill badges: `99px`
- Command buttons: `8px`
- CTA buttons: `14px`

---

## 3. Topbar (Shared)

```
[⚡ OXYDATA] | [JD Clarity Bot] [Rubric Generator] [CV Formatter]        [v3.1]
```

| Property | Value |
|---|---|
| Background | `rgba(255,255,255,0.04)` |
| Border bottom | `0.5px solid rgba(255,255,255,0.1)` |
| Padding | `12px 28px` |
| Logo | "⚡ OXYDATA" — `#06B6D4`, `15px`, `font-weight 700`, `letter-spacing 0.08em` |
| Vertical divider | `0.5px`, `18px` tall, `rgba(255,255,255,0.2)` |
| Badge | Version pill — bg `rgba(6,182,212,0.15)`, color `#06B6D4`, border `rgba(6,182,212,0.35)`, `border-radius 99px` |

### Tab Buttons
| State | Style |
|---|---|
| Default | `bg rgba(255,255,255,0.05)`, `border 0.5px solid rgba(255,255,255,0.12)`, `color #64748b`, `border-radius 8px`, `padding 5px 16px`, `font-size 12px` |
| Hover | `bg rgba(255,255,255,0.09)`, `color #94a3b8` |
| Active | `bg rgba(6,182,212,0.15)`, `border rgba(6,182,212,0.4)`, `color #06B6D4` |

Badge version per tab: JD Clarity Bot = `v3.1`, Rubric Generator = `v1.0`, CV Formatter = `v2.0`

---

## 4. Glass Button System

All interactive buttons use Apple-style glass effects:

### Neutral Glass Button (secondary)
```css
background: linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.09) 100%);
border: 1px solid rgba(255,255,255,0.18);
border-top: 1px solid rgba(255,255,255,0.32);
border-bottom: 1px solid rgba(255,255,255,0.06);
border-radius: 14px;
backdrop-filter: blur(6px);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.5);
color: #94a3b8;
font-size: 13px; font-weight: 500;
transition: all 0.2s ease;
```

### Hover → Red Glass
```css
background: linear-gradient(160deg, rgba(220,38,38,0.28) 0%, rgba(185,28,28,0.08) 60%, rgba(220,38,38,0.18) 100%);
border: 1px solid rgba(220,38,38,0.6);
border-top: 1px solid rgba(220,38,38,0.9);
border-bottom: 1px solid rgba(220,38,38,0.3);
box-shadow: inset 0 1px 0 rgba(220,38,38,0.35), 0 2px 12px rgba(220,38,38,0.2);
color: #f87171;
```

### Cyan Glass Button (primary CTA — full width)
```css
background: linear-gradient(160deg, rgba(6,182,212,0.9) 0%, rgba(6,182,212,0.7) 100%);
border: 1px solid rgba(6,182,212,0.9);
border-top: 1px solid rgba(255,255,255,0.3);
border-bottom: 1px solid rgba(6,182,212,0.4);
border-radius: 14px;
color: #0a0a0a;
font-size: 15px; font-weight: 700;
padding: 15px;
box-shadow: 0 4px 24px rgba(6,182,212,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
transition: all 0.2s ease;
```

Hover: brighter gradient, `transform: translateY(-1px)`  
Active: `transform: scale(0.98)`  
Disabled: `opacity: 0.45`

### Cyan Glass Button (outlined — small action)
```css
background: linear-gradient(160deg, rgba(6,182,212,0.28) 0%, rgba(6,182,212,0.08) 60%, rgba(6,182,212,0.18) 100%);
border: 1px solid rgba(6,182,212,0.6);
border-top: 1px solid rgba(6,182,212,0.9);
border-bottom: 1px solid rgba(6,182,212,0.3);
color: #06B6D4;
border-radius: 10px; padding: 9px 13px; font-size: 11px;
box-shadow: inset 0 1px 0 rgba(6,182,212,0.2), 0 2px 12px rgba(6,182,212,0.2);
```

### Violet Glass Button (download)
```css
background: linear-gradient(160deg, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.08) 60%, rgba(124,58,237,0.18) 100%);
border: 1px solid rgba(124,58,237,0.5);
border-top: 1px solid rgba(124,58,237,0.8);
color: #a78bfa;
border-radius: 10px; padding: 6px 13px; font-size: 11px;
```

### Command /slash Buttons (active/selected)
```css
background: linear-gradient(160deg, rgba(6,182,212,0.28) 0%, rgba(6,182,212,0.08) 60%, rgba(6,182,212,0.18) 100%);
border: 1px solid rgba(6,182,212,0.6);
border-top: 1px solid rgba(6,182,212,0.9);
border-bottom: 1px solid rgba(6,182,212,0.3);
```
Active heading color: `#06B6D4`, `text-shadow: 0 0 8px rgba(6,182,212,0.6)`  
Disabled: `opacity: 0.32`, `pointer-events: none`

---

## 5. Status Message Box

Reusable component for success / error / loading feedback:

```
[icon] Message text
```

| State | Background | Border | Color |
|---|---|---|---|
| loading | `rgba(6,182,212,0.08)` | `rgba(6,182,212,0.25)` | `#06B6D4` |
| success | `rgba(5,150,105,0.12)` | `rgba(5,150,105,0.35)` | `#34d399` |
| error | `rgba(220,38,38,0.12)` | `rgba(220,38,38,0.35)` | `#f87171` |

- `border-radius: 10px`, `padding: 12px 16px`, `font-size: 13px`, `font-weight: 500`
- Icon: SVG — checkmark (success), exclamation circle (error), clock (loading)
- Hidden by default (`display: none`), shown programmatically

---

## 6. Tab 1 — JD Clarity Bot

### Layout
Two-column grid: `grid-template-columns: 1.1fr 1fr`

### Left Panel
- **Section label:** "JOB DESCRIPTION"
- **Textarea:** `height: 446px`, glass input style, placeholder text, live character count below right-aligned
- **Section label:** "SELECT COMMAND"
- **Command grid:** `grid-template-columns: repeat(4, 1fr)`, `gap: 8px`
- **Action row:** "Run Analysis" (cyan CTA, flex: 1) + "Clear" (neutral glass)

### Command Buttons (8 total)
| Command | Description | State |
|---|---|---|
| `/full` | Full analysis: summary, score, table, questions, risks | Active by default |
| `/questions` | HM + TA sourcing questions | Enabled |
| `/client` | Live intake view for screen share with client | Enabled |
| `/export` | Excel: Internal, Client View, Questions | Enabled |
| `/upload` | Upload filled Excel — merges Client Importance | **Disabled** |
| `/update` | Re-analyse after /upload with client feedback merged | **Disabled** |
| `/finalize` | Rewrite JD professionally | **Disabled** |
| `/help` | Show all commands | Enabled |

Only one command active at a time (scoped to this tab's grid).

### Right Panel
- Output header: cyan dot indicator + "Output" label
- Output box: `min-height: 460px`, glass surface, centered empty state (document icon + title + subtitle)

---

## 7. Tab 2 — Rubric Generator

### Layout
Centered card: `max-width: 700px`, `padding: 32px`, `gap: 24px`  
Card: `bg rgba(255,255,255,0.03)`, `border 0.5px solid rgba(255,255,255,0.09)`, `border-radius: 16px`

### Card Header
- Icon box: `44×44px`, cyan tint (`rgba(6,182,212,0.1)`), grid SVG icon in `#06B6D4`
- Title: "Rubric Generator" — `16px`, `font-weight: 600`, `color: #f1f5f9`
- Subtitle: "Select a job to generate its scoring rubric" — `12px`, `color: #475569`

### Job ID Field
- **Label:** "JOB ID"
- **Search input** with magnifier icon (left-padded `34px`)
  - Placeholder: "Search by Job ID, name or client..."
  - `autocomplete: off`
- **Dropdown** (appears on focus/input):
  - Dark bg `#111827`, `border-radius: 10px`, `box-shadow: 0 8px 24px rgba(0,0,0,0.6)`
  - Max height `200px`, scrollable
  - Each row: 3-column grid — `80px | 1fr | 1fr`
    - Job ID: `11px`, `font-weight: 700`, `color: #06B6D4`, monospace
    - Job Name: `12px`, `color: #e2e8f0`
    - Client: `11px`, `color: #64748b`
  - Hover/selected row: `background: rgba(6,182,212,0.1)`
  - Clicking outside closes dropdown
- **Job detail pills** (shown after selection, hidden by default):
  - Two pills side by side: "Job Name" + "Client"
  - Pill style: `bg rgba(255,255,255,0.04)`, `border 0.5px`, `border-radius: 8px`, `padding: 8px 14px`
  - Label: `9px`, uppercase, `color: #475569`
  - Value: `13px`, `font-weight: 500`, `color: #f1f5f9`
- **"Refresh from Manatal" button** — sits beside the search input (flex row), small cyan-on-hover glass button with refresh SVG icon

### Job Data Structure (replace with Manatal API in production)
```typescript
interface Job {
  id: string;        // 7-char alphanumeric e.g. "TT20001"
  name: string;      // e.g. "Senior Software Engineer"
  client: string;    // e.g. "Petronas Digital Sdn Bhd"
}
```
Dropdown filters by `id`, `name`, or `client` on keystroke.

### Status Box
Shared component — shown below job field after actions.

### Generate Rubric Button
- Full-width solid cyan CTA button
- Label: "Generate Rubric" with play SVG icon
- On click: validate job selected → show loading status → simulate/call API → show success/error
- Button disables and shows "Generating..." while processing

---

## 8. Tab 3 — CV Formatter

### Layout
Two-column grid: `grid-template-columns: 340px 1fr`

### Left Panel (340px fixed)
- **Heading:** "CV Formatter" + subtitle
- **Candidate Name:** standard glass input, placeholder "e.g. Ahmad Faizal bin Ismail"
- **Original CV upload zone:**
  - Dashed border `rgba(255,255,255,0.15)`, `border-radius: 12px`, `padding: 24px`
  - Centered: upload icon box + "Click to upload CV" label + "PDF or DOCX — max 10MB" hint
  - On file selected: border becomes solid cyan, icon turns cyan, label shows filename
  - Accepts: `.pdf`, `.docx`, `.doc`
  - On hover: `bg rgba(6,182,212,0.05)`, `border-color rgba(6,182,212,0.4)`
- **Format CV button:** full-width solid cyan CTA, pencil/edit SVG icon
  - Validates: name required + file required
  - On click: shows loading → success/error status
  - Disables and shows "Formatting..." while processing
- **Status box:** shown below button

### Right Panel
**IMPORTANT:** The output dot indicator and Download button must be **siblings** of the output box — never children inside it. This prevents null reference errors when innerHTML is replaced.

```html
<!-- Correct structure -->
<div class="cvf-right">
  <div class="cvf-output-header">          <!-- SIBLING — never wiped -->
    <div id="cvDot" class="cvf-dot"></div>
    <button id="btnDl" class="btn-dl">Download .docx</button>
  </div>
  <div id="cvOutputBox" class="cvf-output-box">   <!-- This gets content replaced -->
    <div id="cvEmpty">...</div>            <!-- Hidden on format -->
    <div id="cvPreview">...</div>          <!-- Shown on format -->
  </div>
</div>
```

- Output dot: `7×7px`, `border-radius: 50%`, default `#334155` → active `#06B6D4` with glow
- Download .docx button: violet glass, hidden by default, shown after format
- Output box: `border-radius: 12px`, `min-height: 500px`, glass surface

### Empty State
- Document icon + "No CV formatted yet" + subtitle
- Hidden when formatted CV is shown

### MS Word WYSIWYG Preview
When Format CV completes, render inside `#cvPreview` (do NOT replace `#cvOutputBox.innerHTML`):

#### 1. Word Topbar (blue `#2b579a`, height `38px`)
- "W" logo box (white bg, blue text, `border-radius: 3px`)
- "Word" label (white, `font-weight: 600`)
- "— Read View" (muted)
- Filename: `CV_{CandidateName}_Formatted.docx`
- Right side: "Edit in Browser" (glass) + "Open in Word" (white/blue solid) buttons

#### 2. Ribbon Tabs (`background: #f3f2f1`)
Tabs: File, **Home** (active — `color: #2b579a`, `border-bottom: 2px solid #2b579a`), Insert, Layout, References, Review, View

#### 3. Ribbon Bar (white, `border-bottom: 1px solid #c8c6c4`)
- Font selector (Calibri), size selector (11)
- Bold / Italic / Underline buttons
- Style pills: Normal (active, blue tint) / Heading 1 / Heading 2

#### 4. Grey Canvas (`background: #b0aea9`, scrollable)
A4 white page (`max-width: 560px`, `box-shadow: 0 2px 12px rgba(0,0,0,0.3)`, `padding: 48px 56px`):
- **Font:** Calibri/Arial, `10.5pt`, `line-height: 1.4`
- **Name:** `18pt`, `font-weight: 700`, `color: #1A3C5E`, uppercase
- **Contact line:** `8.5pt`, `color: #444`, `border-bottom: 2pt solid #1A3C5E`
- **Section headings:** `8.5pt`, `font-weight: 700`, `color: #1A3C5E`, uppercase, `letter-spacing: 0.12em`, `border-bottom: 0.75pt solid #aaa`
- **Job title:** `10.5pt`, `font-weight: 700`
- **Company:** `9.5pt`, `color: #2b579a`, `font-weight: 600`
- **Date:** right-aligned, `8.5pt`, `color: #666`
- **Bullets:** `padding-left: 17px`, `font-size: 10pt`
- **Skills table:** 3-column, bullet points, `font-size: 10pt`
- **Footer:** "Formatted by Oxydata CV Formatter · Tech Talent Sdn Bhd · Confidential" — `7.5pt`, `color: #bbb`, centered, `border-top: 0.5pt solid #ddd`

#### 5. Status Bar (blue `#2b579a`, height ~24px)
- "Page 1 of 1" (white, bold) | word count | "English (Malaysia)" | "100%"

---

## 9. API Integration Points

### Rubric Generator
```
POST /api/generate-rubric
Body: { job_id: string, job_name: string, client: string }
Response: { success: boolean, rubric_url: string, message: string }
```

### CV Formatter
```
POST /api/format-cv
Body: FormData — { candidate_name: string, cv_file: File }
Response: { success: boolean, docx_url: string, message: string }
```

### Manatal Job Fetch
```
GET /api/manatal/jobs
Response: { jobs: Array<{ id: string, name: string, client: string }> }
```

All API calls go through `/app/api/` route handlers in Next.js (never expose Manatal API keys to client).

---

## 10. File Structure

```
frontend/
├── app/
│   ├── tools/
│   │   └── page.tsx              ← Main tools page (renders ToolsShell)
│   └── api/
│       ├── generate-rubric/
│       │   └── route.ts
│       ├── format-cv/
│       │   └── route.ts
│       └── manatal/
│           └── jobs/
│               └── route.ts
├── components/
│   ├── tools/
│   │   ├── ToolsShell.tsx        ← Tab switching logic
│   │   ├── JDClarityBot.tsx      ← Tab 1
│   │   ├── RubricGenerator.tsx   ← Tab 2
│   │   └── CVFormatter.tsx       ← Tab 3
│   └── shared/
│       ├── GlassButton.tsx
│       ├── GlassInput.tsx
│       ├── StatusBox.tsx
│       ├── CommandButton.tsx
│       └── WordPreview.tsx       ← MS Word WYSIWYG mockup
└── styles/
    └── tokens.ts                 ← All color/spacing tokens
```

---

## 11. Codex Prompt — Paste This Directly

```
Build a dark-themed multi-tab web app called "Oxydata Tools" using Next.js 14 
App Router, TypeScript, and Tailwind CSS v4.

GLOBAL:
- Background: #0a0a0a, accent: #06B6D4 (cyan), font: SF Pro Display / system-ui
- All borders 0.5px unless glass buttons (1px)
- Border radius: 8px commands, 10px inputs, 14px CTAs, 16px cards, 99px pills

TOPBAR:
- Logo: ⚡ OXYDATA in #06B6D4
- Three tabs: JD Clarity Bot | Rubric Generator | CV Formatter
- Tab active: bg rgba(6,182,212,0.15), border rgba(6,182,212,0.4), color #06B6D4
- Badge pill (top right): version per tab — v3.1 / v1.0 / v2.0

GLASS BUTTONS (all buttons use these effects):
- Neutral: linear-gradient tri-stop white, bright top border, dim bottom, backdrop-filter blur(6px), inset highlight, deep shadow
- Hover: dark red glass — rgba(220,38,38) gradient with red borders
- Primary CTA: solid cyan gradient, color #0a0a0a, font-weight 700
- Active /command: cyan glass tint with cyan borders and glow
- Disabled: opacity 0.32, pointer-events none
- Transition: all 0.2s ease

TAB 1 — JD CLARITY BOT:
- Two-column layout (1.1fr 1fr)
- Left: textarea (h:446px) + 8 command buttons in 4-col grid + Run Analysis/Clear buttons
- Commands: /full (active), /questions, /client, /export, /upload(disabled), /update(disabled), /finalize(disabled), /help
- Right: output panel with empty state

TAB 2 — RUBRIC GENERATOR:
- Centered card (max-width 700px)
- Job ID: keyword search input with live dropdown showing Job ID | Job Name | Client in 3 columns
- After selection: show two detail pills (Job Name, Client)
- Beside search: "Refresh from Manatal" small glass button
- Status message box (loading/success/error)
- Full-width "Generate Rubric" CTA button

TAB 3 — CV FORMATTER:
- Two-column layout (340px fixed | 1fr)
- Left: Candidate Name input + CV file upload zone (PDF/DOCX) + Format CV CTA button + status box
- Right: output header with dot indicator + download button (OUTSIDE and ABOVE output box)
  then output box containing: empty state div + preview div
- On format: hide empty state, show MS Word WYSIWYG preview inside preview div
- Word preview: blue topbar (W logo, filename, Edit/Open buttons) + ribbon tabs + toolbar + grey canvas + A4 white page (Calibri font, navy #1A3C5E headings, CV content) + blue status bar

CRITICAL RULE — CV Formatter:
The cvDot and btnDownload elements must be SIBLINGS of cvOutputBox, 
never children inside it. renderWordPreview() must only update innerHTML 
of the preview div inside cvOutputBox, never replace cvOutputBox.innerHTML 
directly. This prevents null reference errors.

ENVIRONMENT:
- All API calls through /app/api/ route handlers (never expose keys to client)
- Backend: FastAPI on Render
- Use environment variables for all API keys
- Always use python3 not python in any scripts
```

---

## 12. Critical Rules for Codex

1. **Never** replace `cvOutputBox.innerHTML` directly — only update the `cvPreview` div inside it
2. **Never** put `cvDot` or `btnDownload` inside `cvOutputBox`
3. **Always** scope command button active state to the current tab's grid only
4. **Always** use `addEventListener` in script — never inline `onclick` on dynamic elements
5. **Always** keep all JS in one script block — no fragmented `<script>` tags
6. Status boxes for Rubric Generator and CV Formatter are **separate elements** with separate IDs
7. Tab switching uses `classList.add/remove('active')` — never `style.display` toggling
8. Search dropdown closes on `document.addEventListener('click')` checking `e.target.closest()`
