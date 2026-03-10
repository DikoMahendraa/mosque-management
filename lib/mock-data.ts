import {
  Kajian,
  MosqueEvent,
  TahsinClass,
  BerbagiProgram,
  GalleryItem,
  Post,
  FinanceTransaction,
  MosqueAdmin,
  PrayerSchedule,
  FridayDuty,
  HeroSection,
  AboutSection,
  VisionMission,
  FeaturedProgram,
  ContactInfo,
} from '@/types';

// ============================================================
// LANDING PAGE
// ============================================================

export const mockHero: HeroSection = {
  id: '1',
  title: 'Masjid Darussalam',
  subtitle: 'Pusat Kegiatan Islam & Pemberdayaan Umat',
  description:
    'Selamat datang di Masjid Darussalam, tempat ibadah, belajar, dan bersama membangun komunitas Islam yang rahmatan lil alamin.',
  image: 'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=1200',
  button_text: 'Lihat Program Kami',
  button_link: '#programs',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockAbout: AboutSection = {
  id: '1',
  title: 'Tentang Masjid Darussalam',
  description:
    '<p>Masjid Darussalam berdiri sejak tahun 1985 sebagai pusat kegiatan Islam di wilayah Kelurahan Mampang Prapatan. Dengan kapasitas 1000 jamaah, masjid ini aktif menyelenggarakan berbagai kegiatan keagamaan, sosial, dan pendidikan Islam.</p>',
  image: 'https://images.unsplash.com/photo-1609358905607-b72f1fae0e6e?w=800',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockVisionMission: VisionMission = {
  id: '1',
  vision:
    'Menjadi pusat kegiatan Islam yang rahmatan lil alamin dan memberdayakan umat menuju kehidupan yang berkualitas.',
  missions: [
    'Menyelenggarakan kegiatan ibadah yang tertib dan khusyu',
    'Mengembangkan pendidikan Islam yang berkualitas',
    'Memberdayakan masyarakat melalui program sosial dan ekonomi',
    'Membangun generasi muda Muslim yang berakhlak mulia',
    'Menjalin kerjasama antar lembaga Islam',
  ],
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockFeaturedPrograms: FeaturedProgram[] = [
  {
    id: '1',
    title: 'Kajian Rutin',
    description: 'Kajian Islam mingguan dengan ustadz-ustadz terpercaya',
    icon: 'BookOpen',
    order: 1,
  },
  {
    id: '2',
    title: 'Tahsin Al-Quran',
    description: 'Kelas memperbaiki bacaan Al-Quran untuk semua usia',
    icon: 'Star',
    order: 2,
  },
  {
    id: '3',
    title: 'Program Berbagi',
    description: 'Program sedekah dan santunan untuk masyarakat membutuhkan',
    icon: 'Heart',
    order: 3,
  },
  {
    id: '4',
    title: 'Kegiatan Pemuda',
    description: 'Pembinaan remaja dan pemuda masjid',
    icon: 'Users',
    order: 4,
  },
];

export const mockContact: ContactInfo = {
  id: '1',
  address: 'Jl. Mampang Prapatan Raya No. 1, Jakarta Selatan, DKI Jakarta 12790',
  phone: '(021) 7941234',
  email: 'info@darussalam.or.id',
  maps_embed: 'https://maps.google.com',
  social_instagram: '@masjiddarussalam',
  social_youtube: 'Masjid Darussalam',
  social_facebook: 'Masjid Darussalam Official',
  updated_at: '2024-01-15T10:00:00Z',
};

// ============================================================
// KAJIAN
// ============================================================

export const mockKajian: Kajian[] = [
  {
    id: '1',
    title: 'Kajian Tafsir Al-Quran Juz 30',
    speaker: 'Ustadz Ahmad Fauzi, Lc.',
    description:
      '<p>Kajian mendalam mengenai tafsir surat-surat pendek dalam Juz 30, membahas makna dan kandungan setiap ayat.</p>',
    date: '2024-03-15',
    time: '20:00',
    location: 'Masjid Darussalam – Ruang Utama',
    poster_image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600',
    status: 'upcoming',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: '2',
    title: 'Kajian Fiqih Muamalah Kontemporer',
    speaker: 'Ustadz Dr. Hasan Al-Banna',
    description:
      '<p>Kajian tentang hukum-hukum muamalah dalam konteks kehidupan modern, meliputi transaksi digital, investasi syariah, dan lainnya.</p>',
    date: '2024-03-08',
    time: '19:30',
    location: 'Masjid Darussalam – Aula Serbaguna',
    poster_image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600',
    status: 'upcoming',
    created_at: '2024-01-08T08:00:00Z',
    updated_at: '2024-01-08T08:00:00Z',
  },
  {
    id: '3',
    title: 'Kajian Sirah Nabawiyah',
    speaker: 'Ustadz Muhammad Ridho, M.Pd.',
    description: '<p>Kajian perjalanan hidup Nabi Muhammad SAW dari lahir hingga wafat.</p>',
    date: '2024-02-20',
    time: '20:00',
    location: 'Masjid Darussalam – Ruang Utama',
    poster_image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600',
    status: 'finished',
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-02-21T08:00:00Z',
  },
  {
    id: '4',
    title: 'Kajian Aqidah Islamiyah',
    speaker: 'Ustadz Abdullah Zuhdi',
    description: '<p>Membahas dasar-dasar aqidah Islam yang benar sesuai Ahlus Sunnah wal Jamaah.</p>',
    date: '2024-02-15',
    time: '19:00',
    location: 'Masjid Darussalam – Ruang Utama',
    poster_image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600',
    status: 'finished',
    created_at: '2024-01-03T08:00:00Z',
    updated_at: '2024-02-16T08:00:00Z',
  },
  {
    id: '5',
    title: 'Kajian Hadits Arbain Nawawi',
    speaker: 'Ustadz Fadhlan Al-Ghifari',
    description: '<p>Kajian 40 hadits pilihan Imam Nawawi yang menjadi pilar Islam.</p>',
    date: '2024-03-22',
    time: '20:00',
    location: 'Masjid Darussalam – Aula Serbaguna',
    poster_image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600',
    status: 'upcoming',
    created_at: '2024-01-12T08:00:00Z',
    updated_at: '2024-01-12T08:00:00Z',
  },
];

// ============================================================
// EVENTS
// ============================================================

export const mockEvents: MosqueEvent[] = [
  {
    id: '1',
    title: 'Tabligh Akbar Milad Masjid ke-39',
    description: '<p>Peringatan ulang tahun Masjid Darussalam ke-39 dengan berbagai kegiatan.</p>',
    event_date: '2024-03-20',
    location: 'Halaman Masjid Darussalam',
    poster: 'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=600',
    status: 'upcoming',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    title: 'Isra Miraj 1445 H',
    description: '<p>Peringatan Isra dan Miraj Nabi Muhammad SAW 1445 H.</p>',
    event_date: '2024-02-08',
    location: 'Masjid Darussalam – Ruang Utama',
    poster: 'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=600',
    status: 'finished',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-02-09T08:00:00Z',
  },
  {
    id: '3',
    title: 'Bazar Amal Ramadhan',
    description: '<p>Bazar sembako murah dalam rangka menyambut Ramadhan 1445 H.</p>',
    event_date: '2024-03-25',
    location: 'Halaman Masjid Darussalam',
    poster: 'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=600',
    status: 'upcoming',
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-01-20T08:00:00Z',
  },
  {
    id: '4',
    title: 'Santunan Anak Yatim',
    description: '<p>Program santunan anak yatim dari donatur masjid.</p>',
    event_date: '2024-01-20',
    location: 'Aula Masjid Darussalam',
    poster: 'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=600',
    status: 'finished',
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-21T08:00:00Z',
  },
];

// ============================================================
// TAHSIN
// ============================================================

export const mockTahsin: TahsinClass[] = [
  {
    id: '1',
    class_name: 'Tahsin Dasar – Kelas A',
    teacher: 'Ustadzah Fatimah Azzahra',
    schedule: 'Senin & Rabu, 16:00 – 17:30',
    description:
      '<p>Kelas tahsin untuk pemula, belajar makhraj huruf dan hukum tajwid dasar.</p>',
    capacity: 20,
    location: 'Ruang Kelas 1',
    status: 'active',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
  },
  {
    id: '2',
    class_name: 'Tahsin Menengah – Kelas B',
    teacher: 'Ustadz Hafizh Rahman',
    schedule: 'Selasa & Kamis, 08:00 – 09:30',
    description: '<p>Kelas tahsin menengah, fokus pada hukum mad dan waqaf.</p>',
    capacity: 15,
    location: 'Ruang Kelas 2',
    status: 'active',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
  },
  {
    id: '3',
    class_name: 'Tahsin Lanjutan – Kelas C',
    teacher: 'Ustadz Abdul Karim, S.Pd.I.',
    schedule: 'Jumat, 09:00 – 11:00',
    description:
      '<p>Kelas tahsin lanjutan, mempersiapkan peserta untuk menjadi pembaca Al-Quran yang fasih.</p>',
    capacity: 10,
    location: 'Ruang Kelas 3',
    status: 'active',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
  },
  {
    id: '4',
    class_name: 'Tahsin Anak-Anak – Kelas D',
    teacher: 'Ustadzah Aisyah Putri',
    schedule: 'Sabtu & Minggu, 08:00 – 09:30',
    description: '<p>Kelas tahsin khusus anak-anak usia 7-12 tahun.</p>',
    capacity: 25,
    location: 'Aula Bawah',
    status: 'active',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
  },
];

// ============================================================
// BERBAGI
// ============================================================

export const mockBerbagi: BerbagiProgram[] = [
  {
    id: '1',
    program_name: 'Santunan Yatim & Dhuafa Ramadhan',
    description:
      '<p>Program santunan bulanan untuk anak yatim dan kaum dhuafa di sekitar masjid.</p>',
    target_amount: 50000000,
    collected_amount: 32500000,
    program_date: '2024-03-20',
    status: 'active',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: '2',
    program_name: 'Buka Puasa Bersama',
    description: '<p>Program buka puasa gratis setiap hari selama Ramadhan 1445 H.</p>',
    target_amount: 30000000,
    collected_amount: 30000000,
    program_date: '2024-03-11',
    status: 'active',
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: '3',
    program_name: 'Qurban 1445 H',
    description: '<p>Program pengumpulan hewan qurban untuk dibagikan kepada masyarakat.</p>',
    target_amount: 100000000,
    collected_amount: 75000000,
    program_date: '2024-06-17',
    status: 'upcoming',
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: '4',
    program_name: 'Bantuan Bencana Alam',
    description: '<p>Pengumpulan donasi untuk korban bencana banjir di Demak.</p>',
    target_amount: 25000000,
    collected_amount: 25000000,
    program_date: '2024-01-20',
    status: 'completed',
    created_at: '2024-01-18T08:00:00Z',
    updated_at: '2024-01-25T08:00:00Z',
  },
];

// ============================================================
// GALLERY
// ============================================================

export const mockGallery: GalleryItem[] = [
  {
    id: '1',
    title: 'Kajian Ramadhan 2024',
    category: 'Kajian',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600',
    date: '2024-03-15',
    description: 'Dokumentasi kajian Ramadhan bersama Ustadz Ahmad Fauzi',
    created_at: '2024-03-15T20:00:00Z',
    updated_at: '2024-03-15T20:00:00Z',
  },
  {
    id: '2',
    title: 'Isra Miraj 1445 H',
    category: 'Event',
    image: 'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=600',
    date: '2024-02-08',
    description: 'Peringatan Isra Miraj Nabi Muhammad SAW',
    created_at: '2024-02-08T20:00:00Z',
    updated_at: '2024-02-08T20:00:00Z',
  },
  {
    id: '3',
    title: 'Kelas Tahsin Anak',
    category: 'Tahsin',
    image: 'https://images.unsplash.com/photo-1609358905607-b72f1fae0e6e?w=600',
    date: '2024-02-20',
    description: 'Kegiatan kelas tahsin anak-anak',
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-02-20T10:00:00Z',
  },
  {
    id: '4',
    title: 'Santunan Anak Yatim',
    category: 'Berbagi',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',
    date: '2024-01-20',
    description: 'Program santunan anak yatim bulanan',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '5',
    title: 'Renovasi Masjid 2024',
    category: 'Masjid',
    image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600',
    date: '2024-01-10',
    description: 'Proses renovasi bagian mihrab masjid',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '6',
    title: 'Bazar Ramadhan',
    category: 'Event',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600',
    date: '2024-03-25',
    description: 'Bazar sembako murah menyambut Ramadhan',
    created_at: '2024-03-25T08:00:00Z',
    updated_at: '2024-03-25T08:00:00Z',
  },
];

// ============================================================
// POSTS
// ============================================================

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Menyambut Ramadhan 1445 H dengan Penuh Semangat',
    slug: 'menyambut-ramadhan-1445h',
    content:
      '<h2>Alhamdulillah</h2><p>Bulan Ramadhan 1445 H semakin dekat. Mari kita persiapkan diri dengan memperbanyak ibadah dan amal sholeh.</p>',
    cover_image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800',
    author: 'Admin Darussalam',
    published_date: '2024-03-01',
    status: 'published',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: '2',
    title: 'Jadwal Kajian Rutin Masjid Darussalam Maret 2024',
    slug: 'jadwal-kajian-maret-2024',
    content:
      '<p>Berikut adalah jadwal kajian rutin Masjid Darussalam untuk bulan Maret 2024.</p>',
    cover_image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800',
    author: 'Admin Darussalam',
    published_date: '2024-03-01',
    status: 'published',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
  },
  {
    id: '3',
    title: 'Program Beasiswa Santri Tahfidz 2024',
    slug: 'beasiswa-santri-tahfidz-2024',
    content: '<p>Masjid Darussalam membuka program beasiswa untuk santri tahfidz berprestasi.</p>',
    cover_image: 'https://images.unsplash.com/photo-1609358905607-b72f1fae0e6e?w=800',
    author: 'Humas Darussalam',
    published_date: '',
    status: 'draft',
    created_at: '2024-02-28T08:00:00Z',
    updated_at: '2024-02-28T08:00:00Z',
  },
  {
    id: '4',
    title: 'Laporan Keuangan Masjid Februari 2024',
    slug: 'laporan-keuangan-februari-2024',
    content: '<p>Transparansi laporan keuangan Masjid Darussalam bulan Februari 2024.</p>',
    cover_image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
    author: 'Bendahara Darussalam',
    published_date: '2024-03-05',
    status: 'published',
    created_at: '2024-03-05T08:00:00Z',
    updated_at: '2024-03-05T08:00:00Z',
  },
];

// ============================================================
// FINANCE
// ============================================================

export const mockFinance: FinanceTransaction[] = [
  {
    id: '1',
    title: 'Infaq Jumat',
    category: 'Infaq',
    amount: 3500000,
    date: '2024-03-08',
    description: 'Infaq sholat Jumat minggu pertama Maret',
    type: 'income',
    created_at: '2024-03-08T13:00:00Z',
    updated_at: '2024-03-08T13:00:00Z',
  },
  {
    id: '2',
    title: 'Infaq Jumat',
    category: 'Infaq',
    amount: 4200000,
    date: '2024-03-15',
    description: 'Infaq sholat Jumat minggu kedua Maret',
    type: 'income',
    created_at: '2024-03-15T13:00:00Z',
    updated_at: '2024-03-15T13:00:00Z',
  },
  {
    id: '3',
    title: 'Donasi Program Berbagi',
    category: 'Donasi',
    amount: 5000000,
    date: '2024-03-10',
    description: 'Donasi untuk program santunan yatim Ramadhan',
    type: 'income',
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-03-10T10:00:00Z',
  },
  {
    id: '4',
    title: 'Listrik & Air',
    category: 'Operasional',
    amount: 1500000,
    date: '2024-03-05',
    description: 'Tagihan listrik dan air bulan Februari',
    type: 'expense',
    created_at: '2024-03-05T09:00:00Z',
    updated_at: '2024-03-05T09:00:00Z',
  },
  {
    id: '5',
    title: 'Honor Imam & Muadzin',
    category: 'Honor',
    amount: 2500000,
    date: '2024-03-01',
    description: 'Honor bulanan imam rawatib dan muadzin',
    type: 'expense',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
  },
  {
    id: '6',
    title: 'Perawatan Fasilitas',
    category: 'Maintenance',
    amount: 800000,
    date: '2024-03-12',
    description: 'Perbaikan AC ruang utama',
    type: 'expense',
    created_at: '2024-03-12T09:00:00Z',
    updated_at: '2024-03-12T09:00:00Z',
  },
  {
    id: '7',
    title: 'Wakaf Al-Quran',
    category: 'Wakaf',
    amount: 2000000,
    date: '2024-02-15',
    description: 'Wakaf Al-Quran dari donatur',
    type: 'income',
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-15T10:00:00Z',
  },
  {
    id: '8',
    title: 'Infaq Jumat',
    category: 'Infaq',
    amount: 3800000,
    date: '2024-02-09',
    description: 'Infaq sholat Jumat minggu pertama Februari',
    type: 'income',
    created_at: '2024-02-09T13:00:00Z',
    updated_at: '2024-02-09T13:00:00Z',
  },
  {
    id: '9',
    title: 'Pembelian Perlengkapan Kebersihan',
    category: 'Operasional',
    amount: 350000,
    date: '2024-02-20',
    description: 'Sabun, pel, dan perlengkapan kebersihan masjid',
    type: 'expense',
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-02-20T10:00:00Z',
  },
  {
    id: '10',
    title: 'Zakat Fitrah',
    category: 'Zakat',
    amount: 15000000,
    date: '2024-04-05',
    description: 'Penerimaan zakat fitrah 1445 H',
    type: 'income',
    created_at: '2024-04-05T10:00:00Z',
    updated_at: '2024-04-05T10:00:00Z',
  },
];

// ============================================================
// MANAGEMENT
// ============================================================

export const mockManagement: MosqueAdmin[] = [
  {
    id: '1',
    name: 'H. Abdullah Mukhtar, S.E.',
    position: 'Ketua DKM',
    phone: '0812-1234-5678',
    email: 'abdullah@darussalam.or.id',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    period_start: '2022-01-01',
    period_end: '2025-12-31',
    created_at: '2022-01-01T08:00:00Z',
    updated_at: '2022-01-01T08:00:00Z',
  },
  {
    id: '2',
    name: 'Ir. Ahmad Syukri',
    position: 'Wakil Ketua',
    phone: '0813-2345-6789',
    email: 'ahmad.syukri@darussalam.or.id',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    period_start: '2022-01-01',
    period_end: '2025-12-31',
    created_at: '2022-01-01T08:00:00Z',
    updated_at: '2022-01-01T08:00:00Z',
  },
  {
    id: '3',
    name: 'Hj. Siti Rahmah, S.Ag.',
    position: 'Sekretaris',
    phone: '0814-3456-7890',
    email: 'siti.rahmah@darussalam.or.id',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
    period_start: '2022-01-01',
    period_end: '2025-12-31',
    created_at: '2022-01-01T08:00:00Z',
    updated_at: '2022-01-01T08:00:00Z',
  },
  {
    id: '4',
    name: 'Drs. Muhammad Rizal',
    position: 'Bendahara',
    phone: '0815-4567-8901',
    email: 'rizal@darussalam.or.id',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    period_start: '2022-01-01',
    period_end: '2025-12-31',
    created_at: '2022-01-01T08:00:00Z',
    updated_at: '2022-01-01T08:00:00Z',
  },
  {
    id: '5',
    name: 'Ustadz Hasan Basri',
    position: 'Ketua Bidang Ibadah',
    phone: '0816-5678-9012',
    email: 'hasan.basri@darussalam.or.id',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    period_start: '2022-01-01',
    period_end: '2025-12-31',
    created_at: '2022-01-01T08:00:00Z',
    updated_at: '2022-01-01T08:00:00Z',
  },
];

// ============================================================
// PRAYER SCHEDULE
// ============================================================

export const mockPrayerSchedule: PrayerSchedule[] = [
  {
    id: '1',
    date: '2024-03-11',
    fajr_imam: 'Ustadz Hasan Basri',
    dhuhr_imam: 'Ustadz Ahmad Fauzi',
    asr_imam: 'Ustadz Ridho',
    maghrib_imam: 'Ustadz Hasan Basri',
    isha_imam: 'Ustadz Ahmad Fauzi',
    fajr_muadzin: 'Bpk. Wahyu',
    dhuhr_muadzin: 'Bpk. Dani',
    asr_muadzin: 'Bpk. Rudi',
    maghrib_muadzin: 'Bpk. Wahyu',
    isha_muadzin: 'Bpk. Dani',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: '2',
    date: '2024-03-12',
    fajr_imam: 'Ustadz Ridho',
    dhuhr_imam: 'Ustadz Hasan Basri',
    asr_imam: 'Ustadz Ahmad Fauzi',
    maghrib_imam: 'Ustadz Ridho',
    isha_imam: 'Ustadz Hasan Basri',
    fajr_muadzin: 'Bpk. Rudi',
    dhuhr_muadzin: 'Bpk. Wahyu',
    asr_muadzin: 'Bpk. Dani',
    maghrib_muadzin: 'Bpk. Rudi',
    isha_muadzin: 'Bpk. Wahyu',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: '3',
    date: '2024-03-13',
    fajr_imam: 'Ustadz Ahmad Fauzi',
    dhuhr_imam: 'Ustadz Ridho',
    asr_imam: 'Ustadz Hasan Basri',
    maghrib_imam: 'Ustadz Ahmad Fauzi',
    isha_imam: 'Ustadz Ridho',
    fajr_muadzin: 'Bpk. Dani',
    dhuhr_muadzin: 'Bpk. Rudi',
    asr_muadzin: 'Bpk. Wahyu',
    maghrib_muadzin: 'Bpk. Dani',
    isha_muadzin: 'Bpk. Rudi',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
];

// ============================================================
// FRIDAY DUTY
// ============================================================

export const mockFridayDuty: FridayDuty[] = [
  {
    id: '1',
    date: '2024-03-08',
    khateeb: 'Ustadz Dr. Hasan Al-Banna',
    imam: 'Ustadz Hasan Basri',
    muadzin: 'Bpk. Wahyu Santoso',
    bilal: 'Bpk. Dani Pratama',
    notes: 'Khutbah tema: Persiapan Ramadhan',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: '2',
    date: '2024-03-15',
    khateeb: 'Ustadz Ahmad Fauzi, Lc.',
    imam: 'Ustadz Ahmad Fauzi',
    muadzin: 'Bpk. Rudi Hartono',
    bilal: 'Bpk. Wahyu Santoso',
    notes: 'Khutbah tema: Keutamaan Bulan Ramadhan',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: '3',
    date: '2024-03-22',
    khateeb: 'Ustadz Muhammad Ridho, M.Pd.',
    imam: 'Ustadz Ridho',
    muadzin: 'Bpk. Dani Pratama',
    bilal: 'Bpk. Rudi Hartono',
    notes: 'Khutbah tema: Memperbanyak Ibadah di Ramadhan',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: '4',
    date: '2024-03-29',
    khateeb: 'Ustadz Abdullah Zuhdi',
    imam: 'Ustadz Hasan Basri',
    muadzin: 'Bpk. Wahyu Santoso',
    bilal: 'Bpk. Dani Pratama',
    notes: 'Khutbah tema: Lailatul Qadar',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
];
