# Changelog

All notable changes to Dashboard Darussalam are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

- Sidebar navigation now only shows menus available to the current user
- Dashboard pages now block direct URL access when the user lacks menu permission
- Finance form categories simplified to `Sosial`, `Kajian`, and `Operasional`
- Finance amount input now displays IDR thousands separators while saving numeric values
- User creation flow now follows the configured email verification mode

### Security

- Added Supabase profile, menu permission, and finance category permission SQL structure
- Tightened finance transaction RLS to respect menu and category access
- Added server-side safeguards so admins cannot edit or delete themselves
- Restricted admin user management by hierarchy (`root_admin` manages admin/staff, `admin` manages staff)
- Added service-role-backed user creation and deletion endpoints without exposing the service key to the browser

## [1.1.0] - 2026-06-16

### Added

- Event and kajian archiving with dedicated archive pages (restore or permanently delete)
- Finance report sharing via WhatsApp with transaction selection and date-range filtering
- Jamaah status field with filter dropdown and status badges in the list
- Reusable row action menus for events and kajian
- Supabase SQL migrations for event/kajian archives and jamaah status

### Changed

- Events and kajian list pages refactored to use shared action menu components
- Finance page UI updated with multi-select transactions and share workflow
- Jamaah page supports status-based filtering alongside existing search

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

[Unreleased]: https://github.com/your-org/dashboard-darussalam/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/your-org/dashboard-darussalam/releases/tag/v1.1.0
[1.0.0]: https://github.com/your-org/dashboard-darussalam/releases/tag/v1.0.0
