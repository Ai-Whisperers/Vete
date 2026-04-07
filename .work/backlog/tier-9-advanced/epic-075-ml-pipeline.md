---
id: EPIC-075
title: "Machine Learning Pipeline"
tier: 9
priority: P9
status: backlog
estimated_effort: XL
dependencies: [EPIC-031]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-075: Machine Learning Pipeline

## Context
ML capabilities for pet image classification, dermatology analysis, X-ray anomaly detection, and predictive modeling enhance the platform's value proposition.

## Acceptance Criteria
- [ ] Pet image classification (species, breed)
- [ ] Dermatology image analysis
- [ ] X-ray anomaly detection
- [ ] Predictive modeling for no-shows
- [ ] Churn prediction for clients

## Stories

### STORY-075.1: Add pet image classification (species, breed)
- **Status**: todo
- **Effort**: L
- **Description**: Train/deploy model for identifying species and breed from photos
- **Files to touch**: src/services/ml/image-classification.ts
- **Tests needed**: Species and breed identified from photo
- **Done when**: Image classification working

### STORY-075.2: Add dermatology image analysis
- **Status**: todo
- **Effort**: L
- **Description**: Implement dermatology analysis from skin lesion photos
- **Files to touch**: src/services/ml/dermatology.ts
- **Tests needed**: Skin conditions suggested from images
- **Done when**: Dermatology analysis functional

### STORY-075.3: Add X-ray anomaly detection
- **Status**: todo
- **Effort**: L
- **Description**: Implement anomaly detection in veterinary X-ray images
- **Files to touch**: src/services/ml/xray.ts
- **Tests needed**: Anomalies highlighted in X-rays
- **Done when**: X-ray anomaly detection working

### STORY-075.4: Add predictive modeling for appointment no-shows
- **Status**: todo
- **Effort**: M
- **Description**: Build model predicting appointment no-show probability
- **Files to touch**: src/services/ml/no-show.ts
- **Tests needed**: No-show probability shown at booking
- **Done when**: No-show prediction working

### STORY-075.5: Add churn prediction for clients
- **Status**: todo
- **Effort**: M
- **Description**: Build model predicting client churn likelihood
- **Files to touch**: src/services/ml/churn.ts
- **Tests needed**: At-risk clients identified
- **Done when**: Churn prediction working

## Technical Notes
Start with pre-trained models (e.g., pet breed classifiers on Hugging Face). For X-ray analysis, partner with veterinary radiology research. Deploy models with TensorFlow.js for client-side or API-based inference.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
