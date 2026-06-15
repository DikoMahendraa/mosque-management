# Changelog

All notable changes to Dashboard Darussalam are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-06-16

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

[1.3.0]: https://github.com/your-org/dashboard-darussalam/releases/tag/v1.3.0
[1.1.0]: https://github.com/your-org/dashboard-darussalam/releases/tag/v1.1.0
[1.0.0]: https://github.com/your-org/dashboard-darussalam/releases/tag/v1.0.0
