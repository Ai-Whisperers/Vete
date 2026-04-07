---
id: EPIC-031
title: "AI-Powered Features"
tier: 4
priority: P4
status: backlog
estimated_effort: XL
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-031: AI-Powered Features

## Context
AI features can differentiate the platform. Symptom checking, diagnosis suggestions, and treatment recommendations powered by LLMs can assist vets and improve care quality.

## Acceptance Criteria
- [ ] AI symptom checker for pre-triage
- [ ] AI-assisted diagnosis suggestions
- [ ] AI-powered treatment plan recommendations
- [ ] NLP for medical record summarization
- [ ] LLM-powered chatbot for client inquiries
- [ ] Predictive analytics for patient health risks

## Stories

### STORY-031.1: Add AI symptom checker for pre-triage
- **Status**: todo
- **Effort**: L
- **Description**: Build symptom checker that helps triage before vet consultation
- **Files to touch**: src/services/ai/symptom-checker.ts, src/components/ai/
- **Tests needed**: Symptom checker produces triage suggestions
- **Done when**: AI symptom checker functional

### STORY-031.2: Add AI-assisted diagnosis suggestions
- **Status**: todo
- **Effort**: L
- **Description**: Use LLM to suggest differential diagnoses based on symptoms and history
- **Files to touch**: src/services/ai/diagnosis.ts
- **Tests needed**: AI suggests possible diagnoses with confidence scores
- **Done when**: AI diagnosis suggestions working

### STORY-031.3: Add AI-powered treatment plan recommendations
- **Status**: todo
- **Effort**: L
- **Description**: Generate treatment plan suggestions based on diagnosis and pet profile
- **Files to touch**: src/services/ai/treatment.ts
- **Tests needed**: Treatment plans suggested with drug dosages
- **Done when**: AI treatment recommendations functional

### STORY-031.4: Add NLP for medical record summarization
- **Status**: todo
- **Effort**: M
- **Description**: Use NLP to summarize long medical histories into concise overviews
- **Files to touch**: src/services/ai/summarizer.ts
- **Tests needed**: Medical records summarized in plain language
- **Done when**: Record summarization working

### STORY-031.5: Add chatbot for client inquiries (LLM-powered)
- **Status**: todo
- **Effort**: L
- **Description**: Implement chatbot that handles common client questions using clinic data
- **Files to touch**: src/services/chatbot/, src/app/api/chatbot/
- **Tests needed**: Chatbot answers FAQs accurately
- **Done when**: LLM chatbot functional

### STORY-031.6: Add predictive analytics for patient health risks
- **Status**: todo
- **Effort**: L
- **Description**: Build predictive models for health risks based on breed, age, history
- **Files to touch**: src/services/ai/predictive.ts
- **Tests needed**: Health risk scores calculated per patient
- **Done when**: Predictive analytics functional

## Technical Notes
Use OpenAI or Anthropic APIs with veterinary-specific prompts. Ensure all AI suggestions have disclaimers - they assist but don't replace vet judgment. Consider fine-tuning on veterinary literature.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
