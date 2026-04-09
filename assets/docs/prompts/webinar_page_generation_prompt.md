# Generate Webinar Landing Page Content in form of json format


## Instructions

Use the guidelines defined in:
`assets/docs/guidelines/workshop_page_guidelines.md`

Use the json workshop template defined in:
`assets/docs/template/workshop-title.json`

For info, the following html page is used to load the data from the json file:
`workshops/details.html`

Generate a high-converting landing page content for a technical webinar using the input provided and workshop schema provided as template above.

---

## Critical Requirement

You MUST strictly follow the existing workshop JSON schema.

Do not modify structure under any circumstances.

Only adapt the content to fit a webinar format.

---

## Requirements

- Follow ALL rules from the guidelines strictly
- Do NOT use restricted terms (course, training program, certification, etc.)

---

## Input

The webinar details will be provided below.

---

## Rules

- type must be "webinar"
- paid must be false
- price must be ""
- cta must be "Register Free"
- batchSize must be "Open"
- No hands-on or exercises
- Focus on clarity and learning through observation

---

## Output Actions
- Generate a complete landing page content in valid json format
- Include all required sections from the json workshop template
- Json file should be outputted in the following folder:
`data/workshops`