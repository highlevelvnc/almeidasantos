# Design System Document: Educational Excellence

## 1. Overview & Creative North Star: "The Academic Atelier"
This design system moves away from the sterile, rigid grids of traditional educational software and toward the warmth of a high-end editorial journal. Our Creative North Star is **"The Academic Atelier."** 

This concept treats the digital interface as a curated workspace—a place where student development is nurtured through clarity, breathing room, and intentional layering. We break the "template" look by utilizing asymmetrical white space, overlapping imagery, and a "tonal-first" approach to depth. By prioritizing the relationship between typography and surface, we create a reliable, organized environment that feels premium and bespoke rather than mass-produced.

---

## 2. Colors: Depth Over Definition
Our palette is anchored in a professional, deep blue, but its application is nuanced. We avoid the "blue box" trap by using varied surface tones to create an organic sense of structure.

### The Palette (Material Design Convention)
*   **Primary:** `#002045` (Deep Trustworthy Blue) – The voice of authority.
*   **Surface / Background:** `#f7f9fb` (Soft White) – Our primary canvas.
*   **Tonal Surfaces:** From `surface_container_lowest` (`#ffffff`) to `surface_container_highest` (`#e0e3e5`).

### The "No-Line" Rule
**Lines are forbidden for sectioning.** To separate content, designers must never use a 1px solid border. Boundaries are defined exclusively through:
1.  **Background Shifts:** Placing a `surface_container_low` card on a `background` page.
2.  **Strategic Whitespace:** Using the spacing scale to create distinct visual groups.

### Surface Hierarchy & Nesting
Think of the UI as a series of stacked sheets of fine, heavy-stock paper. 
*   **The Page:** `background` (#f7f9fb).
*   **The Section:** `surface_container` (#eceef0).
*   **The Interaction Point (Card):** `surface_container_lowest` (#ffffff).
This nesting creates a soft, natural hierarchy that guides the eye without the "visual noise" of outlines.

### The "Glass & Gradient" Rule
To add a "soul" to the professional foundation:
*   **Gradients:** Use a subtle linear transition from `primary` (#002045) to `primary_container` (#1a365d) for Hero backgrounds and primary CTAs. This creates a sense of light and dimension.
*   **Glassmorphism:** For floating navigation or modal overlays, use `surface` colors at 80% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Editorial Authority
We utilize a dual-typeface strategy to balance academic rigor with approachable modernism.

*   **Display & Headlines (Manrope):** We use Manrope for all headers. Its geometric yet slightly condensed nature feels modern and architectural. 
    *   *Strategic Use:* Large `display-lg` (3.5rem) should be used with tight letter-spacing (-0.02em) to create a bold, editorial impact.
*   **Body & Labels (Inter):** Inter is used for all functional text. Its high x-height ensures maximum readability for students and parents.
*   **The Scale:**
    *   **Headline-LG (2rem):** Used for section titles to command attention.
    *   **Body-LG (1rem):** The standard for educational content; generous line-height (1.6) is mandatory to prevent eye fatigue.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is a feeling, not a feature. We reject heavy drop shadows in favor of ambient light.

*   **The Layering Principle:** Achieve lift by stacking. A `#ffffff` (lowest) card placed on a `#eceef0` (container) surface creates a "natural" lift.
*   **Ambient Shadows:** If a floating state is required (e.g., a dropdown), use a shadow with a 40px blur, 0% spread, and 6% opacity. The shadow color must be derived from `on_surface` (#191c1e), never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` (#c4c6cf) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Refined Interaction

### Buttons
*   **Primary:** Solid `primary` background. **Corner radius: `xl` (1.5rem)**. This "pill" shape contrasts with the more structured layout to feel welcoming.
*   **Tertiary:** No background or border. Use `primary` text weight 600. Interaction is signaled by a subtle `surface_container_high` background shift on hover.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Lists should use alternating background tints (Zebra striping using `surface` and `surface_container_low`) or simply 24px of vertical whitespace between items.
*   **Imagery:** Educational imagery should always have a `lg` (1rem) corner radius and, where possible, slightly overlap the edge of its container to break the "boxed-in" feel.

### Input Fields
*   **Style:** `surface_container_low` background with no border. On focus, transition to a `primary` "Ghost Border" (20% opacity) and a subtle 2px bottom-stroke in `primary`.

### Specialized Components
*   **Progress Orbs:** Instead of flat bars, use circular rings with `primary` and `surface_variant` to track student development.
*   **Success Toasts:** Use `glassmorphism` with a `tertiary_container` accent to celebrate student achievements warmly.

---

## 6. Do’s and Don'ts

### Do:
*   **Embrace Asymmetry:** Align a headline to the left but push the body text to a narrower, offset column to mimic high-end magazine layouts.
*   **Use High-Quality Imagery:** Use photography with natural lighting and "active learning" subjects.
*   **Prioritize Breathing Room:** If a layout feels "busy," increase the whitespace by 1.5x before removing elements.

### Don’t:
*   **Don't use 100% Black:** Always use `on_surface` (#191c1e) for text to maintain a premium, softened contrast.
*   **Don't use "Standard" Blue:** Avoid the #0000FF hex; stick strictly to our `primary` (#002045) for that "Trustworthy Blue" feel.
*   **Don't crowd the edges:** Elements should never feel "trapped" near the edge of a container; maintain a minimum of `xl` padding for all major containers.