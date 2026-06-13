# 🕌 Dashboard Darussalam

> Modern Mosque Management System - Empowering mosques worldwide with digital solutions

A comprehensive, feature-rich dashboard system designed to help mosques manage their operations efficiently. From event management to financial tracking, from congregation management to WhatsApp broadcasting - everything a modern mosque needs in one place.

---

## 🌟 Purpose

Dashboard Darussalam aims to **help every mosque in the world** modernize their management systems with:
- **Free & Open Source** - Accessible to all mosques regardless of budget
- **Easy to Use** - Intuitive interface for all age groups
- **Comprehensive** - All-in-one solution for mosque operations
- **Modern** - Leveraging latest web technologies for best performance

---

## ✨ Key Features

### 📅 Event & Program Management
- **Kajian Management** - Schedule and manage Islamic study sessions
- **Event Management** - Organize mosque events and activities
- **QR Code Generation** - Generate QR codes for events (printable for posters)
- **Status Tracking** - Track upcoming and finished events

### 💰 Financial Management
- **Income & Expense Tracking** - Complete financial record management
- **Categories** - Organize transactions (Infaq, Donasi, Zakat, etc.)
- **Visual Reports** - Monthly charts and financial summaries
- **CSV Export** - Export financial data with summary totals
- **Date Filtering** - Filter by day, week, month, year, or custom range

### 👥 People Management
- **Jamaah Database** - Manage congregation members
- **Ustad Database** - Track Islamic teachers/speakers
- **Pengurus Management** - Organize mosque administrators
- **Duplicate Prevention** - WhatsApp number validation

### 📱 Communication Features
- **WhatsApp Broadcasting** - Send event notifications to congregation
- **Recipient Selection** - Choose all or specific jamaah
- **Message Preview** - Preview before sending
- **Coming Soon Integration** - Ready for WhatsApp API integration

### 🎨 User Experience
- **Searchable Dropdowns** - Smart selection with search functionality
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode Ready** - Modern UI with Tailwind CSS
- **Real-time Updates** - React Query for optimal data fetching

### 🔐 Security & Authentication
- **Supabase Auth** - Secure authentication system
- **Row Level Security** - Database-level access control
- **Role-based Access** - Admin, Editor, Viewer roles
- **Public Read Access** - Safe public access for landing pages

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Lucide Icons** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Authentication
  - Real-time subscriptions

### Libraries & Tools
- **qrcode.react** - QR code generation
- **recharts** - Data visualization
- **dayjs** - Date manipulation
- **TipTap** - Rich text editor

---

## 🚀 Cool Features

### 1. Smart QR Code Generation
- Generate QR codes with mosque logo embedded
- High-resolution download (1200x1200px)
- Perfect for printing on posters and flyers
- Direct link to event details

### 2. Intelligent Broadcasting System
- Toggle WhatsApp API on/off from settings
- Select all or specific jamaah
- Preview message before sending
- Track delivery status (coming soon)

### 3. Advanced Financial Reports
- Visual monthly charts
- Export with summary totals
- Multi-level filtering
- Category-based reporting

### 4. Searchable Selections
- Fast search through large datasets
- Real-time filtering
- Keyboard accessible
- Mobile-friendly

### 5. Duplicate Prevention
- Automatic WhatsApp number validation
- Prevents duplicate registrations
- Smart error messages

---

## 📦 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dashboard-darussalam
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_AUTH_MODE=supabase
```

4. **Run database migrations**
Execute the SQL files in the `supabase/` folder in your Supabase SQL Editor:
- `app_settings.sql`
- `broadcasts.sql`
- `events.sql`
- `events_archive.sql`
- `finance_transactions.sql`
- `donation_campaigns.sql`
- `kajian_archive.sql`
- `jamaah.sql`
- `mosque_admins.sql`
- `ustad.sql`

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 Project Structure

```
dashboard-darussalam/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── dashboard/           # Dashboard pages
│   │   ├── events/         # Event management
│   │   ├── finance/        # Financial management
│   │   ├── jamaah/         # Congregation management
│   │   ├── kajian/         # Kajian management
│   │   ├── management/     # Admin management
│   │   ├── settings/       # App settings
│   │   └── ustad/          # Teacher management
│   └── page.tsx            # Landing page
├── components/              # React components
│   ├── broadcast/          # Broadcast modal
│   ├── layout/             # Layout components
│   └── ui/                 # UI components
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities & helpers
├── services/                # API service layer
├── supabase/                # Database schemas
├── store/                   # Global state management
└── types/                   # TypeScript types
```

---

## 🔧 Configuration

### WhatsApp API Setup (Optional)
1. Go to **Settings** → **WhatsApp API**
2. Toggle "Aktifkan WhatsApp API"
3. Choose provider (Fonnte, Wablas, or Twilio)
4. Enter your API token
5. Save settings

Broadcasting features will appear in Kajian and Events pages.

### Customization
- Logo: Replace `/public/logo.png`
- Colors: Edit `tailwind.config.ts`
- Branding: Update `components/ui/AppLogo.tsx`

---

## 📊 Database Schema

The system uses the following main tables:
- `events` - Mosque events and activities
- `kajian` - Islamic study sessions
- `jamaah` - Congregation members
- `ustad` - Teachers and speakers
- `mosque_admins` - Administrators
- `finance_transactions` - Financial records
- `app_settings` - Application settings
- `broadcast_messages` - Broadcast history

All tables have Row Level Security (RLS) enabled with proper policies.

---

## 🌍 Contributing

Contributions are welcome! This project aims to help mosques worldwide. If you have ideas or improvements:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is open source and available for all mosques to use freely.

---

## 🤲 Support

If this project helps your mosque, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code
- 📢 Sharing with other mosques

---

## 🙏 Acknowledgments

Built with love for the Muslim Ummah 💚

**JazakAllahu Khairan** to all contributors and users!

---

**Dashboard Darussalam** - Simplifying Mosque Management, One Masjid at a Time 🕌
