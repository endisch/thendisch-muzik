# Thendisch Müzik Platformu

thendisch.com/müzik — kullanıcıların şarkı yükleyip ortak kuyruğa eklediği,
7/24 herkesin aynı anda aynı şarkıyı dinlediği canlı radyo.

## Mimari
- **Next.js 14** (App Router) — hem frontend hem API route'ları
- **PostgreSQL + Prisma** — kullanıcı, şarkı, kuyruk, dinleme kaydı
- **NextAuth.js (Google)** — giriş
- **Cloudflare R2** — ses dosyası depolama (S3 uyumlu, egress ücretsiz)

Senkron radyo mantığı `lib/radio.ts` + `/api/now-playing` içinde: merkezi
tek bir "şu an çalan şarkı + başlangıç zamanı" kaydı tutulur, her istemci
buna bağlanıp kendi player'ını doğru saniyeden başlatır.

## Yerel kurulum
```bash
npm install
cp .env.example .env   # değerleri doldur
npx prisma migrate dev --name init
npm run dev
```

## GitHub'a yükleme
```bash
git init
git add .
git commit -m "İlk iskelet: auth, DB şeması, radyo senkron API"
git branch -M main
git remote add origin https://github.com/endisch/thendisch-muzik.git
git push -u origin main
```
(Önce github.com/endisch üzerinde "thendisch-muzik" adında boş bir repo oluşturman gerekiyor.)

## Railway'e deploy
1. Railway'de "New Project" → "Deploy from GitHub repo" → bu repoyu seç
2. Railway'e PostgreSQL addon ekle (DATABASE_URL otomatik enjekte edilir)
3. Environment Variables kısmına `.env.example`'daki diğer değerleri gir
   (Google OAuth bilgileri, R2 bilgileri, NEXTAUTH_URL = thendisch.com adresi)
4. Deploy sonrası bir kereliğine: Railway Shell'den `npx prisma migrate deploy`
5. thendisch.com DNS/subdomain yapılandırmasını Railway'in verdiği domaine yönlendir

## Google OAuth kurulumu
Google Cloud Console → APIs & Services → Credentials → OAuth Client ID
- Authorized redirect URI: `https://www.thendisch.com/api/auth/callback/google`

## Cloudflare R2 kurulumu
Cloudflare Dashboard → R2 → bucket oluştur (`thendisch-muzik`) → API token oluştur
(Object Read & Write yetkisiyle) → Account ID, Access Key ID, Secret'i .env'e gir

## Şu ana kadar tamamlanan
- Veritabanı şeması (kullanıcı, şarkı, kuyruk, now-playing, dinleme geçmişi)
- Google girişi + ilk girişte 3 yükleme hakkı
- R2'ye doğrudan yükleme (presigned URL)
- Senkron "herkes aynı şarkıyı aynı anda dinler" radyo motoru
- LRC formatlı senkron söz gösterimi
- 10 tam dinlemede otomatik yeni yükleme hakkı
- Yükleme Formu, Kategori ve Tür Etiketleri (UI ve mantık)
- Kuyruk Listesi
- Yüklenen ses dosyasından tarayıcıda (client-side) otomatik süre (duration) çıkarma
- Oturum durumuna göre hak bitimi ve yükleme izni UI kontrolü

## Sırada (İsteğe Bağlı)
- Kuyruğa eklenen şarkının admin/moderasyon onayı (istenirse eklenebilir)
