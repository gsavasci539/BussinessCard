# Kartvizit Mobile App

React Native ile geliştirilmiş, iOS ve Android uyumlu kartvizit mobil uygulaması.

## Özellikler

- 📱 **Platform Desteği**: iOS ve Android
- 🔐 **Kullanıcı Girişi**: Kayıt ve giriş sistemi
- 👤 **Profil Yönetimi**: Kişisel ve iletişim bilgileri
- 🎨 **Tema Özelleştirme**: Renk, font ve arka plan seçenekleri
- 📇 **Kartvizit Görüntüleme**: Profesyonel kartvizit görünümü
- 📱 **QR Kod Paylaşımı**: Kartviziti QR kod ile paylaşma
- 📤 **Paylaşım Özellikleri**: Kartvizit bilgilerini paylaşma
- 💾 **Veri Senkronizasyonu**: Backend API ile entegrasyon

## Kurulum

### Gereksinimler

- Node.js (v16 veya üzeri)
- npm veya yarn
- React Native CLI
- Android Studio (Android geliştirme için)
- Xcode (iOS geliştirme için - sadece macOS)

### Proje Kurulumu

1. Depoyu klonlayın:
```bash
git clone <repository-url>
cd kartvizit/mobile-app
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
```

3. iOS için (sadece macOS):
```bash
cd ios
pod install
cd ..
```

### Çalıştırma

#### Android

1. Android Studio'yu açın ve SDK'yı yükleyin
2. Emülatör oluşturun veya fiziksel cihaz bağlayın
3. Uygulamayı çalıştırın:
```bash
npm run android
# veya
yarn android
```

#### iOS (sadece macOS)

1. Xcode'yi açın
2. iOS simülatörünü başlatın
3. Uygulamayı çalıştırın:
```bash
npm run ios
# veya
yarn ios
```

## Proje Yapısı

```
mobile-app/
├── src/
│   ├── components/        # Özelleştirilmiş bileşenler
│   ├── navigation/        # Navigasyon konfigürasyonu
│   ├── screens/           # Uygulama ekranları
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── CardScreen.js
│   │   └── SettingsScreen.js
│   └── utils/             # Yardımcı fonksiyonlar
│       └── api.js         # API entegrasyonu
├── android/               # Android proje dosyaları
├── ios/                   # iOS proje dosyaları
├── index.js               # Ana giriş noktası
├── App.js                 # Ana uygulama bileşeni
└── package.json           # Proje bağımlılıkları
```

## Ekranlar

### 1. Giriş Ekranı (LoginScreen)
- Kullanıcı adı ve şifre ile giriş
- Kayıt olma linki
- Türkçe karakter desteği

### 2. Kayıt Ekranı (RegisterScreen)
- Yeni kullanıcı kaydı
- Form doğrulama
- Şifre güvenlik kontrolü

### 3. Ana Sayfa (HomeScreen)
- Menü navigasyonu
- Kullanıcı bilgileri
- Hızlı erişim butonları

### 4. Profil Ekranı (ProfileScreen)
- Kişisel bilgileri düzenleme
- İletişim bilgileri
- Hakkında bölümü

### 5. Kartvizit Ekranı (CardScreen)
- Kartvizit görüntüleme
- QR kod gösterimi
- Paylaşım özellikleri

### 6. Ayarlar Ekranı (SettingsScreen)
- Tema özelleştirme
- Renk seçimi
- Font ayarları
- Arka plan görseli

## API Entegrasyonu

Uygulama, backend API ile iletişim kurmak için axios kullanır:

- **Auth API**: Giriş, kayıt, oturum yönetimi
- **Profile API**: Profil bilgileri CRUD işlemleri
- **Theme API**: Tema ayarları yönetimi

### API Ayarları

API base URL'si `src/utils/api.js` dosyasında yapılandırılır:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Tema Sistemi

Uygulama, dinamik tema sistemini destekler:

- **Birincil Renk**: Kartvizit arka plan rengi
- **Arka Plan Görseli**: URL ile görsel yükleme
- **Font Seçimi**: 6 farklı font seçeneği
- **Hazır Temalar**: Önceden tanımlanmış renk şemaları

## Depolama

Uygulama, kullanıcı verilerini saklamak için AsyncStorage kullanır:

- **Token**: Kimlik doğrulama token'ı
- **User**: Kullanıcı bilgileri
- **Theme**: Tema ayarları

## Hata Yönetimi

Tüm API çağrıları için merkezi hata yönetimi:

- Ağ hataları
- Sunucu hataları
- Doğrulama hataları
- Yetkilendirme hataları

## Geliştirme

### Yeni Ekran Ekleme

1. `src/screens/` klasöründe yeni ekran dosyası oluşturun
2. `src/App.js` dosyasına ekranı ekleyin
3. Navigasyon stack'e ekleyin

### Yeni Bileşen Ekleme

1. `src/components/` klasöründe bileşen dosyası oluşturun
2. Gerekli ekranlarda bileşeni kullanın

### API Endpoint Ekleme

1. `src/utils/api.js` dosyasına yeni fonksiyon ekleyin
2. İlgili ekranlarda API fonksiyonunu çağırın

## Build ve Dağıtım

### Android Build

```bash
cd android
./gradlew assembleRelease
```

### iOS Build

```bash
cd ios
xcodebuild -workspace KartvizitMobile.xcworkspace -scheme KartvizitMobile -configuration Release archive
```

## Katkıda Bulunma

1. Depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/new-feature`)
3. Değişikliklerinizi commit edin (`git commit -am 'Add new feature'`)
4. Branch'i push edin (`git push origin feature/new-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

## Destek

Sorularınız veya sorunlarınız için lütfen bir issue oluşturun.
