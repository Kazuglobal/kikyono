# Kikyono Violets Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current intro and post-intro landing page with a design that closely matches the approved reference image while preserving the existing Angular app structure.

**Architecture:** Keep the current single-page Angular application and rebuild the presentation layer in place. Use `app.component` for the main page layout, keep `header`, `footer`, and `intro-animation` as separate components, and centralize global visual tokens in `index.html` so the page can be tuned as one cohesive design.

**Tech Stack:** Angular 20, standalone components, template control flow, global CSS in `index.html`, static image assets from `assets/`, existing audio asset for intro.

---

## Implementation Notes

- There is no dedicated automated test suite in this repository today.
- Use `npm run build` as the regression gate after each meaningful task.
- Use manual browser verification for:
  - intro timing
  - desktop layout match
  - mobile stacking and spacing
  - CTA visibility and anchor navigation

### Task 1: Establish the new page data model

**Files:**
- Modify: `src/app.component.ts`

**Step 1: Replace the current page data with reference-driven content**

- Remove data and signals that only support the current design language
- Define the exact arrays needed for the approved layout:
  - navigation items
  - hero CTA labels
  - join-banner badges
  - about gallery images
  - values
  - members by grade
  - achievements
  - weekly schedule rows
  - annual schedule rows
  - testimonials
  - footer contact links

**Step 2: Keep only interaction state still needed**

- Preserve:
  - `showIntro`
  - `activeSectionId`
- Remove state that belongs to the old design, including:
  - parallax-only hero transform
  - oversized letter-by-letter hero title data
  - unused contact form behavior if the new reference no longer uses a full form section

**Step 3: Run the build**

Run: `npm run build`

Expected: build may fail until the template is updated, but TypeScript symbols should stay coherent.

### Task 2: Rebuild the main page layout to match the reference

**Files:**
- Modify: `src/app.component.html`

**Step 1: Replace the current section stack**

- Remove the current sections:
  - large English hero
  - standalone contact form section
  - current testimonials block styling
  - existing values and schedule markup
- Rebuild the page in this order:
  - hero
  - join banner
  - about intro + image grid
  - values cards
  - members and achievements two-column row
  - schedule row
  - member voice row

**Step 2: Use reference-matching semantic wrappers**

- Use `section`, `article`, `header`, `nav`, `figure`, and `address` where appropriate
- Add stable ids for anchor navigation:
  - `home`
  - `about`
  - `activity`
  - `schedule`
  - `achievements`
  - `voice`
  - `join`
  - `contact`

**Step 3: Create the hero markup**

- Left side:
  - large Japanese heading
  - two short supporting paragraphs
  - yellow CTA
  - purple outline CTA
- Right side or background:
  - main team image

**Step 4: Create the join banner markup**

- Left player cutout area
- center title and helper copy
- pill badges beneath copy
- right CTA and secondary player cutout area

**Step 5: Build the content grids**

- About section:
  - left text block
  - right 3-image gallery
- Values section:
  - 3 cards in one row on desktop
- Members / Achievements:
  - members table card on the left
  - trophy cards on the right
- Schedule:
  - weekly schedule card on the left
  - annual schedule card on the right
- Voice:
  - baseball-photo background strip plus 2 voice cards

**Step 6: Run the build**

Run: `npm run build`

Expected: Angular template compiles with the new section structure.

### Task 3: Redesign the fixed header

**Files:**
- Modify: `src/components/header/header.component.ts`
- Modify: `src/components/header/header.component.html`

**Step 1: Simplify header behavior**

- Keep fixed positioning
- Remove the current transparent-to-white scroll aesthetic
- Keep only minimal scroll handling if needed for a compact shadow state

**Step 2: Replace navigation content**

- Update nav labels to match the reference:
  - ホーム
  - チーム紹介
  - 活動内容
  - スケジュール
  - 大会実績
  - 保護者の声
  - 入団案内
  - お問い合わせ

**Step 3: Replace header markup**

- Left:
  - stylized text logo block for `KIKYONO VIOLETS`
- Center:
  - desktop navigation
- Right:
  - yellow rounded CTA
- Mobile:
  - keep collapsible menu, but restyle it to the same palette

**Step 4: Run the build**

Run: `npm run build`

Expected: header compiles and stays fixed without the previous transparent hero dependency.

### Task 4: Redesign the intro animation

**Files:**
- Modify: `src/components/intro-animation/intro-animation.component.ts`
- Modify: `src/components/intro-animation/intro-animation.component.html`

**Step 1: Remove the current black-screen slideshow behavior**

- Delete the current image-loop intro sequence
- Keep the existing `animationFinished` output
- Keep audio support only if it does not complicate the new timing

**Step 2: Replace it with a short branded sequence**

- Phase 1:
  - full-screen violet backdrop
  - centered brand lockup
  - short Japanese tagline
- Phase 2:
  - a fast baseball or light streak motion accent
  - subtle scale or glow on the logo
- Phase 3:
  - fade out the overlay and emit `animationFinished`

**Step 3: Tune intro timing**

- Total duration target: `2000ms` to `2800ms`
- Ensure the main page becomes interactive immediately after fade-out

**Step 4: Run the build**

Run: `npm run build`

Expected: intro compiles and still hands off control cleanly to `AppComponent`.

### Task 5: Replace the footer with the reference-style information footer

**Files:**
- Modify: `src/components/footer/footer.component.ts`
- Modify: `src/components/footer/footer.component.html`

**Step 1: Remove social-share-first behavior**

- Delete share URL logic if it is no longer used
- Replace with simple static contact and social data needed by the reference footer

**Step 2: Rebuild footer markup**

- Left:
  - logo block
  - team description
- Middle:
  - address
  - email
  - social icons
- Right:
  - yellow CTA button
- Bottom:
  - copyright line

**Step 3: Run the build**

Run: `npm run build`

Expected: footer compiles without the old share-link dependencies.

### Task 6: Replace the global visual system

**Files:**
- Modify: `index.html`

**Step 1: Update the base typography**

- Keep Japanese-readable body font
- Add or tune display font usage for logo and headings
- Define CSS custom properties for:
  - violet
  - deep violet
  - gold
  - paper background
  - card border
  - muted text

**Step 2: Delete the old effect-heavy CSS**

- Remove styles tied to:
  - floating blob backgrounds
  - heavy 3D card hover effects
  - oversized letter reveal hero
  - old scroll animation utilities no longer used

**Step 3: Add the new layout system**

- Container width
- section spacing
- card styles
- badge styles
- table styles
- button styles
- desktop/mobile breakpoints
- intro overlay animation keyframes

**Step 4: Add restrained motion**

- Fade-up on section entry
- button hover states
- intro-specific keyframes only

**Step 5: Run the build**

Run: `npm run build`

Expected: all templates render against the new global CSS without missing class dependencies.

### Task 7: Final visual verification and cleanup

**Files:**
- Modify: `src/app.component.ts`
- Modify: `src/app.component.html`
- Modify: `src/components/header/header.component.*`
- Modify: `src/components/footer/footer.component.*`
- Modify: `src/components/intro-animation/intro-animation.component.*`
- Modify: `index.html`

**Step 1: Verify desktop layout**

Check:
- header height and spacing
- hero composition
- join banner proportions
- values card alignment
- member table sizing
- trophy card spacing
- footer balance

**Step 2: Verify mobile layout**

Check:
- stacked hero content order
- CTA visibility without overlap
- image gallery collapse
- schedule cards stacking
- footer readability

**Step 3: Verify intro handoff**

Check:
- no stuck overlay
- no flash of unstyled content
- no delayed pointer recovery

**Step 4: Run final build**

Run: `npm run build`

Expected: PASS

**Step 5: Prepare reviewable result**

- Confirm all modified files are limited to the redesign scope
- Summarize any known gaps between the reference and the implementation
