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
