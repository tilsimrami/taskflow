# TaskFlow — Kanban Proje Yönetim Tahtası

Canlı demo: https://taskflow-roan-beta.vercel.app

## Proje Hakkında

Trello benzeri, sürükle-bırak destekli kanban tahtası uygulaması. Kullanıcılar hesap oluşturup board, sütun ve kartlarla görevlerini yönetebilir.

## Özellikler

- Kullanıcı kaydı ve girişi (Supabase Auth)
- Board oluşturma ve silme
- Sütun ekleme ve silme
- Kart ekleme, düzenleme, silme
- Sürükle-bırak ile kartları sütunlar arasında taşıma
- Sıralama sayfa yenilemesinde korunur
- Responsive tasarım

## Tech Stack

- **Next.js 14** — App Router ile SSR ve routing
- **Supabase** — PostgreSQL veritabanı ve authentication
- **dnd-kit** — Sürükle-bırak
- **Tailwind CSS** — Styling
- **TypeScript** — Tip güvenliği
- **Vercel** — Deploy

## Teknik Kararlar

### Neden dnd-kit?
- `react-beautiful-dnd` artık aktif olarak geliştirilmiyor
- `dnd-kit` modern, hafif ve React 18 ile tam uyumlu
- Mobil dokunmatik desteği yerleşik olarak geliyor
- Accessibility (erişilebilirlik) desteği güçlü

### Sıralama verisi nasıl saklanıyor?
Her kart ve sütunun `position` adında integer bir alanı var. Kart taşındığında sadece o kolondaki kartların position değerleri güncelleniyor. Bu sayfa yenilemesinde sıralama korunuyor.

### Veri modeli
profiles
└── boards (user_id → profiles.id)
└── columns (board_id → boards.id)
└── cards (column_id → columns.id)
### Güvenlik
Row Level Security (RLS) ile her kullanıcı yalnızca kendi verilerine erişebilir. Supabase policy'leri board → column → card zinciri boyunca uygulanıyor.

## Kurulum

```bash
git clone https://github.com/tilsimrami/taskflow.git
cd taskflow
npm install
```

`.env.local` dosyası oluştur:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

```bash
npm run dev
```
