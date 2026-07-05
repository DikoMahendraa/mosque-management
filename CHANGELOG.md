# Changelog

All notable changes to Dashboard Darussalam are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-06-16

## [Unreleased]

### Added

- Image upload component with drag-and-drop support for event and kajian posters
- Supabase Storage integration for event and kajian images (`event-images` bucket)
- Upload service for handling image validation, upload, and deletion operations
- Storage setup documentation and SQL migration for creating bucket and RLS policies
- Image preview, replace, and remove functionality in upload interface
- File size validation (max 1 MB) and type validation (JPEG, PNG, WebP)
- Progressive Web App (PWA) support with Serwist service worker and offline caching
- Web app manifest for installable standalone experience on mobile and desktop
- PWA icons generated from the mosque logo (192x192, 512x512, Apple touch icon)
- Offline fallback page shown when the dashboard is opened without a network connection
- Role-based dashboard access with `root_admin`, `admin`, and `staff` profiles
- Users management page for creating, editing, and deleting managed users
- Menu permission controls for staff dashboard access
- Finance category permissions for staff users (`Sosial`, `Kajian`, `Operasional`)
- Server-side user creation with optional temporary password bypassing email verification
- Admin setting to require email invitation/verification for newly created users
- Invite activation page for invited users to create their password
- Bulk delete support for selected finance transactions
- Category filter on the finance transaction list

### Changed

- Events and kajian forms updated to support poster image uploads
- Event poster generation workflow integrated with image upload component
- Sidebar navigation now only shows menus available to the current user
- Dashboard pages now block direct URL access when the user lacks menu permission
- Finance form categories simplified to `Sosial`, `Kajian`, and `Operasional`
- Finance amount input now displays IDR thousands separators while saving numeric values
- User creation flow now follows the configured email verification mode

### Security

- Added Supabase Storage bucket (`event-images`) with Row Level Security policies
- Storage policies ensure only authenticated users can upload, update, or delete images
- Public read access enabled for event and kajian poster images
- Added Supabase profile, menu permission, and finance category permission SQL structure
- Tightened finance transaction RLS to respect menu and category access
- Added server-side safeguards so admins cannot edit or delete themselves
- Restricted admin user management by hierarchy (`root_admin` manages admin/staff, `admin` manages staff)
- Added service-role-backed user creation and deletion endpoints without exposing the service key to the browser

## [1.1.0] - 2026-06-16

### Added

- Event and kajian archiving with dedicated archive pages (restore or permanently delete)
- AI-powered event poster generator (Gemini and OpenAI) with mosque branding settings
- AI integration settings tab (API keys, default provider, mosque name)
- Finance report sharing via WhatsApp with transaction selection and date-range filtering
- Jamaah status field with filter dropdown and status badges in the list
- Kajian donation campaigns (target amount, date range, enable/disable per kajian)
- Reusable row action menus for events and kajian (archive, QR, poster, broadcast, etc.)
- Supabase SQL migrations for archives, jamaah status, donation campaigns, AI settings, and event poster storage
- Finance report sharing via WhatsApp with transaction selection and date-range filtering
- Jamaah status field with filter dropdown and status badges in the list
- Reusable row action menus for events and kajian
- Supabase SQL migrations for event/kajian archives and jamaah status

### Changed

- Events and kajian list pages refactored to use shared action menu components
- Finance page UI updated with multi-select transactions and share workflow
- Jamaah page supports status-based filtering alongside existing search
- Public event and kajian URLs updated to `masjiddarussalaml.vercel.app`
- Settings page expanded with AI configuration alongside existing WhatsApp API settings

## [1.0.0] - 2026-06-12

### Added

- Dashboard for mosque management (events, kajian, finance, jamaah, ustad, pengurus)
- Landing page content management
- Event and kajian registration tracking from public landing page
- Event and kajian detail preview modals with registrant lists
- QR code generation for events and kajian
- WhatsApp broadcast modal (provider settings ready)
- Financial tracking with charts and CSV export
- Supabase authentication and Row Level Security
- Pre-commit hooks (Husky + lint-staged)
- GitHub Actions CI pipeline (lint, typecheck, build)
- Application versioning displayed in sidebar

### Changed

- First stable release marking production-ready v1


[1.4.0]: https://github.com/your-org/dashboard-darussalam/compare/v1.1.0...HEAD
[1.3.0]: https://github.com/your-org/dashboard-darussalam/releases/tag/v1.3.0
[1.1.0]: https://github.com/your-org/dashboard-darussalam/releases/tag/v1.1.0
[1.0.0]: https://github.com/your-org/dashboard-darussalam/releases/tag/v1.0.0
