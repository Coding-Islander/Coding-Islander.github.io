# Webinar Landing Page Guidelines

## 🎯 Objective
Generate high-converting webinar pages focused on attracting participants and building trust.

Webinars are FREE and designed for knowledge sharing, not deep hands-on training.

---

## 🚫 Positioning Rules

DO NOT position as:
- training
- course
- deep dive workshop
- hands-on session

DO NOT use the following terms:
- course
- training program
- certification
- diploma
- exam
- assessment

USE:
- live session
- webinar
- walkthrough
- live explanation

---

## 🧠 Content Strategy

Webinars should:
- Spark curiosity
- Address common confusion
- Provide clarity (not mastery)
- Feel easy to attend (low commitment)

---

## 🧱 Section Guidelines

### Hero
- Curiosity-driven headline
- Mention it is FREE
- Emphasize live session

### Pain Points
- Relatable struggles
- Light tone

### Transformation
- Focus on clarity and understanding
- NOT mastery

### What You Will Experience
- Watching demos
- Seeing real examples
- Listening to explanations

### Why This Webinar is Valuable
- Clear explanations
- Real-world examples
- No fluff

### Format
- Live session
- Include Q&A mention

### CTA
- "Register Free"
- "Save Your Spot"

---

## ✍️ Writing Style

- Simple and inviting
- Low pressure
- No heavy commitment language
- Focus on clarity

---

## 🔁 Schema Reuse Requirement (MANDATORY)

The webinar JSON MUST strictly follow the SAME schema as workshop JSON.

DO NOT:
- Add new fields
- Remove fields
- Rename fields

All fields must be present even if their meaning is adapted for webinars.

---

## 🧠 Field Adaptation Rules

Although the schema is the same, the meaning of some fields changes:

- "transformation":
  → For webinars, this represents "what the participant will understand or gain clarity on"
  → NOT deep skill mastery

- "whatYouWillDo":
  → For webinars, this represents what the participant will experience (watching demos, explanations)
  → NOT hands-on activities

- "whyDifferent":
  → Focus on clarity, simplicity, and real-world explanations
  → NOT hands-on or exercises

- "prerequisites":
  → Keep minimal or optional

- "batches":
  → Typically represents a single session (webinar date)

---

## ⚠️ Important

Even if a field is less relevant for webinars, it MUST still be included for consistency with the UI system.

## ⚡ Output Format

Return JSON matching the existing schema.