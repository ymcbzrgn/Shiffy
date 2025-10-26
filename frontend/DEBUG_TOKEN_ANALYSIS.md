# 🔍 Token Hatası Analizi

**Hata:** `Invalid or expired token`  
**Lokasyon:** `reports.tsx` → `getWeeklySalesReports()` → `/api/sales-reports/weekly/:weekStart`  
**Tarih:** 26 Ekim 2025

---

## 🧪 Sorun Analizi

### Akış:
```
Frontend (reports.tsx)
  ↓ useEffect on mount
  ↓ loadWeeklyData()
  ↓ getWeeklySalesReports(weekStart)
    ↓ services/sales-reports.ts
    ↓ apiClient<WeeklySalesData>('/api/sales-reports/weekly/:weekStart')
      ↓ services/api-client.ts
      ↓ getFreshToken()
        ↓ 1. Check AsyncStorage (employee token)
        ↓ 2. Fallback to Supabase (manager token)
      ↓ Add "Bearer <token>" header
      ↓ fetch(url)
        ↓ Backend: routes/sales-reports.routes.ts
        ↓ authMiddleware
          ↓ middleware/auth.middleware.ts
          ↓ Extract "Bearer <token>"
          ↓ verifyToken(token)
            ↓ utils/jwt.utils.ts
            ↓ jwt.verify(token, JWT_SECRET)
              ↓ ❌ FAIL: "Invalid or expired token"
```

---

## 🔎 Olası Nedenler

### 1. **Manager Supabase Session Expired** 🎯 EN MUHTEMEL
**Senaryo:**
- Manager login olmuş ama session süresi dolmuş
- AsyncStorage'da employee token yok (manager bu)
- Supabase session expired
- Frontend expired token gönderiyor
- Backend reject ediyor

**Kanıt:**
```typescript
// api-client.ts:15-32
async function getFreshToken(): Promise<string | null> {
  // First, try AsyncStorage (for employee tokens)
  const storedToken = await AsyncStorage.getItem('auth_token');
  
  if (storedToken) {
    return storedToken;  // Employee token (custom JWT)
  }

  // Fallback to Supabase (for manager tokens)
  const { data: { session }, error } = await supabase.auth.getSession();

  if (!error && session?.access_token) {
    return session.access_token;  // ⚠️ Bu expired olabilir!
  }

  return null;
}
```

**Problem:**
- Supabase `getSession()` cached session döndürür
- Expired session'ı refresh etmez
- Backend'e expired token gönderiliyor

---

### 2. **JWT Secret Mismatch** (Düşük Olasılık)
**Senaryo:**
- Backend JWT_SECRET değişti
- Eski token'lar artık invalid

**Kanıt:**
Backend JWT validation:
```typescript
// jwt.utils.ts:44-50
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;  // ❌ Expired veya wrong secret
  }
}
```

---

### 3. **Manager vs Employee Token Karışıklığı** (Orta Olasılık)
**Senaryo:**
- Manager login ama backend employee token bekliyor
- Ya da tersi

**Kanıt:**
Backend token payload:
```typescript
// jwt.utils.ts:21-27
export interface JWTPayload {
  user_id: string;
  user_type: 'employee' | 'manager';  // ⚠️ Type önemli
  manager_id: string;
  username: string;
  iat?: number;
  exp?: number;
}
```

Manager route:
```typescript
// sales-reports.routes.ts:110-113
router.get('/weekly/:weekStart', async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id;  // ⚠️ JWT'den gelen user_id
  
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  // Query by manager_id
  .eq('manager_id', userId)  // ⚠️ userId manager_id olmalı
```

---

## 🔧 Çözüm Önerileri

### ✅ Çözüm 1: Supabase Session Refresh (EN DOĞRU)
**Sorun:** `getSession()` expired session döndürüyor  
**Çözüm:** `getSession()` yerine `refreshSession()` kullan

**Değişiklik:**
```typescript
// api-client.ts
async function getFreshToken(): Promise<string | null> {
  // First, try AsyncStorage (for employee tokens)
  const storedToken = await AsyncStorage.getItem('auth_token');
  
  if (storedToken) {
    return storedToken;
  }

  // Fallback to Supabase (for manager tokens)
  // ❌ YANLIŞ: getSession() cached data döndürür
  // const { data: { session }, error } = await supabase.auth.getSession();

  // ✅ DOĞRU: refreshSession() her zaman fresh token alır
  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (!error && session?.access_token) {
    return session.access_token;
  }

  return null;
}
```

**Avantajları:**
- Expired session otomatik refresh
- Her zaman fresh token
- Minimum kod değişikliği

**Dezavantajları:**
- Her API call'da refresh (yavaş olabilir)
- Rate limiting riski

---

### ✅ Çözüm 2: Token Caching + Smart Refresh (DAHA İYİ)
**Sorun:** Her API call'da refresh pahalı  
**Çözüm:** Token'ı cache'le, sadece expired olduğunda refresh et

**Değişiklik:**
```typescript
// api-client.ts
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getFreshToken(): Promise<string | null> {
  // Check if cached token is still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // First, try AsyncStorage (for employee tokens)
  const storedToken = await AsyncStorage.getItem('auth_token');
  
  if (storedToken) {
    // Decode to check expiry
    const decoded = jwt.decode(storedToken) as any;
    if (decoded?.exp && decoded.exp * 1000 > Date.now()) {
      cachedToken = storedToken;
      tokenExpiry = decoded.exp * 1000;
      return storedToken;
    }
  }

  // Fallback to Supabase (for manager tokens)
  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (!error && session?.access_token) {
    cachedToken = session.access_token;
    tokenExpiry = Date.now() + 3600000; // 1 hour from now
    return session.access_token;
  }

  // Clear cache
  cachedToken = null;
  tokenExpiry = null;
  return null;
}
```

**Avantajları:**
- Performance (cache kullanıyor)
- Otomatik refresh
- Token expiry tracking

**Dezavantajları:**
- Daha kompleks kod

---

### ✅ Çözüm 3: User Type Check (GÜVENLİK)
**Sorun:** Manager vs employee token karışıklığı  
**Çözüm:** Backend'de user_type kontrolü ekle

**Değişiklik:**
```typescript
// backend/src/routes/sales-reports.routes.ts
router.get('/weekly/:weekStart', async (req: Request, res: Response) => {
  const user = req.user as JWTPayload;
  
  // ✅ Manager check
  if (user.user_type !== 'manager') {
    res.status(403).json({ 
      success: false, 
      error: 'Forbidden: Only managers can access sales reports' 
    });
    return;
  }
  
  const userId = user.user_id;
  
  // ... rest of code
```

---

### ✅ Çözüm 4: Better Error Messages (DEBUG)
**Sorun:** "Invalid or expired token" çok generic  
**Çözüm:** Daha detaylı error messages

**Değişiklik:**
```typescript
// backend/src/utils/jwt.utils.ts
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token:', error.message);
    } else {
      console.error('Token verification failed:', error);
    }
    return null;
  }
}

// auth.middleware.ts
if (!decoded) {
  res.status(401).json({
    success: false,
    error: 'Invalid or expired token',
    detail: process.env.NODE_ENV === 'development' ? 'Check server logs for details' : undefined
  });
  return;
}
```

---

## 🎯 Önerilen Aksiyon Planı

### Adım 1: Quick Fix (5 dakika) ✅ ÖNCE BU
**Amaç:** Hızlıca çalışır hale getir

```typescript
// frontend/services/api-client.ts
// Line 26'yı değiştir:
- const { data: { session }, error } = await supabase.auth.getSession();
+ const { data: { session }, error } = await supabase.auth.refreshSession();
```

**Test:**
1. App'i restart et
2. Manager login
3. Reports sayfasına git
4. ✅ Hata gitmeli

---

### Adım 2: Smart Caching (15 dakika) ⏭️ SONRA BU
**Amaç:** Performance iyileştir

Token caching implementasyonunu ekle (yukarıdaki Çözüm 2).

---

### Adım 3: User Type Validation (10 dakika) ⏭️ GÜVENLİK
**Amaç:** Security artır

Backend'e user_type kontrolü ekle (yukarıdaki Çözüm 3).

---

### Adım 4: Better Logging (5 dakika) ⏭️ DEBUG
**Amaç:** Gelecekte debug kolay olsun

Error messages iyileştir (yukarıdaki Çözüm 4).

---

## 📊 Test Senaryoları

### Test 1: Fresh Login
1. Logout yap
2. Yeniden manager login
3. Reports sayfası açılmalı
4. ✅ Weekly data yüklenmeli

### Test 2: Expired Session
1. Login ol
2. 1 saat bekle (veya backend'de expiry'yi 1 dakika yap)
3. Reports sayfası refresh
4. ✅ Otomatik refresh olmalı, hata vermemeli

### Test 3: No Token
1. AsyncStorage clear
2. Supabase logout
3. Reports sayfası aç
4. ✅ Login ekranına redirect olmalı

---

## 💡 Ek İyileştirmeler

### 1. Token Refresh Interceptor
Axios gibi bir HTTP client kullan, otomatik token refresh için.

### 2. Refresh Token Strategy
Supabase'in refresh token sistemini tam kullan.

### 3. Token Expiry Warning
Token expire olmadan önce kullanıcıyı uyar.

### 4. Retry Logic
Token refresh başarısız olursa 1-2 kere tekrar dene.

---

**Sonuç:** En muhtemel neden Supabase session expired. Hızlı çözüm: `refreshSession()` kullan. ✅
