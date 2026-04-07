---
id: EPIC-017
title: "Medical Imaging"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-017: Medical Imaging

## Context
No DICOM support, no image management for X-rays and ultrasounds. Vets currently can't attach or view medical images in the system.

## Acceptance Criteria
- [ ] Image upload for X-rays/ultrasounds
- [ ] Image annotation tools
- [ ] Before/after image comparison
- [ ] DICOM viewer integration
- [ ] Image storage configured

## Stories

### STORY-017.1: Add image upload for X-rays/ultrasounds
- **Status**: todo
- **Effort**: M
- **Description**: Create image upload component for medical images with metadata
- **Files to touch**: src/components/imaging/upload.tsx, src/services/imaging/
- **Tests needed**: Images upload and display in patient record
- **Done when**: Medical image upload working

### STORY-017.2: Add image annotation tools
- **Status**: todo
- **Effort**: M
- **Description**: Add drawing/annotation tools for marking up medical images
- **Files to touch**: src/components/imaging/annotator.tsx
- **Tests needed**: Vet can draw on images and save annotations
- **Done when**: Image annotation tools functional

### STORY-017.3: Add image comparison (before/after)
- **Status**: todo
- **Effort**: S
- **Description**: Create side-by-side or overlay comparison view for images
- **Files to touch**: src/components/imaging/compare.tsx
- **Tests needed**: Two images can be compared side-by-side
- **Done when**: Image comparison view working

### STORY-017.4: Add DICOM viewer integration
- **Status**: todo
- **Effort**: L
- **Description**: Integrate a DICOM viewer for professional medical imaging
- **Files to touch**: src/components/imaging/dicom-viewer.tsx, package.json
- **Tests needed**: DICOM files viewable in browser
- **Done when**: DICOM viewer integrated

### STORY-017.5: Add image storage with Supabase Storage
- **Status**: todo
- **Effort**: M
- **Description**: Configure Supabase Storage buckets for medical images with proper access control
- **Files to touch**: src/services/storage/, supabase/storage/
- **Tests needed**: Images stored securely in Supabase Storage
- **Done when**: Image storage configured and secure

## Technical Notes
Use Cornerstone.js for DICOM viewing. Supabase Storage supports up to 5GB per file. Consider image compression before upload for large X-rays.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
