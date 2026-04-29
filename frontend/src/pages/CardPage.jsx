import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import MapEmbed from '../components/MapEmbed';
import { api } from '../api/client';

function CardPage() {
  // Mock data for the card page
  const mockUserData = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'user',
    is_active: true,
    visit_count: 42,
    last_visited_at: new Date().toISOString(),
    created_at: '2023-01-01T00:00:00.000Z',
    phone: '+90 555 123 4567',
    website: 'https://example.com',
    address: 'İstanbul, Türkiye',
    about: 'Merhaba! Ben bir test kullanıcısıyım. Bu örnek bir kartvizit sayfasıdır.',
    appointments: [
      { id: 1, name: 'Danışmanlık Randevusu', url: 'https://forms.gle/example1' },
      { id: 2, name: 'Ücretsiz Görüşme', url: 'https://forms.gle/example2' },
    ],
    theme: {
      primaryColor: '#4f46e5',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      font: 'Inter, system-ui, -apple-system, sans-serif'
    },
    social_links: {
      linkedin: 'https://linkedin.com/in/testuser',
      x: 'https://twitter.com/testuser',
      instagram: 'https://instagram.com/testuser',
      facebook: 'https://facebook.com/testuser',
      github: 'https://github.com/testuser',
      youtube: 'https://youtube.com/@testuser',
      tiktok: 'https://tiktok.com/@testuser',
      services: [
        { name: 'Web Tasarım', description: 'Profesyonel web siteleri' },
        { name: 'SEO', description: 'Arama motoru optimizasyonu' },
        { name: 'Sosyal Medya', description: 'Sosyal medya yönetimi' }
      ],
      catalog_url: 'https://example.com/catalog.pdf'
    },
    gallery: [
      { url: 'https://via.placeholder.com/400x300', title: 'Proje 1' },
      { url: 'https://via.placeholder.com/400x300', title: 'Proje 2' },
      { url: 'https://via.placeholder.com/400x300', title: 'Proje 3' }
    ],
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    marketplaces: [
      { name: 'Trendyol', url: 'https://trendyol.com/satici/12345' },
      { name: 'Hepsiburada', url: 'https://hepsiburada.com/satici/12345' }
    ],
    account_numbers: [
      { bank: 'Ziraat Bankası', name: 'Ahmet Yılmaz', iban: 'TR00 0000 0000 0000 0000 0000 01' },
      { bank: 'Garanti BBVA', name: 'Ahmet Yılmaz', iban: 'TR00 0000 0000 0000 0000 0000 02' }
    ]
  };

  const { username } = useParams();
  const [data, setData] = useState({}); // Boş obje ile başla
  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002';
  const [activeTab, setActiveTab] = useState('about');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Theme and derived state
  const primary = data?.theme?.primaryColor || '#111827';
  const bgImage = data?.theme?.backgroundImage || '';
  const font = data?.theme?.font || 'Inter, system-ui';
  
  // Derived state
  const hasEmail = !!data?.email;
  const hasPhone = !!data?.phone;
  const hasWebsite = !!data?.website;
  const hasMap = !!(data?.address || data?.social_links?.map_embed);
  const socials = data?.social_links || {};
  const hasAnySocial = !!(socials.linkedin || socials.instagram || socials.github || 
    socials.x || socials.facebook || socials.youtube || socials.tiktok);
  // Normalize services: accept array or object map { name: description }
  let servicesFromLinks = [];
  if (Array.isArray(socials.services)) {
    servicesFromLinks = socials.services;
  } else if (socials.services && typeof socials.services === 'object') {
    servicesFromLinks = Object.entries(socials.services).map(([k, v]) => ({ name: k, description: v }));
  }
  const servicesAlt = Array.isArray(data?.services) ? data.services : [];
  const services = servicesFromLinks.length ? servicesFromLinks : servicesAlt;
  const hasCatalog = !!socials.catalog_url;
  const hasGallery = data?.gallery && Array.isArray(data.gallery) && data.gallery.length > 0;
  const galleryItems = data?.gallery?.map(item => {
    const obj = typeof item === 'string' ? { url: item } : item || {};
    const url = obj.url?.startsWith('http') ? obj.url : (obj.url ? `${apiBase}${obj.url}` : '');
    return { ...obj, url };
  }) || [];
  const hasVideo = !!data?.video_url;
  const hasMarketplaces = Array.isArray(data?.marketplaces) && data.marketplaces.length > 0;
  const hasAccountNumbers = Array.isArray(data?.account_numbers) && data.account_numbers.length > 0;

  // Load profile from backend (authenticated or public by username); fallback to mock
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // First, load the user profile
          const profileRes = await api.get('/api/profile');
          if (!mounted) return;
          
          if (profileRes?.data) {
            console.log('CardPage API yanıtı:', profileRes.data);
            console.log('CardPage theme:', profileRes.data.theme);
            
            // Then load appointments
            let appointments = [];
            try {
              const appointmentsRes = await api.get('/api/appointments');
              if (appointmentsRes?.data) {
                appointments = Array.isArray(appointmentsRes.data) ? 
                  appointmentsRes.data : [];
                console.log('Appointments loaded:', appointments);
              }
            } catch (appointmentError) {
              console.error('Error loading appointments:', appointmentError);
              // If there's an error loading appointments, use an empty array
              appointments = [];
            }

            // Merge profile data with appointments
            setData(prev => ({
              ...mockUserData, // Start with mock data as base
              ...profileRes.data, // Override with API data
              theme: profileRes.data.theme || mockUserData.theme,
              appointments: appointments.length > 0 ? appointments : (profileRes.data.appointments || [])
            }));
          } else {
            console.log('CardPage API yanıtı yok, mock veri kullanılıyor');
            setData(mockUserData);
          }
        } else if (username) {
          // For public profile
          const publicRes = await api.get(`/api/public/profile/${username}`);
          if (!mounted) return;
          
          if (publicRes?.data) {
            console.log('CardPage public API yanıtı:', publicRes.data);
            console.log('CardPage public theme:', publicRes.data.theme);
            
            // For public profiles, appointments should be included in the profile response
            const appointments = Array.isArray(publicRes.data.appointments) ? 
              publicRes.data.appointments : [];
            console.log('Public appointments:', appointments);
            
            setData(prev => ({
              ...mockUserData, // Start with mock data as base
              ...publicRes.data, // Override with API data
              theme: publicRes.data.theme || mockUserData.theme,
              appointments: appointments
            }));
          } else {
            console.log('CardPage public API yanıtı yok, mock veri kullanılıyor');
            setData(mockUserData);
          }
        } else {
          console.log('Token ve username yok, mock veri kullanılıyor');
          setData(mockUserData);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
        if (mounted) setError(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [username]); // Add username to dependency array to refetch when it changes

  // Stub for click analysis
  const createAnalysis = (platform) => {
    try {
      // TODO: send to backend when endpoint is available
      console.debug('CreateAnalysis:', platform);
    } catch (error) {
      console.error('Error in createAnalysis:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    const errorMessage = error.message || 'Beklenmeyen bir hata oluştu';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-6 max-w-md">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Hata Oluştu</h2>
            <p className="text-gray-300 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
        
        {import.meta.env.DEV && error.stack && (
          <div className="container mx-auto p-4">
            <details className="text-left text-xs text-gray-500 border-t border-gray-700 pt-4">
              <summary className="cursor-pointer mb-2">Hata Detayları</summary>
              <pre className="bg-gray-800 p-3 rounded overflow-auto max-h-40 text-gray-300">
                {error.stack}
              </pre>
            </details>
          </div>
        )}
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen overflow-x-hidden" style={{
      backgroundImage: bgImage ? `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url(${bgImage})` : undefined,
      backgroundColor: bgImage ? undefined : primary,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: font,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8">
          <div className="text-center">
            <div className="flex flex-col items-center">
              {data.photo_url && (
                <div className="relative inline-block mb-3">
                  <img 
                    src={data.photo_url.startsWith('http') ? data.photo_url : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002'}${data.photo_url}`} 
                    alt="avatar" 
                    className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full object-cover border-4 border-white/80 shadow-lg" 
                    onError={(e) => {
                      // Fallback to a default avatar if image fails to load
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
              )}
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: bgImage ? primary : '#ffffff' }}>
                {data.full_name || 'Kullanıcı'}
              </h1>
              
              {/* Title and Company */}
              {(data.title || data.company) && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-4 mb-4">
                  {data.title && (
                    <p className="text-lg sm:text-xl text-blue-300">
                      {data.title}
                    </p>
                  )}
                  {data.title && data.company && (
                    <span className="hidden sm:block text-gray-400">•</span>
                  )}
                  {data.company && (
                    <p className="text-lg sm:text-xl text-gray-300">
                      {data.company}
                    </p>
                  )}
                </div>
              )}
              
              {/* Hide role badge on public card */}
              
              {/* Hide short about under name in header; full About is shown in About tab */}
              
              {/* QR Kodu Göster Butonu */}
              <button
                onClick={() => setShowQRModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR Kodu Göster
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-8 sm:pb-12 md:pb-16">
          <div className="w-full bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            {/* Tabs Navigation */}
            <div className="border-b border-white/10">
              <nav className="flex overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'about'
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Hakkımda
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'services'
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Hizmetler
                </button>
                
                {hasGallery && (
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === 'gallery'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Galeri
                  </button>
                )}
                
                {hasVideo && (
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === 'video'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Video
                  </button>
                )}
                
                {hasCatalog && (
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === 'catalog'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Katalog
                  </button>
                )}
                
                {hasMarketplaces && (
                  <button
                    onClick={() => setActiveTab('marketplaces')}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === 'marketplaces'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Mağazalar
                  </button>
                )}
                
                {hasAccountNumbers && (
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === 'accounts'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Banka Hesapları
                  </button>
                )}
              </nav>
            </div>

            {/* Tabs Content */}
            <div className="p-4 sm:p-6">
              {activeTab === 'about' && (
                <>
                  {/* About text should appear before location and other sections */}
                  {data.about && (
                    <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-lg font-semibold mb-2 text-white">Hakkımda</h3>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">{data.about}</p>
                    </div>
                  )}

                  {/* Contact info (only if at least one available) */}
                  {(hasPhone || hasEmail || hasWebsite) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {hasPhone && (
                        <a
                          href={`tel:${data.phone.replace(/[^0-9+]/g, '')}`}
                          onClick={() => createAnalysis('phone')}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-400">Telefon</p>
                            <p className="text-white font-medium">{data.phone}</p>
                          </div>
                        </a>
                      )}

                      {hasEmail && (
                        <a
                          href={`mailto:${data.email}`}
                          onClick={() => createAnalysis('email')}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-400">E-posta</p>
                            <p className="text-white font-medium">{data.email}</p>
                          </div>
                        </a>
                      )}

                      {hasWebsite && (
                        <a
                          href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                          onClick={() => createAnalysis('website')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                              />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-400">Web Sitesi</p>
                            <p className="text-white font-medium">
                              {data.website.replace(/^https?:\/\//, '').split('/')[0]}
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Randevu Butonları */}
                  {data.appointments && data.appointments.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      <p className="text-sm font-medium text-gray-300">Randevu Al</p>
                      {data.appointments.map((appointment, index) => {
                        // Ensure we have the required fields
                        const hasValidAppointment = appointment && 
                          (appointment.url || appointment.link) && 
                          (appointment.title || appointment.name);
                        
                        if (!hasValidAppointment) return null;
                        
                        const url = appointment.url || appointment.link || '#';
                        const title = appointment.title || appointment.name || 'Randevu';
                        
                        return (
                          <a
                            key={appointment.id || `appointment-${index}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => createAnalysis(`appointment-${appointment.id || index}`)}
                            className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:opacity-90 transition-opacity"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <span className="text-white font-medium">{title}</span>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-white/80"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    // Show a message when there are no appointments
                    <div className="p-4 bg-white/5 rounded-lg border border-dashed border-white/10 text-center">
                      <p className="text-sm text-gray-400">Henüz randevu seçeneği eklenmemiş</p>
                    </div>
                  )}

                  {/* Social Media Links */}
                  {hasAnySocial && (
                    <div className="mt-8 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-lg font-bold mb-4 text-center text-white">
                        Sosyal Medya Hesaplarım
                      </h3>
                      <p className="text-sm text-gray-300 text-center mb-4">Beni takip edin, iletişimde kalalım</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {socials.instagram && (
                          <div className="bg-white/5 hover:bg-white/10 transition-all duration-200 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50">
                            <a
                              href={socials.instagram.startsWith('http') ? socials.instagram : `https://${socials.instagram}`}
                              onClick={() => createAnalysis('instagram')}
                              title="Instagram'da Takip Et"
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center justify-center p-4 h-full"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-2">
                                <img
                                  src="https://cdn.simpleicons.org/instagram/ffffff"
                                  alt="Instagram"
                                  className="h-5 w-5"
                                />
                              </div>
                              <span className="text-sm font-medium text-white">Instagram</span>
                              <span className="text-xs text-gray-400 mt-1">Takip Et</span>
                            </a>
                          </div>
                        )}

                        {socials.x && (
                          <div className="bg-white/5 hover:bg-white/10 transition-all duration-200 rounded-xl overflow-hidden border border-white/10 hover:border-black/50">
                            <a
                              href={socials.x.startsWith('http') ? socials.x : `https://${socials.x}`}
                              onClick={() => createAnalysis('x')}
                              title="X'de Takip Et"
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center justify-center p-4 text-white hover:text-black transition-colors duration-200"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center mb-2">
                                <img
                                  src="https://cdn.simpleicons.org/x/ffffff"
                                  alt="X"
                                  className="h-5 w-5"
                                />
                              </div>
                              <span className="text-sm font-medium text-white">X</span>
                              <span className="text-xs text-gray-400 mt-1">Takip Et</span>
                            </a>
                          </div>
                        )}

                        {socials.linkedin && (
                          <div className="bg-white/5 hover:bg-white/10 transition-all duration-200 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50">
                            <a
                              href={socials.linkedin.startsWith('http') ? socials.linkedin : `https://${socials.linkedin}`}
                              onClick={() => createAnalysis('linkedin')}
                              title="LinkedIn'de Bağlantı Kur"
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center justify-center p-4 h-full"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-2">
                                <img
                                  src="https://cdn.simpleicons.org/linkedin/ffffff"
                                  alt="LinkedIn"
                                  className="h-5 w-5"
                                />
                              </div>
                              <span className="text-sm font-medium text-white">LinkedIn</span>
                              <span className="text-xs text-gray-400 mt-1">Bağlantı Kur</span>
                            </a>
                          </div>
                        )}

                        {socials.facebook && (
                          <div className="bg-white/5 hover:bg-white/10 transition-all duration-200 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50">
                            <a
                              href={socials.facebook.startsWith('http') ? socials.facebook : `https://${socials.facebook}`}
                              onClick={() => createAnalysis('facebook')}
                              title="Facebook'ta Takip Et"
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center justify-center p-4 h-full"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-2">
                                <img
                                  src="https://cdn.simpleicons.org/facebook/ffffff"
                                  alt="Facebook"
                                  className="h-5 w-5"
                                />
                              </div>
                              <span className="text-sm font-medium text-white">Facebook</span>
                              <span className="text-xs text-gray-400 mt-1">Takip Et</span>
                            </a>
                          </div>
                        )}

                        {socials.github && (
                          <div className="bg-white/5 hover:bg-white/10 transition-all duration-200 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50">
                            <a
                              href={socials.github.startsWith('http') ? socials.github : `https://${socials.github}`}
                              onClick={() => createAnalysis('github')}
                              title="GitHub'ta Projelerim"
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center justify-center p-4 h-full"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mb-2">
                                <img
                                  src="https://cdn.simpleicons.org/github/ffffff"
                                  alt="GitHub"
                                  className="h-5 w-5"
                                />
                              </div>
                              <span className="text-sm font-medium text-white">GitHub</span>
                              <span className="text-xs text-gray-400 mt-1">Projelerim</span>
                            </a>
                          </div>
                        )}

                        {socials.youtube && (
                          <div className="bg-white/5 hover:bg-white/10 transition-all duration-200 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50">
                            <a
                              href={socials.youtube.startsWith('http') ? socials.youtube : `https://${socials.youtube}`}
                              onClick={() => createAnalysis('youtube')}
                              title="YouTube'da Abone Ol"
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center justify-center p-4 h-full"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mb-2">
                                <img
                                  src="https://cdn.simpleicons.org/youtube/ffffff"
                                  alt="YouTube"
                                  className="h-5 w-5"
                                />
                              </div>
                              <span className="text-sm font-medium text-white">YouTube</span>
                              <span className="text-xs text-gray-400 mt-1">Abone Ol</span>
                            </a>
                          </div>
                        )}

                        {socials.tiktok && (
                          <div className="bg-white/5 hover:bg-white/10 transition-all duration-200 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50">
                            <a
                              href={socials.tiktok.startsWith('http') ? socials.tiktok : `https://${socials.tiktok}`}
                              onClick={() => createAnalysis('tiktok')}
                              title="TikTok'ta Takip Et"
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center justify-center p-4 h-full"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mb-2">
                                <img
                                  src="https://cdn.simpleicons.org/tiktok/ffffff"
                                  alt="TikTok"
                                  className="h-5 w-5"
                                />
                              </div>
                              <span className="text-sm font-medium text-white">TikTok</span>
                              <span className="text-xs text-gray-400 mt-1">Takip Et</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {/* Services moved to its own tab */}

                  {/* Map and QR Code */}
                  {hasMap && (
                    <div className="w-full mt-8">
                      <h3 className="text-lg font-semibold mb-4 text-center text-white">
                        Konum Bilgileri
                      </h3>
                      <div className="bg-white/5 rounded-xl p-4">
                        {data.social_links?.map_embed ? (
                          <div
                            className="w-full h-64 rounded-lg overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: data.social_links.map_embed }}
                          />
                        ) : data.address ? (
                          <div>
                            <div className="w-full rounded-lg overflow-hidden">
                              <MapEmbed address={data.address} />
                            </div>
                            <p className="text-gray-300 mt-4 text-center">{data.address}</p>
                          </div>
                        ) : null}
                      </div>

                      {/* QR Code */}
                      <div className="mt-6 flex flex-col items-center">
                        <div className="bg-white p-3 rounded-lg">
                          <QRCodeSVG
                            value={window.location.href}
                            size={128}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-3">Kartvizitimi tarayın</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'services' && (
                <div className="mt-4">
                  {services.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center">Henüz hizmet eklenmedi.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {services.map((service, index) => {
                        const raw = typeof service === 'string' ? { name: service } : (service || {});
                        // Case-insensitive key access
                        const s = Object.keys(raw).reduce((acc, k) => { acc[k.toLowerCase()] = raw[k]; return acc; }, {});
                        // Try to infer name/desc from various possible keys
                        let name = s.name || s.title || s.label;
                        let desc = s.description || s.desc || s.aciklama || s.açıklama || s.text || s.detail || s.details || s.info;
                        // Special case: single key-value object like { "test": "açıklama" }
                        if ((!name || desc === undefined) && Object.keys(raw).length === 1) {
                          const onlyKey = Object.keys(raw)[0];
                          const onlyVal = raw[onlyKey];
                          if (!name && typeof onlyKey === 'string') name = onlyKey;
                          if ((desc === undefined || desc === '') && typeof onlyVal === 'string') desc = onlyVal;
                        }
                        // If still missing, use first string value as name and second as desc
                        if (!name || desc === undefined) {
                          const stringVals = Object.values(raw).filter(v => typeof v === 'string');
                          if (!name && stringVals.length > 0) name = stringVals[0];
                          if ((desc === undefined || desc === '') && stringVals.length > 1) desc = stringVals[1];
                        }
                        name = name || 'Hizmet';
                        return (
                          <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="font-medium text-white">{name}</h4>
                            {desc && (
                              <p className="text-sm text-gray-300 mt-1">{desc}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Gallery Tab */}
              {activeTab === 'gallery' && hasGallery && (
                <div className="mt-4 w-full px-0 lg:px-4">
                  <div className="max-w-[90vw] lg:max-w-[80vw] mx-auto">
                    <Swiper
                      modules={[Navigation, Pagination, Autoplay]}
                      spaceBetween={10}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 3000, disableOnInteraction: false }}
                      loop={true}
                      centeredSlides={true}
                      className="w-full"
                    >
                      {galleryItems.map((item, index) => (
                        <SwiperSlide key={index} className="h-auto">
                          <div className="bg-white/5 rounded-xl overflow-hidden h-full flex flex-col">
                            <div className="relative pt-[56.25%]">{/* 16:9 ratio */}
                              <img
                                src={item.url}
                                alt={item.title || `Görsel ${index + 1}`}
                                className="absolute top-0 left-0 w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/400x300?text=Gorsel+Yuklenemedi';
                                }}
                              />
                            </div>
                            {/* Hide filename/title under images */}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              )}

              {/* Video Tab */}
              {activeTab === 'video' && hasVideo && (
                <div className="mt-6">
                  <div className="aspect-w-16 aspect-h-9 bg-black rounded-xl overflow-hidden">
                    <iframe
                      src={data.video_url}
                      title="Video"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Catalog Tab */}
              {activeTab === 'catalog' && hasCatalog && (
                <div className="mt-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100/20">
                      <svg
                        className="h-6 w-6 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-white">Kataloğum</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Ürün kataloğumu incelemek için aşağıdaki butona tıklayın.
                    </p>
                    <div className="mt-6">
                      <a
                        href={socials.catalog_url.startsWith('http') 
                          ? socials.catalog_url 
                          : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002'}${socials.catalog_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => createAnalysis('catalog')}
                      >
                        Kataloğu Görüntüle
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Marketplaces Tab */}
              {activeTab === 'marketplaces' && hasMarketplaces && (
                <div className="space-y-4 mt-4">
                  {data.marketplaces.map((marketplace, index) => (
                    <a
                      key={index}
                      href={marketplace.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      onClick={() => createAnalysis(`marketplace_${marketplace.name.toLowerCase()}`)}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-white">{marketplace.name}</p>
                        <p className="text-xs text-gray-400">Mağazamı ziyaret edin</p>
                      </div>
                      <div className="ml-auto">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* Bank Accounts Tab */}
              {activeTab === 'accounts' && hasAccountNumbers && (
                <div className="space-y-4 mt-4">
                  {data.account_numbers.map((account, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">{account.bank}</h4>
                          <p className="text-sm text-gray-300">{account.name}</p>
                          <p className="text-sm text-gray-400 mt-1 font-mono">
                            {account.iban}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(account.iban);
                            // Show a toast or notification here
                          }}
                          className="text-blue-400 hover:text-blue-300"
                          title="IBAN'ı Kopyala"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* QR Kodu Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">QR Kod</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <QRCodeSVG
                  value={window.location.href}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Bu QR kodu tarayarak kartvizitimi kolayca paylaşabilirsiniz.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link panoya kopyalandı!');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Linki Kopyala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardPage;