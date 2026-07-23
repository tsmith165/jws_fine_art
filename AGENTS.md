# JWS Fine Art Project Guide

## Artwork image fidelity

Artwork is the product. Treat visible softness, grain introduced by delivery, incorrect color, and a placeholder that remains blurred as release-blocking defects.

- Public hero, catalog, collection, and detail images must render from the original `image_path` (or equivalent full source). `small_image_path` is only for a temporary blurred placeholder or an intentionally tiny owner-tool thumbnail.
- Use `CATALOG_ARTWORK_IMAGE_POLICY` for public catalog and collection cards. Do not lower its declared slot size or quality without desktop and mobile network plus screenshot evidence.
- Every `next/image` using `fill` must have a truthful `sizes` value. During QA, compare the requested `_next/image?...&w=` width with the rendered image width multiplied by device pixel ratio.
- CSS blur belongs only on the placeholder layer. The final artwork layer must not use blur, sharpening, saturation, contrast, or other fidelity-altering filters.
- Progressive loading must recover from an optimizer failure by retrying the original source. Never allow a blurred placeholder to become the terminal successful state.
- Do not hide a low-resolution source with CSS or client-side upscaling. Flag it for a higher-resolution studio upload. Public originals should normally be at least 1200 px on the long edge and 900 px on the short edge.

## Required image QA

Before shipping a change to artwork image selection, sizing, optimization, or animation:

1. Check representative landscape, portrait, and framed pieces on both `/` and `/work`, plus one matching detail page.
2. Verify desktop and mobile layouts, final-layer opacity, `currentSrc`, request width, rendered dimensions, device pixel ratio, and failed image requests.
3. Inspect saved screenshots at original detail with the project visual-QA workflow. Do not call an image sharp based only on DOM state.
4. Keep fidelity and transfer size in balance. Prefer a bounded shared size policy over `100vw` everywhere or `unoptimized` by default.

Document intentional exceptions beside the component and in `_context/`.
