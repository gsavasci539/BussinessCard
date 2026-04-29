import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

const LANGUAGES = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'İngilizce' },
  { value: 'ru', label: 'Rusça' },
  { value: 'az', label: 'Azerice' },
  { value: 'ar', label: 'Arapça' },
  { value: 'fr', label: 'Fransızca' },
]

const THEMES = [
  { value: 'black', label: 'Siyah' },
  { value: 'gold', label: 'Altın' },
  { value: 'silver', label: 'Gümüş' },
  { value: 'green', label: 'Yeşil' },
  { value: 'blue', label: 'Mavi' },
  { value: 'dark-blue', label: 'Koyu Mavi' },
  { value: 'red', label: 'Kırmızı' },
]

// Helper functions for theme conversion
const getThemeColor = (themeValue) => {
  const colorMap = {
    'black': '#000000',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'green': '#008000',
    'blue': '#0000FF',
    'dark-blue': '#00008B',
    'red': '#FF0000',
  }
  return colorMap[themeValue] || '#4f46e5'
}

const getThemeFont = (languageValue) => {
  return 'Inter, system-ui, -apple-system, sans-serif'
}

const getThemeFromBackend = (backendTheme) => {
  if (!backendTheme) return { card_theme: 'black', card_language: 'tr' }
  
  // Try to determine the theme from the primary color
  const colorToTheme = {
    '#000000': 'black',
    '#FFD700': 'gold',
    '#C0C0C0': 'silver',
    '#008000': 'green',
    '#0000FF': 'blue',
    '#00008B': 'dark-blue',
    '#FF0000': 'red',
  }
  
  const primaryColor = backendTheme.primaryColor || '#4f46e5'
  const card_theme = colorToTheme[primaryColor] || 'custom'
  const card_language = 'tr' // Default to Turkish
  
  return { card_theme, card_language }
}

const getThemeForBackend = (card_theme, card_language) => {
  return {
    primaryColor: getThemeColor(card_theme),
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    font: getThemeFont(card_language),
    backgroundImage: null
  }
}

export default function ProfilePage() {
  const { profile, setProfile } = useAuth()
  const [map, setMap] = useState({
    address: '',
    latitude: '',
    longitude: '',
    embedCode: ''
  })
  const [gallery, setGallery] = useState(profile?.gallery || [])
  const [galleryFile, setGalleryFile] = useState(null)
  const [marketplaces, setMarketplaces] = useState(profile?.marketplaces || [])
  const [accountNumbers, setAccountNumbers] = useState(profile?.account_numbers || [])
  const [newMarketplace, setNewMarketplace] = useState({ name: '', url: '' })
  const [newAccountNumber, setNewAccountNumber] = useState({
    type: 'bank',
    bank_name: '',
    account_owner: '',
    iban: '',
    currency: 'TRY'
  })
  const [activeTab, setActiveTab] = useState('gallery')
  const [form, setForm] = useState({ 
    full_name: '', 
    first_name: '',
    last_name: '',
    title: '', 
    company: '', 
    phone: '', 
    website: '',
    about: '',
    gender: '',
    card_theme: 'black',
    card_language: 'tr',
    video_url: '',
    card_name: ''
  })
  const [photoPreview, setPhotoPreview] = useState('')
  
  const fileRef = useRef()
  const catalogRef = useRef()

  // Load profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get fresh profile data
        const response = await api.get('/api/profile');
        const profileData = response.data;
        
        if (profileData) {
          // Split full_name into first_name and last_name for the form
          const fullName = profileData.full_name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Convert backend theme to frontend format
          const themeData = getThemeFromBackend(profileData.theme);
          
          // Update form state
          setForm(prev => ({
            ...prev,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            title: profileData.title || '',
            company: profileData.company || profileData.company_info?.company_name || '',
            phone: profileData.phone || '',
            website: profileData.website || '',
            about: profileData.about || '',
            gender: profileData.gender || '',
            card_theme: themeData.card_theme,
            card_language: themeData.card_language,
            video_url: profileData.video_url || '',
            card_name: profileData.card_name || profileData.full_name || ''
          }));
          
          // Update map state
          setMap({
            address: profileData.address || '',
            latitude: profileData.social_links?.latitude || '',
            longitude: profileData.social_links?.longitude || '',
            embedCode: profileData.social_links?.map_embed || ''
          });
          
          // Update gallery and marketplaces
          setGallery(profileData.gallery || []);
          setMarketplaces(profileData.marketplaces || []);
          setAccountNumbers(profileData.account_numbers || []);
          
          // Update photo preview if exists
          if (profileData.photo_url) {
            // Ensure the photo URL is complete with the base URL
            const fullPhotoUrl = profileData.photo_url.startsWith('http')
              ? profileData.photo_url
              : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002'}${profileData.photo_url}`;
            setPhotoPreview(fullPhotoUrl);
            console.log('Setting photo preview:', fullPhotoUrl);
          } else {
            setPhotoPreview('');
          }
        }
      } catch (error) {
        console.error('Profil yüklenirken hata oluştu:', error);
      }
    };
    
    // Call the function
    loadProfile();
  }, []); // Empty dependency array to run only on mount

  const saveProfile = async (e) => {
    if (e) e.preventDefault();
    
    try {
      // Combine first_name and last_name into full_name
      const fullName = `${form.first_name || ''} ${form.last_name || ''}`.trim();
      
      const profileData = {
        full_name: fullName,
        title: form.title || '',
        company: form.company || '',
        phone: form.phone || '',
        website: form.website || '',
        about: form.about || '',
        video_url: form.video_url || '',
        address: map.address,
        social_links: {
          ...profile?.social_links,
          latitude: map.latitude,
          longitude: map.longitude,
          map_embed: map.embedCode
        },
        gallery,
        marketplaces,
        account_numbers: accountNumbers,
        theme: getThemeForBackend(form.card_theme, form.card_language)
      };
      
      let response;
      let isCreate = false;
      
      // Check if profile exists by trying to get it first
      try {
        // Try to get existing profile
        const existingProfile = await api.get('/api/profile');
        
        // If we get here, profile exists, so use PUT to update
        response = await api.put('/api/profile', profileData);
        console.log('Profile updated successfully');
      } catch (getError) {
        // If GET fails with 404, profile doesn't exist, so use POST to create
        if (getError.response && getError.response.status === 404) {
          response = await api.post('/api/profile', profileData);
          isCreate = true;
          console.log('Profile created successfully');
        } else {
          // If it's a different error, rethrow it
          throw getError;
        }
      }
      
      // Get fresh profile data after save
      const updatedProfile = await api.get('/api/profile');
      setProfile(updatedProfile.data);
      
      // Update local state with fresh data
      const updatedFullName = updatedProfile.data.full_name || '';
      const updatedNameParts = updatedFullName.split(' ');
      const updatedFirstName = updatedNameParts[0] || '';
      const updatedLastName = updatedNameParts.slice(1).join(' ') || '';
      
      // Convert backend theme to frontend format
      const updatedThemeData = getThemeFromBackend(updatedProfile.data.theme);
      
      setForm(prev => ({
        ...prev,
        full_name: updatedFullName,
        first_name: updatedFirstName,
        last_name: updatedLastName,
        title: updatedProfile.data.title || '',
        company: updatedProfile.data.company || '',
        phone: updatedProfile.data.phone || '',
        website: updatedProfile.data.website || '',
        about: updatedProfile.data.about || '',
        video_url: updatedProfile.data.video_url || '',
        card_theme: updatedThemeData.card_theme,
        card_language: updatedThemeData.card_language
      }));
      
      const successMessage = isCreate ? 'Profil başarıyla oluşturuldu!' : 'Profil başarıyla güncellendi!';
      alert(successMessage);
    } catch (error) {
      console.error('Profil kaydedilirken hata oluştu:', error);
      
      let errorMessage = 'Profil kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Profil bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message === 'Network Error') {
        errorMessage = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      }
      
      alert(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Combine first_name and last_name into full_name
      const fullName = `${form.first_name || ''} ${form.last_name || ''}`.trim();
      
      const profileData = {
        full_name: fullName,
        title: form.title || '',
        company: form.company || '',
        phone: form.phone || '',
        website: form.website || '',
        about: form.about || '',
        video_url: form.video_url || '',
        gallery,
        marketplaces,
        account_numbers: accountNumbers,
        social_links: {
          ...profile?.social_links,
          latitude: map.latitude,
          longitude: map.longitude,
          map_embed: map.embedCode
        },
        address: map.address,
        theme: getThemeForBackend(form.card_theme, form.card_language)
      };
      
      let response;
      let isCreate = false;
      
      // Check if profile exists by trying to get it first
      try {
        // Try to get existing profile
        const existingProfile = await api.get('/api/profile');
        
        // If we get here, profile exists, so use PUT to update
        response = await api.put('/api/profile', profileData);
        console.log('Profile updated successfully');
      } catch (getError) {
        // If GET fails with 404, profile doesn't exist, so use POST to create
        if (getError.response && getError.response.status === 404) {
          response = await api.post('/api/profile', profileData);
          isCreate = true;
          console.log('Profile created successfully');
        } else {
          // If it's a different error, rethrow it
          throw getError;
        }
      }
      
      // Update profile state with response
      setProfile(response.data)
      
      // Update local form state with fresh data
      const updatedFullName = response.data.full_name || '';
      const updatedNameParts = updatedFullName.split(' ');
      const updatedFirstName = updatedNameParts[0] || '';
      const updatedLastName = updatedNameParts.slice(1).join(' ') || '';
      
      // Convert backend theme to frontend format
      const updatedThemeData = getThemeFromBackend(response.data.theme);
      
      setForm(prev => ({
        ...prev,
        full_name: updatedFullName,
        first_name: updatedFirstName,
        last_name: updatedLastName,
        title: response.data.title || '',
        company: response.data.company || '',
        phone: response.data.phone || '',
        website: response.data.website || '',
        about: response.data.about || '',
        video_url: response.data.video_url || '',
        card_theme: updatedThemeData.card_theme,
        card_language: updatedThemeData.card_language
      }));
      
      const successMessage = isCreate ? 'Profil başarıyla oluşturuldu!' : 'Profil başarıyla güncellendi!';
      alert(successMessage);
    } catch (error) {
      console.error('Profil kaydedilirken hata oluştu:', error);
      
      let errorMessage = 'Profil kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Profil bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message === 'Network Error') {
        errorMessage = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      }
      
      alert(errorMessage);
    }
  }

  const saveMap = async (e) => {
    e.preventDefault()
    const payload = {
      address: map.address,
      latitude: map.latitude ? parseFloat(map.latitude) : null,
      longitude: map.longitude ? parseFloat(map.longitude) : null,
      social_links: {
        ...profile.social_links,
        map_embed: map.embedCode
      }
    }
    try {
      const res = await api.put('/api/profile', payload)
      setProfile(res.data)
      alert('Harita bilgileri başarıyla kaydedildi')
    } catch (error) {
      console.error('Harita kaydedilirken hata oluştu:', error)
      alert('Harita kaydedilirken bir hata oluştu')
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    
    if (!file) {
      console.error('No file selected');
      alert('Lütfen bir dosya seçin');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Dosya boyutu çok büyük. Maksimum 5MB boyutunda dosya yükleyebilirsiniz.');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const extensionToType = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp'
    };
    
    // If browser didn't detect the type, try to determine from extension
    const detectedType = extensionToType[fileExtension] || file.type;
    
    if (!allowedTypes.includes(detectedType)) {
      alert('Desteklenmeyen dosya türü. Lütfen JPEG, PNG veya WebP formatında bir resim yükleyin.');
      return;
    }
    
    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      detectedType,
      size: file.size,
      extension: fileExtension
    });
    
    const fd = new FormData();
    // Create a new file with the correct type if needed
    const blob = file.slice(0, file.size, detectedType);
    const newFile = new File([blob], file.name, { type: detectedType });
    fd.append('file', newFile);
    
    try {
      console.log('Sending request to /api/profile/photo');
      const res = await api.post('/api/profile/photo', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload successful:', res.data);
      setProfile(res.data);
      
      // Reset file input to allow re-uploading the same file
      if (fileRef.current) {
        fileRef.current.value = '';
      }
      
      // Force a refresh of the profile data
      try {
        const profileRes = await api.get('/api/profile');
        setProfile(profileRes.data);
      } catch (profileError) {
        console.error('Error refreshing profile:', profileError);
      }
      
      alert('Profil fotoğrafı başarıyla yüklendi');
    } catch (error) {
      console.error('Fotoğraf yüklenirken hata oluştu:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = 'Fotoğraf yüklenirken bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.detail || errorMessage;
        } else if (error.response.status === 413) {
          errorMessage = 'Dosya boyutu çok büyük. Lütfen daha küçük bir dosya seçin.';
        }
      } else if (error.message === 'Network Error') {
        errorMessage = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      }
      
      alert(`Hata: ${errorMessage}`);
    }
  }

  const uploadToGallery = async (e) => {
    e.preventDefault()
    if (!galleryFile) return
    
    const fd = new FormData()
    fd.append('file', galleryFile)
    
    try {
      const res = await api.post('/api/profile/gallery', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const updatedGallery = [...gallery, res.data]
      setGallery(updatedGallery)
      setGalleryFile(null)
      
      // Update the gallery in the profile
      await api.put('/api/profile', { gallery: updatedGallery })
      alert('Fotoğraf galeriye eklendi')
    } catch (error) {
      console.error('Galeriye yükleme hatası:', error)
      alert(error.response?.data?.detail || 'Galeriye yükleme sırasında bir hata oluştu')
    }
  }
  
  const removeFromGallery = async (index) => {
    try {
      const updatedGallery = gallery.filter((_, i) => i !== index)
      setGallery(updatedGallery)
      await api.put('/api/profile', { gallery: updatedGallery })
      alert('Fotoğraf galeriden kaldırıldı')
    } catch (error) {
      console.error('Fotoğraf kaldırılırken hata oluştu:', error)
      alert('Fotoğraf kaldırılırken bir hata oluştu')
    }
  }
  
  const addMarketplace = async (e) => {
    e.preventDefault()
    if (!newMarketplace.name || !newMarketplace.url) return
    
    try {
      const updatedMarketplaces = [...marketplaces, newMarketplace]
      setMarketplaces(updatedMarketplaces)
      setNewMarketplace({ name: '', url: '' })
      await api.put('/api/profile/marketplaces', { marketplaces: updatedMarketplaces })
      alert('Pazaryeri eklendi')
    } catch (error) {
      console.error('Pazaryeri eklenirken hata oluştu:', error)
      alert('Pazaryeri eklenirken bir hata oluştu')
    }
  }
  
  const removeMarketplace = async (index) => {
    try {
      const updatedMarketplaces = marketplaces.filter((_, i) => i !== index)
      setMarketplaces(updatedMarketplaces)
      await api.put('/api/profile/marketplaces', { marketplaces: updatedMarketplaces })
      alert('Pazaryeri kaldırıldı')
    } catch (error) {
      console.error('Pazaryeri kaldırılırken hata oluştu:', error)
      alert('Pazaryeri kaldırılırken bir hata oluştu')
    }
  }
  
  const addAccountNumber = async (e) => {
    e.preventDefault()
    if (!newAccountNumber.bank_name || !newAccountNumber.account_owner || !newAccountNumber.iban) return
    
    try {
      const accountData = { ...newAccountNumber }
      const updatedAccounts = [...accountNumbers, accountData]
      setAccountNumbers(updatedAccounts)
      setNewAccountNumber({
        type: 'bank',
        bank_name: '',
        account_owner: '',
        iban: '',
        currency: 'TRY'
      })
      await api.put('/api/profile/account-numbers', { account_numbers: updatedAccounts })
      alert('Hesap numarası eklendi')
    } catch (error) {
      console.error('Hesap numarası eklenirken hata oluştu:', error)
      alert('Hesap numarası eklenirken bir hata oluştu')
    }
  }
  
  const removeAccountNumber = async (index) => {
    try {
      const updatedAccounts = accountNumbers.filter((_, i) => i !== index)
      setAccountNumbers(updatedAccounts)
      await api.put('/api/profile/account-numbers', { account_numbers: updatedAccounts })
      alert('Hesap numarası kaldırıldı')
    } catch (error) {
      console.error('Hesap numarası kaldırılırken hata oluştu:', error)
      alert('Hesap numarası kaldırılırken bir hata oluştu')
    }
  }

  const [isUploadingCatalog, setIsUploadingCatalog] = useState(false);
  const [catalogFileName, setCatalogFileName] = useState('');

  const uploadCatalog = async (e) => {
    e.preventDefault();
    if (!catalogRef.current?.files?.[0]) return;
    
    const file = catalogRef.current.files[0];
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu maksimum 10MB olmalıdır');
      return;
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Sadece PDF, DOC, DOCX, XLS veya XLSX formatında dosya yükleyebilirsiniz');
      return;
    }
    
    const fd = new FormData();
    fd.append('file', file);
    
    setIsUploadingCatalog(true);
    
    try {
      const response = await api.post('/api/profile/catalog', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update the profile with the new catalog URL by making a PUT request
      const updatedSocialLinks = {
        ...profile.social_links,
        catalog_url: response.data.url
      };
      
      const profileUpdateResponse = await api.put('/api/profile', { social_links: updatedSocialLinks });
      setProfile(profileUpdateResponse.data);
      setCatalogFileName(file.name);
      alert('E-Katalog başarıyla yüklendi');
    } catch (error) {
      console.error('E-Katalog yüklenirken hata oluştu:', error);
      alert(error.response?.data?.detail || 'E-Katalog yüklenirken bir hata oluştu');
    } finally {
      setIsUploadingCatalog(false);
      catalogRef.current.value = ''; // Reset file input
    }
  }

  const extractYoutubeId = (url) => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  if(!profile) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>
  }

  const renderGallerySection = () => (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Resim Galerisi</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {gallery.map((img, index) => {
          // Handle both string URLs and object with url property
          const imgUrl = typeof img === 'string' ? img : (img?.url || '');
          const fullUrl = imgUrl.startsWith('http') 
            ? imgUrl 
            : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002'}${imgUrl}`;
            
          return (
            <div key={index} className="relative group">
              <img 
                src={fullUrl} 
                alt={`Galeri ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Resim+Yüklenemedi';
                }}
              />
              <button
                onClick={() => removeFromGallery(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Kaldır"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setGalleryFile(e.target.files?.[0])}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <button
          onClick={uploadToGallery}
          disabled={!galleryFile}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          Yükle
        </button>
      </div>
    </div>
  )

  const renderMarketplacesSection = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Pazaryerleri</h2>
      <div className="space-y-4">
        {marketplaces.map((m, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{m.name}</p>
              <a href={m.url.startsWith('http') ? m.url : `https://${m.url}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-blue-600 text-sm">
                {m.url}
              </a>
            </div>
            <button
              onClick={() => removeMarketplace(index)}
              className="text-red-500 hover:text-red-700"
              title="Kaldır"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        
        <form onSubmit={addMarketplace} className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Pazaryeri Adı (Örn: Trendyol)"
            value={newMarketplace.name}
            onChange={(e) => setNewMarketplace({...newMarketplace, name: e.target.value})}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <input
            type="url"
            placeholder="URL"
            value={newMarketplace.url}
            onChange={(e) => setNewMarketplace({...newMarketplace, url: e.target.value})}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ekle
          </button>
        </form>
      </div>
    </div>
  )

  const renderAccountNumbersSection = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Hesap Numaraları</h2>
      <div className="space-y-4">
        {accountNumbers.map((account, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{account.bank_name}</p>
                <p className="text-sm text-gray-600">Hesap Sahibi: {account.account_owner}</p>
                <p className="text-sm text-gray-600">IBAN: {account.iban}</p>
                {account.currency && <p className="text-sm text-gray-600">Para Birimi: {account.currency}</p>}
              </div>
              <button
                onClick={() => removeAccountNumber(index)}
                className="text-red-500 hover:text-red-700"
                title="Kaldır"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        
        <form onSubmit={addAccountNumber} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banka Adı</label>
              <input
                type="text"
                value={newAccountNumber.bank_name}
                onChange={(e) => setNewAccountNumber({...newAccountNumber, bank_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Sahibi</label>
              <input
                type="text"
                value={newAccountNumber.account_owner}
                onChange={(e) => setNewAccountNumber({...newAccountNumber, account_owner: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
              <input
                type="text"
                value={newAccountNumber.iban}
                onChange={(e) => setNewAccountNumber({...newAccountNumber, iban: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
              <select
                value={newAccountNumber.currency}
                onChange={(e) => setNewAccountNumber({...newAccountNumber, currency: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TRY">Türk Lirası (TRY)</option>
                <option value="USD">Amerikan Doları (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">İngiliz Sterlini (GBP)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Hesap Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderCatalogSection = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">E-Katalog Yönetimi</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            ref={catalogRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            id="catalog-upload-tab"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setCatalogFileName(e.target.files[0].name);
              }
            }}
          />
          <label
            htmlFor="catalog-upload-tab"
            className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i className="fas fa-upload mr-2"></i>
            {catalogFileName || 'Dosya Seç'}
          </label>
          <button
            type="button"
            onClick={uploadCatalog}
            disabled={!catalogFileName || isUploadingCatalog}
            className="ml-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingCatalog ? 'Yükleniyor...' : 'Yükle'}
          </button>
        </div>
        
        {profile.social_links?.catalog_url && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-file-pdf text-red-500 mr-3 text-xl"></i>
                <div>
                  <p className="font-medium text-green-800">Mevcut Katalog</p>
                  <a 
                    href={profile.social_links.catalog_url.startsWith('http') 
                      ? profile.social_links.catalog_url 
                      : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002'}${profile.social_links.catalog_url}`
                    } 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                  >
                    Kataloğu görüntüle
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Kataloğu kaldırmak istediğinize emin misiniz?')) {
                    try {
                      const updatedSocialLinks = { ...profile.social_links, catalog_url: null };
                      await api.put('/api/profile', { social_links: updatedSocialLinks });
                      setProfile({
                        ...profile,
                        social_links: updatedSocialLinks
                      });
                      setCatalogFileName('');
                      alert('Katalog başarıyla kaldırıldı');
                    } catch (error) {
                      console.error('Katalog kaldırılırken hata oluştu:', error);
                      alert('Katalog kaldırılırken bir hata oluştu');
                    }
                  }
                }}
                className="text-red-600 hover:text-red-800"
                title="Kaldır"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Katalog Bilgileri</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Desteklenen formatlar: PDF, DOC, DOCX, XLS, XLSX</li>
            <li>• Maksimum dosya boyutu: 10MB</li>
            <li>• Yüklediğiniz katalog profil kartınızda görünecektir</li>
            <li>• Katalog değiştirmek için yeni dosya yükleyebilirsiniz</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderTabNavigation = () => (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`${activeTab === 'gallery' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Resim Galerisi
        </button>
        <button
          onClick={() => setActiveTab('marketplaces')}
          className={`${activeTab === 'marketplaces' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Pazaryerleri
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`${activeTab === 'accounts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Hesap Numaraları
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`${activeTab === 'catalog' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          E-Katalog
        </button>
      </nav>
    </div>
  )

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* User Information Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {form.full_name || 'Kullanıcı'}
            </h1>
            {(form.company || profile?.social_links?.company_info?.company_name) && (
              <p className="text-blue-100 text-lg">
                {form.company || profile?.social_links?.company_info?.company_name}
              </p>
            )}
            {form.title && (
              <p className="text-blue-200 text-sm mt-1">
                {form.title}
              </p>
            )}
          </div>
          {profile?.username && (
            <a 
              href={`/${profile.username}`} 
              target="_blank" 
              rel="noreferrer" 
              className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
            >
              Kartviziti Görüntüle
            </a>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Profil Ayarları</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-8">
        {/* Kullanıcı Adı ve Dil */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  disabled
                  value={profile.username || ''}
                  className="bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Kullanıcı adı değiştirilemez. Değiştirmek isterseniz, yeni bir kart oluşturmanız gerekmektedir.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kart Dili</label>
              <select
                value={form.card_language}
                onChange={e => setForm({...form, card_language: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Kart ve Kişisel Bilgiler */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Kart ve Kişisel Bilgiler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kart Adı (Firma adı girebilirsiniz)</label>
              <input
                type="text"
                value={form.card_name}
                onChange={e => setForm({...form, card_name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                placeholder="Kartınızın görüneceği isim"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adı</label>
              <input
                type="text"
                value={form.first_name}
                onChange={e => setForm({...form, first_name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soyadı</label>
              <input
                type="text"
                value={form.last_name}
                onChange={e => setForm({...form, last_name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
              <div className="mt-1 flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={form.gender === 'male'}
                    onChange={() => setForm({...form, gender: 'male'})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Erkek</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={form.gender === 'female'}
                    onChange={() => setForm({...form, gender: 'female'})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Kadın</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hakkında Yazısı</label>
            <textarea
              rows={3}
              value={form.about}
              onChange={e => setForm({...form, about: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Kendiniz veya şirketiniz hakkında kısa bir açıklama"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </section>

        {/* İletişim Bilgileri */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">İletişim Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ünvan</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                placeholder="Pozisyon veya unvan"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şirket</label>
              <input
                type="text"
                value={form.company}
                onChange={e => setForm({...form, company: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  https://
                </span>
                <input
                  type="text"
                  value={form.website}
                  onChange={e => setForm({...form, website: e.target.value})}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="sirketadiniz.com"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tema ve Medya */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Tema ve Medya</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kart Teması</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {THEMES.map(theme => (
                  <label key={theme.value} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="sr-only"
                      name="theme"
                      checked={form.card_theme === theme.value}
                      onChange={() => setForm({...form, card_theme: theme.value})}
                    />
                    <span className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      form.card_theme === theme.value 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}>
                      {theme.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profil Fotoğrafı</label>
            
              {/* Profile Photo Preview */}
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  {photoPreview ? (
                    <img 
                      src={photoPreview}
                      alt="Profil önizleme"
                      className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : profile?.photo_url ? (
                    <img 
                      src={profile.photo_url.startsWith('http') ? profile.photo_url : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002'}${profile.photo_url}`}
                      alt="Mevcut profil"
                      className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.full_name || profile?.username || 'U') + '&background=random';
                      }}
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Resim Yok</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-block">
                    Resim Seç
                  </span>
                  <input
                    type="file"
                    ref={fileRef}
                    onChange={handlePhotoChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={uploadPhoto}
                  disabled={!photoPreview}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    photoPreview 
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Yükle
                </button>
                
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview('');
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="ml-2 px-3 py-2 text-gray-600 hover:text-red-600"
                    title="Seçimi iptal et"
                  >
                    ×
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG veya WebP formatında, en fazla 5MB
              </p>
            </div>


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Linki</label>
              <div className="mt-1">
                <input
                  type="text"
                  value={form.video_url}
                  onChange={e => setForm({...form, video_url: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  placeholder="YouTube video URL'si veya yerleştirme kodu"
                  autoComplete="off"
                  spellCheck="false"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Videonuzu YouTube'a ekleyin ve videonuzun üzerine sağ tıklayarak "Yerleştirme kodunu kopyala" seçeneğini seçin. 
                  Size verilen yerleştirme kodunu yukarıdaki alana yapıştırın ve formu kaydedin.
                </p>
                {form.video_url && (
                  <div className="mt-2 aspect-w-16 aspect-h-9">
                    <div className="bg-gray-100 rounded-md p-4 text-center text-sm text-gray-500">
                      Video önizlemesi burada görünecek
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {renderTabNavigation()}
          <div className="p-6">
            {activeTab === 'gallery' && renderGallerySection()}
            {activeTab === 'marketplaces' && renderMarketplacesSection()}
            {activeTab === 'accounts' && renderAccountNumbersSection()}
            {activeTab === 'catalog' && renderCatalogSection()}
          </div>
        </div>

        {/* Harita Bölümü */}
        <section className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Harita Ayarları</h2>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Harita Görünümü */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Harita Önizleme</h4>
                <div className="border rounded-lg overflow-hidden h-64">
                  {map.embedCode ? (
                    <div dangerouslySetInnerHTML={{ __html: map.embedCode }} />
                  ) : (map.latitude && map.longitude) ? (
                    <iframe
                      title="Harita Önizleme"
                      className="w-full h-full"
                      src={`https://maps.google.com/maps?q=${map.latitude},${map.longitude}&z=15&output=embed`}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  ) : map.address ? (
                    <iframe
                      title="Harita Önizleme"
                      className="w-full h-full"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(map.address)}&z=15&output=embed`}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                      Harita önizlemesi görüntülemek için adres veya koordinat girin
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {map.embedCode 
                    ? "Özel harita gömme kodu kullanılıyor"
                    : "Google Haritalar ile konumunuz gösterilecektir"
                  }
                </div>
              </div>
              
              {/* Harita Ayarları Formu */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adres</label>
                    <input
                      type="text"
                      value={map.address}
                      onChange={e => setMap({...map, address: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                      placeholder="Örnek: İstiklal Caddesi No:1 Beyoğlu/İstanbul"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Enlem</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={map.latitude}
                        onChange={e => setMap({...map, latitude: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        placeholder="Örnek: 41.0082"
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Boylam</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={map.longitude}
                        onChange={e => setMap({...map, longitude: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        placeholder="Örnek: 28.9784"
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      VEYA Özel Harita Gömme Kodu
                      <span className="text-xs text-gray-500 ml-1">(Google Maps, Yandex Haritalar, vb.)</span>
                    </label>
                    <textarea
                      rows="4"
                      value={map.embedCode}
                      onChange={e => setMap({...map, embedCode: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 font-mono text-xs"
                      placeholder='&lt;iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..." /&gt;'
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Harita hizmetinizden alacağınız iframe kodunu yapıştırın
                    </p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={saveMap}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Harita Ayarlarını Kaydet
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 pt-2 border-t mt-4">
                  <p className="font-medium">Nasıl Yapılır?</p>
                  <ol className="list-decimal pl-5 space-y-1 mt-1">
                    <li>Google Haritalar'da konumunuzu bulun</li>
                    <li>Paylaş butonuna tıklayın</li>
                    <li>"Harita Yerleştir" sekmesini seçin</li>
                    <li>HTML kodunu kopyalayıp yukarıdaki alana yapıştırın</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              İptal
            </button>
            <button
              type="submit"
              onClick={saveProfile}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
