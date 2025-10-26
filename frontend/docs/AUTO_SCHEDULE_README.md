# 🤖 Otomatik Takvim Oluşturma Sistemi

## 📋 Genel Bakış

Shiffy artık **her hafta otomatik olarak** AI takvimi oluşturabilir! Sistem her Pazar günü saat 23:00'da çalışarak gelecek hafta için tüm yöneticilere otomatik takvim oluşturur.

## ⏰ Otomatik Çalışma

### Zamanlama
- **Gün**: Her Pazar
- **Saat**: 23:00 (Türkiye saati - Europe/Istanbul)
- **Amaç**: Gelecek Pazartesi başlangıçlı hafta için takvim oluşturma

### Çalışma Mantığı

```
Pazar 23:00 → Cron job tetiklenir
              ↓
         Tüm yöneticiler bulunur
              ↓
    Her yönetici için AI takvim oluşturulur
              ↓
         Sonuçlar loglanır
```

### Takvim Başlangıç Tarihi
Sistem otomatik olarak **bir sonraki Pazartesi** tarihini hesaplar:
- Bugün Pazar ise → Yarın (Pazartesi)
- Bugün Pazartesi ise → Gelecek Pazartesi (7 gün sonra)
- Bugün Cumartesi ise → 2 gün sonrası (Pazartesi)

## 🚀 Kullanım

### 1. Otomatik Mod (Varsayılan)

Backend başlatıldığında otomatik servis aktif olur:

```bash
cd backend
npm run dev
```

Konsolda göreceksiniz:
```
⏰ Initializing Auto-Schedule Service...
✅ Auto-Schedule Service Started - Schedules will be generated every Sunday at 23:00
```

### 2. Manuel Tetikleme (Manager API)

#### Kendi İçin Takvim Oluşturma

```typescript
import { triggerAutoScheduleForMe } from '@/services/schedule';

// Gelecek hafta için takvim oluştur
const schedule = await triggerAutoScheduleForMe();
console.log('Takvim oluşturuldu:', schedule);
```

**API Endpoint:**
```http
POST /api/auto-schedule/trigger-me
Authorization: Bearer <manager-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Schedule generated successfully",
    "schedule": {
      "id": "uuid-here",
      "week_start": "2025-10-28",
      "status": "generated",
      "shifts": [...],
      "summary": {...}
    }
  }
}
```

#### Tüm Yöneticiler İçin Takvim Oluşturma

```typescript
import { triggerAutoScheduleForAll } from '@/services/schedule';

// Tüm yöneticiler için takvim oluştur
const result = await triggerAutoScheduleForAll();
console.log(`Başarılı: ${result.success}, Başarısız: ${result.failed}`);
console.log('Detaylar:', result.details);
```

**API Endpoint:**
```http
POST /api/auto-schedule/trigger-all
Authorization: Bearer <manager-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Auto-schedule generation completed",
    "success": 5,
    "failed": 1,
    "details": [
      {
        "managerId": "uuid-1",
        "email": "manager1@example.com",
        "status": "success"
      },
      {
        "managerId": "uuid-2",
        "email": "manager2@example.com",
        "status": "failed",
        "error": "No employees found"
      }
    ]
  }
}
```

#### Servis Durumunu Kontrol Etme

```typescript
import { getAutoScheduleStatus } from '@/services/schedule';

const status = await getAutoScheduleStatus();
console.log('Aktif mi?', status.enabled);
console.log('Sonraki çalışma:', status.nextRun);
```

**API Endpoint:**
```http
GET /api/auto-schedule/status
Authorization: Bearer <manager-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "nextRun": "Next Sunday at 23:00"
  }
}
```

## 🏗️ Teknik Detaylar

### Backend Yapısı

#### 1. Auto-Schedule Service
**Dosya:** `backend/src/services/auto-schedule.service.ts`

```typescript
class AutoScheduleService {
  // Servisi başlat
  initialize()
  
  // Cron job'u başlat
  start()
  
  // Cron job'u durdur
  stop()
  
  // Tüm yöneticiler için takvim oluştur
  generateSchedulesForAllManagers()
  
  // Belirli yönetici için takvim oluştur
  generateScheduleForManager(managerId)
  
  // Sonraki Pazartesi tarihini hesapla
  private getNextWeekMonday()
}
```

#### 2. API Routes
**Dosya:** `backend/src/routes/auto-schedule.routes.ts`

```typescript
POST   /api/auto-schedule/trigger-all  // Tüm yöneticiler
POST   /api/auto-schedule/trigger-me   // Sadece ben
GET    /api/auto-schedule/status       // Durum kontrolü
```

#### 3. Cron Schedule
**Format:** `'0 23 * * 0'`
- `0` - Dakika (0)
- `23` - Saat (23:00)
- `*` - Her ayın her günü
- `*` - Her ay
- `0` - Pazar (0=Pazar, 1=Pazartesi, ..., 6=Cumartesi)

### Frontend Entegrasyonu

**Dosya:** `frontend/services/schedule.ts`

Yeni fonksiyonlar eklendi:
- `triggerAutoScheduleForMe()` - Kendi takvimimi oluştur
- `triggerAutoScheduleForAll()` - Herkese takvim oluştur
- `getAutoScheduleStatus()` - Durum kontrolü

## 📊 Monitoring ve Loglar

### Backend Console Logları

```bash
[AUTO-SCHEDULE] Cron job triggered at 2025-10-27T23:00:00.000Z
[AUTO-SCHEDULE] Starting automatic schedule generation...
[AUTO-SCHEDULE] Generating schedules for week starting: 2025-10-28
[AUTO-SCHEDULE] Found 10 managers
[AUTO-SCHEDULE] Generating schedule for manager: manager1@example.com
[AUTO-SCHEDULE] ✅ Schedule generated for manager1@example.com
[AUTO-SCHEDULE] Generating schedule for manager: manager2@example.com
[AUTO-SCHEDULE] ✅ Schedule generated for manager2@example.com
[AUTO-SCHEDULE] Completed: 9 success, 1 failed
```

### Hata Durumları

Sistem hata durumlarını loglar ve devam eder:

```bash
[AUTO-SCHEDULE] ❌ Failed for manager3@example.com: No employees found for this manager
```

Bir yönetici için hata olsa bile diğerleri için takvim oluşturulmaya devam eder.

## 🔧 Yapılandırma

### Cron Zamanlamasını Değiştirme

`backend/src/services/auto-schedule.service.ts` dosyasında:

```typescript
// Her Pazar 23:00 (varsayılan)
this.cronJob = cron.schedule('0 23 * * 0', ...)

// Örnek: Her gün 00:00
this.cronJob = cron.schedule('0 0 * * *', ...)

// Örnek: Her Pazartesi 08:00
this.cronJob = cron.schedule('0 8 * * 1', ...)

// Örnek: Her 6 saatte bir
this.cronJob = cron.schedule('0 */6 * * *', ...)
```

### Timezone Değiştirme

```typescript
this.cronJob = cron.schedule('0 23 * * 0', async () => {
  // ...
}, {
  timezone: 'Europe/Istanbul' // Buradan değiştirebilirsiniz
});
```

Desteklenen timezone'lar: [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## 🎯 Özellikler

### ✅ Yapılanlar
- [x] Otomatik haftalık takvim oluşturma
- [x] Cron job ile zamanlama
- [x] Manuel tetikleme API'leri
- [x] Tüm yöneticiler için toplu oluşturma
- [x] Detaylı hata yönetimi
- [x] Kapsamlı loglama
- [x] Frontend servisleri
- [x] Timezone desteği

### 🚀 Gelecek İyileştirmeler
- [ ] Email bildirimleri (takvim oluşturulduğunda)
- [ ] Slack/Discord webhook entegrasyonu
- [ ] Dashboard'da otomatik takvim geçmişi
- [ ] Özelleştirilebilir cron ayarları (UI'dan)
- [ ] Retry mekanizması (başarısız olanlar için)
- [ ] Takvim oluşturma önceliği (VIP yöneticiler önce)

## 📝 Notlar

1. **Takvim Durumu**: Otomatik oluşturulan takvimler `generated` durumunda olur. Yöneticinin onaylaması gerekir (`approved`).

2. **Çalışan Sayısı**: Eğer yöneticinin hiç çalışanı yoksa, o yönetici için takvim oluşturulmaz (hata loglanır).

3. **AI Timeout**: RunPod/Ollama timeout verirse, o yönetici için hata kaydedilir ve diğerleri için devam edilir.

4. **Mevcut Takvimler**: Eğer aynı hafta için zaten takvim varsa, yeni takvim oluşturulmaz (hata verir).

## 🐛 Sorun Giderme

### Cron Job Çalışmıyor

1. Backend loglarını kontrol edin:
```bash
npm run dev
# Şunu görmelisiniz: "Auto-Schedule Service Started"
```

2. Durum kontrolü yapın:
```bash
curl http://localhost:3000/api/auto-schedule/status \
  -H "Authorization: Bearer <manager-token>"
```

### Test Etme

Manuel tetikleme ile test edebilirsiniz:

```bash
# Sadece kendi takvimim
curl -X POST http://localhost:3000/api/auto-schedule/trigger-me \
  -H "Authorization: Bearer <manager-token>"

# Tüm yöneticiler
curl -X POST http://localhost:3000/api/auto-schedule/trigger-all \
  -H "Authorization: Bearer <manager-token>"
```

## 📞 Destek

Sorularınız için:
- Backend logs: `backend/` klasöründe
- Frontend: React Native debugger
- API docs: `SHIFFY_BACKEND_DOCS.md`

---

**Son Güncelleme:** 25 Ekim 2025  
**Versiyon:** 1.0.0
