# JWS Fine Art

Read and follow `AGENTS.md`; it is the canonical project guide.

For artwork imagery, these rules are non-negotiable:

- The visible public image comes from the original source, never a legacy small derivative.
- Small derivatives may be blurred placeholders only.
- Public catalog and collection cards use `CATALOG_ARTWORK_IMAGE_POLICY`.
- `next/image` `sizes` must match the rendered layout and be verified against DPR and the actual `_next/image` request.
- A progressive-image failure must retry the original source instead of leaving the placeholder blurred.
- Do not use CSS filters or fake sharpening to compensate for a weak source. Request a higher-resolution studio upload.

Run desktop and mobile visual QA on `/`, `/work`, and a representative artwork detail page whenever this pipeline changes.
