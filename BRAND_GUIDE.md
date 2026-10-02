# Thendisch Studio — marka ve arayüz rehberi

## Marka yapısı

Thendisch Studio ana markadır. Müzik odası, keşif listeleri, topluluk, kullanıcı profilleri ve Sizden Gelenler aynı görsel sistemi kullanır. Sizden Gelenler, Mustafa İnce YouTube kanalının haftalık programına başvuru deneyimidir.

Ana mesaj: **Sesini duyur. İzini bırak.**

## Renkler

| İşlev | Renk |
| --- | --- |
| Ana zemin | `#090B0E` |
| Panel | `#12161B` |
| Yükseltilmiş yüzey | `#1B222C` |
| Ana vurgu | `#FF543B` |
| Vurgu etkileşimi | `#FF6C55` |
| Ana metin | `#F7F8FA` |
| Yardımcı metin | `#ADB5C0` |
| Çizgi | `#2B323D` |

Geniş yüzeyler düz renktir. Kırmızı, eylem ve odak noktası için kullanılır. Başarı ve hata renkleri yalnızca durum bildirimlerinde kullanılır. Platform logoları kendi resmi renklerini korur.

## Tipografi

- **Cormorant Garamond:** ana ve bölüm başlıkları, 400–500 ağırlık. İtalik yalnızca bir vurgu için.
- **Space Grotesk:** açıklamalar, kontroller, formlar ve arayüz başlıkları.
- **JetBrains Mono:** indeks, süre ve kısa bölüm etiketleri.
- Türkçe karakterler için Latin Extended kapsamı kullanılır. Yapay kalınlaştırma kapalıdır.
- Yardımcı etiketler en az 12 px, açıklamalar genellikle 14–17 px. Ana eylemler belirgin ve kolay okunur.

## Yüzey ve düzen

- Kartlar, form alanları ve butonlar köşesizdir.
- Yuvarlak biçim yalnızca plak, fotoğrafın içeriği ve resmi logo gibi anlamlı görsel öğelerde kullanılır.
- Her bölümde tek bir başlık ve bir ana eylem vardır. Boşluk ölçeği 8, 16, 24, 32, 48, 64 px.
- Kontroller, klavye odağı ve farklı ekran genişliklerinde kullanılabilir kalır.
- Hareketler kısa ve işlevseldir; azaltılmış hareket tercihi desteklenir.

## Yazım ve ses

Doğrudan, samimi ve kısa Türkçe kullan. “Parçanı paylaş”, “Müzik odasına gir”, “Yeni sesler keşfet” gibi eylem ifadeleri tercih edilir. Yapay heyecan, gereksiz ünlem ve emoji kullanılmaz. Kullanıcıya doğrulanmamış erişim veya yayın garantisi verilmez. Sanatçı adları ve kullanıcı tarafından belirtilen özel proje metinleri korunur.

## Logolar

T monogramı Thendisch Studio kimliğidir. Kanal fotoğrafları kullanıcının sağladığı yerel görsellerdir. Şirket logosu gerektiğinde resmi dosya kullanılır; logolar yeniden çizilmez, renklendirilmez, esnetilmez ve üzerlerine gölge veya filtre eklenmez. Logonun yanında okunabilir platform adı bulunur.

### Resmi kaynaklar

| Platform | Kaynak | Yerel dosya |
| --- | --- | --- |
| Spotify | https://newsroom.spotify.com/media-kit/logo-and-brand-assets/ | `public/brands/spotify.png` |
| Instagram | https://www.meta.com/brand/resources/instagram/instagram-brand/ | `public/brands/instagram.svg` |
| Facebook | https://www.meta.com/brand/resources/facebook/logo/ | `public/brands/facebook.png` |
| TikTok | https://developers.tiktok.com/docs/en/getting-started-design-guidelines | `public/brands/tiktok.png` |
| YouTube | https://brand.youtube/ | `public/brands/youtube.svg` |
| Google | https://brand.youtube/ (resmi Google G simgesi) | `public/brands/google.svg` |

Dosyalar 2 Ekim 2026 tarihinde resmi kaynaklardan alınmıştır. Şirket işaretleri ilgili sahiplerine aittir. E-posta simgesi şirket logosu değildir; ortak çizgi ikon sistemi kullanır.

## Uygulama

Ana uygulamada `app/globals.css`, `components/SiteNavigation.tsx` ve `components/BrandIcon.tsx` ortak sistemi taşır. Sizden Gelenler uygulamasında `public/studio-brand.css` başvuru, yönetim ve bilgi sayfalarını aynı sistemle düzenler. Başvuru, yetkilendirme, oynatıcı ve veri işlemleri görsel sistemden ayrı tutulur.
