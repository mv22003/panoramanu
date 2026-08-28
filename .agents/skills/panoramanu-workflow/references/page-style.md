# Page Style

The visual direction for `panoramanu` should feel like a curated film photography portfolio.

## Tone

- Editorial rather than app-like
- Quiet, confident, image-led
- Personal and tactile rather than polished-corporate
- Darkroom-inspired rather than bright gallery-white

## Layout

- Let images carry the page. Supporting text should be short and placed deliberately.
- Use generous spacing and clear alignment.
- Prefer asymmetry or a split layout when it improves the sense of curation, but keep navigation obvious.
- On mobile, stack sections cleanly and avoid cramped multi-column layouts.

## Color

- Base the UI on dark warm neutrals: near-black, espresso, charcoal, muted brass, soft stone text.
- Avoid loud gradients, neon accents, and generic purple startup palettes.
- Use accent color sparingly for selection, hover, and map-related affordances.
- Keep the current palette family anchored around:
  - near-black backgrounds such as `#0b0a08`, `#12100d`, `#141210`
  - warm dark panels such as `#171411`, `#1d1812`
  - muted brass highlights such as `#8a7148`
  - restrained light text in the stone/linen range rather than pure white everywhere

## Typography

- Preserve the current `Geist` font direction already used in the app unless the user explicitly asks for a different type system.
- Headlines can be expressive, but body copy must remain easy to scan.
- Keep captions understated so they support the photographs instead of competing with them.
- Use uppercase tracking for labels, metadata, and section markers.
- Keep headline weight strong and clean; avoid ornate serif experiments unless the user explicitly asks for them.

## Components

- Cards should feel substantial but restrained, with soft large-radius corners and low-glare surfaces.
- Map controls should be present but visually subdued.
- Selected states should be obvious through contrast, framing, or motion, not through excessive decoration.
- Preserve the current rounded panel language:
  - large sections around `rounded-[2rem]`
  - photo cards around `rounded-[1.5rem]`
  - pill controls for secondary actions
- Keep shadows soft and atmospheric, not sharp or glossy.

## Interaction

- Clicking a photo should clearly establish place context on the map.
- Clicking a map pin should make the related photo feel selected, not just reveal detached metadata.
- Use subtle transitions that reinforce focus changes between gallery and map.
- Hover and selected states should rely on slight lift, border shift, and tonal change rather than flashy animation.

## Content

- Titles should feel like photo titles or location notes, not product labels.
- Descriptions should stay concise: film stock, neighborhood, date, weather, or a short observation.
- When description is omitted, the layout should still look intentional rather than empty or broken.

## Admin Surfaces

- The public homepage should stay image-led and presentation-first.
- Admin screens can reuse the same palette and spacing system, but should remain quieter and more utilitarian than the public showcase.
- Admin entry points should stay discreet; they should not visually compete with the portfolio itself.
