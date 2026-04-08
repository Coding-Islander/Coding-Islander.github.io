# Website Structure

This repository is a static website for Coding Islander. It currently combines three main areas:

- The main landing page for the trainer and brand
- A dedicated page for the Advanced SQL offering
- A workshop area that has been scaffolded but is only partially implemented

## Root

### `CNAME`
- GitHub Pages custom domain configuration.
- Points the published site to `codingislander.com`.

### `index.html`
- Main homepage of the website.
- Contains the landing page sections such as header, hero, about, courses, testimonials, and contact.
- Loads the shared styling from `assets/css/styles.css` and shared interactivity from `assets/js/main.js`.

### `course-advanced-sql.html`
- Dedicated marketing page for the Advanced SQL offer.
- Uses the shared site layout plus page-specific course content such as overview, audience, modules, trainer, schedule, and registration/contact sections.
- Loads both `assets/css/styles.css` and `assets/css/course.css`, plus `assets/js/main.js`.

## `assets/`

Shared front-end resources used by the static pages.

## `assets/css/`

### `assets/css/styles.css`
- Primary global stylesheet for the site.
- Defines design tokens, layout helpers, header/navigation styles, homepage sections, shared buttons, and reusable visual patterns.
- Used by the homepage and reused by the SQL course page.

### `assets/css/course.css`
- Page-specific stylesheet for `course-advanced-sql.html`.
- Adds the sticky in-page navigation, module accordion styling, trainer section styling, pricing/schedule blocks, and other course-page presentation rules.

## `assets/css/workshops/`

This folder is intended for workshop-specific styles, but the files are currently empty placeholders.

### `assets/css/workshops/workshops-list.css`
- Planned stylesheet for the workshop listing page.
- Currently empty.

### `assets/css/workshops/workshops-details.css`
- Planned stylesheet for the individual workshop detail page.
- Currently empty.

## `assets/docs/`

Internal documentation and content-generation guidance for maintaining the site.

### `assets/docs/structure.md`
- This documentation file.
- Describes the repository layout and the purpose of each file.

## `assets/docs/guidelines/`

### `assets/docs/guidelines/workshop_page_guidelines.md`
- Editorial and structural rules for creating workshop landing page content.
- Defines required sections, forbidden words, preferred wording, and expected JSON output shape for workshop content.

## `assets/docs/prompts/`

### `assets/docs/prompts/workshop_page_generation_prompt.md`
- Reserved prompt file for workshop content generation.
- Currently empty.

## `assets/img/`

Image assets used across the site.

### `assets/img/about-pic.jpg`
- About section portrait image used on the homepage.
- Also reused in the SQL course trainer section.

### `assets/img/profile-pic.png`
- Main personal profile image used in the homepage hero and course card content.

### `assets/img/work1.jpg`
- Generic portfolio/template image kept from the original starter site.
- Not clearly tied to the current live content.

### `assets/img/work2.jpg`
- Generic portfolio/template image kept from the original starter site.
- Not clearly tied to the current live content.

### `assets/img/work3.jpg`
- Generic portfolio/template image kept from the original starter site.
- Not clearly tied to the current live content.

### `assets/img/work4.jpg`
- Course card image currently used for the Advanced SQL course preview on the homepage.

### `assets/img/work5.jpg`
- Generic portfolio/template image kept from the original starter site.
- Not clearly tied to the current live content.

### `assets/img/work6.jpg`
- Generic portfolio/template image kept from the original starter site.
- Not clearly tied to the current live content.

## `assets/img/branding/`

### `assets/img/branding/logo.png`
- Site logo used in the main navigation/header.

### `assets/img/branding/favicon.png`
- Browser tab favicon for the website.

## `assets/img/testimonials/`

### `assets/img/testimonials/bhavna.jpg`
- Testimonial/profile image used in the testimonials area of the homepage.

### `assets/img/testimonials/keshav.jpg`
- Testimonial/profile image used in the testimonials area of the homepage.

### `assets/img/testimonials/saajidah.jpg`
- Testimonial/profile image used in the testimonials area of the homepage.

## `assets/js/`

### `assets/js/main.js`
- Shared client-side behavior for the current live site.
- Handles mobile menu toggling, menu closing on navigation click, active navigation highlighting on scroll, ScrollReveal animations, SQL course section highlighting, course module accordion behavior, scroll-top behavior, and homepage course carousel controls.

## `assets/js/workshops/`

This folder is intended for workshop-specific JavaScript, but the files are currently empty placeholders.

### `assets/js/workshops/workshops-list.js`
- Planned script for rendering or handling the workshops listing page.
- Currently empty.

### `assets/js/workshops/workshop-loader.js`
- Planned script for loading workshop detail data, likely from JSON.
- Currently empty.

## `data/`

Content files intended to support data-driven workshop pages.

## `data/workshops/`

### `data/workshops/workshops.json`
- Intended to hold a master list or index of workshops for the workshops listing page.
- Currently empty.

### `data/workshops/sql-join.json`
- Sample populated workshop data file.
- Contains workshop marketing content such as title, headline, pain points, outcomes, audience, instructor details, format, price, and CTA.
- This is the clearest example of the intended JSON-driven workshop content model.

### `data/workshops/sql-group-by.json`
- Placeholder for workshop data related to SQL `GROUP BY`.
- Currently empty.

### `data/workshops/csharp-oop.json`
- Placeholder for workshop data related to C# object-oriented programming.
- Currently empty.

### `data/workshops/csharp-dependency-injection.json`
- Placeholder for workshop data related to C# dependency injection.
- Currently empty.

### `data/workshops/csharp-async-parallel-programming.json`
- Placeholder for workshop data related to C# async and parallel programming.
- Currently empty.

## `workshops/`

Pages reserved for the workshop section of the site.

### `workshops/index.html`
- Planned entry page for listing available workshops.
- Currently empty.

### `workshops/details.html`
- Planned workshop detail page.
- Currently contains rough notes and placeholder metadata fields rather than finished HTML.
- Appears to be an early content sketch for workshop information such as mode, batch size, category, pricing, schedule, prerequisites, and instructor.

## Current Implementation Status

### Live pages
- `index.html`
- `course-advanced-sql.html`

### Shared production assets
- `assets/css/styles.css`
- `assets/css/course.css`
- `assets/js/main.js`
- Branding and testimonial images under `assets/img/`

### In-progress or placeholder workshop system
- `workshops/index.html`
- `workshops/details.html`
- `assets/css/workshops/`
- `assets/js/workshops/`
- Most files under `data/workshops/`
- `assets/docs/prompts/workshop_page_generation_prompt.md`

## Recommended Mental Model

- `index.html` is the brand homepage.
- `course-advanced-sql.html` is a manually authored standalone offer page.
- The `workshops/`, `data/workshops/`, and `assets/js/workshops/` folders are the beginnings of a future data-driven workshop section.
