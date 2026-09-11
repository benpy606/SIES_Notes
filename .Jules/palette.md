## 2024-05-18 - [Upload Modal Progress Bar Accessibility]
**Learning:** Upload modal progress bars must be marked with proper ARIA attributes to be accessible to screen readers, including `aria-live` for the container and `role="progressbar"` for the bar itself, alongside `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.
**Action:** When implementing custom progress indicators (using divs rather than native progress elements), ensure they include complete progressbar ARIA attributes and that live status updates are wrapped in an aria-live region.
