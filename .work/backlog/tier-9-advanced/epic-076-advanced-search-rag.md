---
id: EPIC-076
title: "Advanced Search & RAG"
tier: 9
priority: P9
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-076: Advanced Search & RAG

## Context
Retrieval-Augmented Generation for medical reference, semantic search across records, and similar case finding enhance clinical decision-making.

## Acceptance Criteria
- [ ] Medical records indexed in Qdrant
- [ ] Semantic search for diagnosis
- [ ] Similar case finder
- [ ] RAG-powered medical reference assistant
- [ ] Drug interaction database with vector search

## Stories

### STORY-076.1: Index all medical records in Qdrant
- **Status**: todo
- **Effort**: L
- **Description**: Set up Qdrant and index medical records with embeddings
- **Files to touch**: docker-compose.yml, src/services/search/qdrant.ts
- **Tests needed**: Medical records searchable by semantic meaning
- **Done when**: Qdrant indexing working

### STORY-076.2: Add semantic search for diagnosis
- **Status**: todo
- **Effort**: M
- **Description**: Search for diagnoses using natural language queries
- **Files to touch**: src/services/search/semantic.ts
- **Tests needed**: Natural language queries find relevant diagnoses
- **Done when**: Semantic search functional

### STORY-076.3: Add similar case finder
- **Status**: todo
- **Effort**: M
- **Description**: Find similar past cases based on symptoms and diagnosis
- **Files to touch**: src/services/search/similar-cases.ts
- **Tests needed**: Similar cases returned for current case
- **Done when**: Similar case finder working

### STORY-076.4: Add RAG-powered medical reference assistant
- **Status**: todo
- **Effort**: L
- **Description**: Build RAG assistant that answers medical questions from vet literature
- **Files to touch**: src/services/ai/rag-assistant.ts
- **Tests needed**: Medical questions answered with citations
- **Done when**: RAG assistant functional

### STORY-076.5: Add drug interaction database with vector search
- **Status**: todo
- **Effort**: M
- **Description**: Enable natural language drug interaction queries
- **Files to touch**: src/services/pharmacy/vector-search.ts
- **Tests needed**: Drug interactions found via natural language
- **Done when**: Vector drug search working

## Technical Notes
Qdrant can be deployed via Docker on the VPS. Use OpenAI embeddings (text-embedding-3-small) for encoding. RAG pipeline: embed query → search Qdrant → augment prompt → LLM response.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
