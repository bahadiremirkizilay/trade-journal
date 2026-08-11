# Trade Journal

2 kişilik ortak trade günlüğü. Next.js + Supabase + Vercel.

## Özellikler

- **Şifresiz giriş**: Direkt isim seçip giriş yapın
- **İsim seçimi**: Kim olduğunuzu seçin (localStorage'da saklanır)
- **İşlem takibi**: Her trade'de kimin eklediği görünür
- **Filtreleme**: İsimlere göre filtreleme yapabilirsiniz
- **Silme yetkisi**: Sadece kendi eklediğiniz işlemleri silebilirsiniz

## Kurulum

1. `npm install`
2. `.env.local.example` dosyasını `.env.local` olarak kopyala ve Supabase bilgilerini doldur:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key
3. Supabase SQL Editor'de `supabase-schema.sql` dosyasını çalıştır
4. `npm run dev`

## Vercel'e deploy

1. Bu klasörü GitHub'a ayrı bir repo olarak pushla
2. Vercel dashboard > Add New Project > o repoyu seç
3. Environment Variables kısmına `.env.local` içindeki iki değeri ekle
4. Deploy

## Kullanım

1. Siteye girin, isminizi yazın (Furkan, Arkadaş, vb.)
2. İşlem ekleyin, filtreleyin, istatistikleri görün
3. Farklı yerlerden bile olsanız, her ikiniz de erişebilirsiniz
4. Sadece kendi eklediğiniz işlemleri silebilirsiniz
