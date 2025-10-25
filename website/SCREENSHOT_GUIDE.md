# 📸 Ekran Görüntüleri Nasıl Eklenir?

## 🎯 Hızlı Başlangıç

### 1️⃣ Fotoğrafları Yerleştir

**Yönetici Uygulaması Fotoğrafları:**
```
src/assets/screenshots/manager/
├── 1.png  (veya .jpg)
├── 2.png
├── 3.png
└── 4.png
```

**Çalışan Uygulaması Fotoğrafları:**
```
src/assets/screenshots/employee/
├── 1.png  (veya .jpg)
├── 2.png
├── 3.png
└── 4.png
```

### 2️⃣ Kod Güncellemesi

`src/assets/screenshots.ts` dosyasını aç ve fotoğrafları import et:

```typescript
// Yönetici fotoğraflarını import et
import manager1 from './screenshots/manager/1.png';
import manager2 from './screenshots/manager/2.png';
import manager3 from './screenshots/manager/3.png';
import manager4 from './screenshots/manager/4.png';

// Çalışan fotoğraflarını import et
import employee1 from './screenshots/employee/1.png';
import employee2 from './screenshots/employee/2.png';
import employee3 from './screenshots/employee/3.png';
import employee4 from './screenshots/employee/4.png';

// Array'lere ekle
export const managerScreenshots = [
  manager1,
  manager2,
  manager3,
  manager4
];

export const employeeScreenshots = [
  employee1,
  employee2,
  employee3,
  employee4
];
```

### 3️⃣ Kaydet ve Test Et

- Dosyayı kaydet
- Tarayıcıda sayfayı yenile
- Carousel'de ok tuşları ve noktalar ile gezin

---

## 📐 Fotoğraf Gereksinimleri

### ✅ Önerilen Format
- **Dosya Tipi:** PNG (şeffaf arka plan için) veya JPG
- **Boyut Oranı:** 9:16 (mobil telefon oranı)
- **Çözünürlük:** 
  - Minimum: 750 x 1334 piksel (iPhone 6/7/8)
  - Önerilen: 1080 x 1920 piksel (Full HD)
  - Maksimum: 1242 x 2208 piksel (iPhone 8 Plus)

### 📱 Nereden Alınır?

1. **Gerçek Uygulama:** Telefon/emülatörden ekran görüntüsü
2. **Figma/Sketch:** Tasarım dosyasından export
3. **Mockup Tool:** Previewed.app, Mockuuups gibi araçlar

---

## 🎨 İçerik Önerileri

### Manager App (Yönetici Uygulaması)
1. **Dashboard/Ana Sayfa**
   - Genel bakış
   - İstatistikler
   - Hızlı eylemler

2. **Çalışan Listesi**
   - Tüm çalışanlar
   - Ekleme butonu görünür

3. **AI Tarafından Oluşturulan Program**
   - Haftalık takvim görünümü
   - Renk kodlu vardiyalar
   - Onay butonları

4. **Düzenleme Modu**
   - Sürükle-bırak özelliği
   - Çakışma uyarıları
   - Kaydet butonu

### Employee App (Çalışan Uygulaması)
1. **Müsaitlik Takvimi**
   - Interaktif grid
   - Seçilebilir günler/saatler
   - Gönder butonu

2. **Program Görünümü**
   - Onaylanmış vardiyalar
   - Tarih ve saat detayları
   - Bildirim ikonu

3. **Çalışma Saatleri**
   - Haftalık/aylık özet
   - Grafik veya liste
   - Toplam saat gösterimi

4. **Vardiya Değişimi**
   - Değiştirilebilir vardiyalar
   - Talep formu
   - Ekip üyeleri listesi

---

## 🔧 Troubleshooting

### ❌ Fotoğraflar Görünmüyor?
1. Dosya yolunu kontrol et (büyük/küçük harf)
2. Dosya uzantısını kontrol et (.png, .jpg, .jpeg)
3. Import statement'ları kontrol et
4. Terminal'de hata var mı bak

### ❌ Carousel Çalışmıyor?
1. En az 1 fotoğraf eklenmiş mi?
2. Array doğru export edilmiş mi?
3. Browser console'da hata var mı?

### ❌ Fotoğraflar Bulanık/Bozuk?
1. Çözünürlüğü artır (min 1080x1920)
2. PNG formatı kullan
3. Sıkıştırma kalitesini azalt

---

## 💡 Pro Tips

✨ **Tutarlılık:** Tüm ekranlar aynı tema/renk modunda olsun
✨ **Kalite:** Yüksek çözünürlüklü görseller kullan
✨ **Durum:** Gerçekçi veri göster (Lorem ipsum yerine)
✨ **Çerçeve:** iPhone/Android çerçevesi eklemek için mockup araçları kullan
✨ **Sıralama:** En önemli/etkileyici görseli 1. sıraya koy

---

## 📞 Yardım

Sorun yaşıyorsan:
1. `screenshots.ts` dosyasındaki örneklere bak
2. Console'da hata mesajlarını kontrol et
3. Klasör yapısını tekrar kontrol et
