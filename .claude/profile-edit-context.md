# Claude Context: Profile Edit System

## Quick Reference for Future Sessions

### What This System Does
Unified profile editing modal for both Owner and Visitor users with futuristic UI, auto-save, and zero code duplication.

### Key Files Created
```
docs/PROFILE_EDIT_SYSTEM.md           - Full technical documentation
frontend/src/components/profile/
  ├── ProfileEditModal.jsx              - Main modal
  ├── AvatarUploader.jsx                - Image upload component
  ├── HeadlineEditor.jsx                - Name/handle editor
  ├── BioEditor.jsx                     - Bio editor
  └── LinksEditor.jsx                   - Social links manager
frontend/src/styles/profileEditModal.css
```

### Files Deleted (Old System)
```
frontend/src/pages/EditOwnerProfile.jsx
frontend/src/visitor/pages/VisitorProfileEditPage.jsx
```

### API Endpoints (DO NOT CHANGE)
- `PUT /api/v1/owner-profiles/me` - Update owner profile
- `PUT /api/v1/visitor-profiles/me` - Update visitor profile
- `POST /api/v1/owner-profiles/me/upload` - Upload images

### Data Model Changes
Added to both OwnerProfile & VisitorProfile:
- `title: String` - For tagline/title
- `socialLinks.tiktok: String`
- `socialLinks.youtube: String`

Added to OwnerProfile only:
- `premium: Boolean`

### Architecture Decision
**One modal, conditional rendering** - Not separate owner/visitor components.
Detects user.role from AuthContext and renders appropriate fields.

### Implementation Status
See docs/PROFILE_EDIT_SYSTEM.md for full implementation guide.

### Testing Priority
1. Auto-save debouncing
2. Role-based field display
3. Image upload (both types)
4. Handle uniqueness validation
