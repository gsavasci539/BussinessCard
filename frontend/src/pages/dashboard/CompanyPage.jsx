import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

export default function CompanyPage() {
  const { profile, setProfile } = useAuth()
  const [company, setCompany] = useState('')
  const [info, setInfo] = useState({
    tax_office: '',
    tax_number: '',
    billing_address: '',
    phone_alt: '',
    email_alt: '',
    website_alt: '',
    company_name: '',
    company_type: '',
    trade_registry_number: '',
    mersis_no: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    district: '',
    city: '',
    country: 'Türkiye',
    postal_code: '',
    description: '',
    founded_year: '',
    employee_count: ''
  })

  useEffect(() => {
    if (profile) {
      setCompany(profile.company || '')
      // Load company info from company_info if available, otherwise fall back to old structure
      if (profile.company_info) {
        const ci = profile.company_info
        setInfo({
          tax_office: ci.tax_office || '',
          tax_number: ci.tax_number || '',
          billing_address: ci.billing_address || '',
          phone_alt: ci.phone_alt || '',
          email_alt: ci.email_alt || '',
          website_alt: ci.website_alt || '',
          company_name: ci.company_name || '',
          company_type: ci.company_type || '',
          trade_registry_number: ci.trade_registry_number || '',
          mersis_no: ci.mersis_no || '',
          phone: ci.phone || '',
          email: ci.email || '',
          website: ci.website || '',
          address: ci.address || '',
          district: ci.district || '',
          city: ci.city || '',
          country: ci.country || 'Türkiye',
          postal_code: ci.postal_code || '',
          description: ci.description || '',
          founded_year: ci.founded_year ? ci.founded_year.toString() : '',
          employee_count: ci.employee_count || ''
        })
      } else {
        // Fallback to old structure for backward compatibility
        const ci = profile.social_links?.company_info || {}
        setInfo({
          tax_office: ci.tax_office || '',
          tax_number: ci.tax_number || '',
          billing_address: ci.billing_address || '',
          phone_alt: ci.phone_alt || '',
          email_alt: ci.email_alt || '',
          website_alt: ci.website_alt || '',
          company_name: ci.company_name || '',
          company_type: ci.company_type || '',
          trade_registry_number: ci.trade_registry_number || '',
          mersis_no: ci.mersis_no || '',
          phone: ci.phone || '',
          email: ci.email || '',
          website: ci.website || '',
          address: ci.address || '',
          district: ci.district || '',
          city: ci.city || '',
          country: ci.country || 'Türkiye',
          postal_code: ci.postal_code || '',
          description: ci.description || '',
          founded_year: ci.founded_year ? ci.founded_year.toString() : '',
          employee_count: ci.employee_count || ''
        })
      }
    }
  }, [profile])

  if (!profile) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      // Prepare company data
      const companyData = {
        company_name: info.company_name || null,
        company_type: info.company_type || null,
        tax_office: info.tax_office || null,
        tax_number: info.tax_number || null,
        trade_registry_number: info.trade_registry_number || null,
        mersis_no: info.mersis_no || null,
        phone: info.phone || null,
        email: info.email || null,
        website: info.website || null,
        address: info.address || null,
        district: info.district || null,
        city: info.city || null,
        country: info.country || 'Türkiye',
        postal_code: info.postal_code || null,
        phone_alt: info.phone_alt || null,
        email_alt: info.email_alt || null,
        website_alt: info.website_alt || null,
        billing_address: info.billing_address || null,
        description: info.description || null,
        founded_year: info.founded_year ? parseInt(info.founded_year) : null,
        employee_count: info.employee_count || null
      }
      
      // Save company data using the new company endpoint
      const companyRes = await api.put('/api/company', companyData)
      console.log('Company save response:', companyRes.data)
      
      // Also update the profile with company name for backward compatibility
      const payload = {
        company,
        social_links: {
          ...profile.social_links,
          company_info: info
        }
      }
      const res = await api.put('/api/profile', payload)
      console.log('Profile save response:', res.data)
      
      // Update the profile state with the new company info
      if (typeof setProfile === 'function') {
        const updatedProfile = {
          ...res.data,
          company_info: companyRes.data
        }
        setProfile(updatedProfile)
      } else {
        console.error('setProfile is not a function:', setProfile)
      }
      alert('Bilgiler başarıyla kaydedildi')
    } catch (error) {
      console.error('Kayıt hatası:', error)
      alert('Kayıt sırasında bir hata oluştu')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-6 text-gray-900">Firma Bilgileri</h2>
      
      <form onSubmit={save} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900">Genel Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Firma Ünvanı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma Ünvanı <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.company_name}
                onChange={e => setInfo({...info, company_name: e.target.value})}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Firma Türü */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma Türü <span className="text-red-500">*</span></label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.company_type}
                onChange={e => setInfo({...info, company_type: e.target.value})}
                required
                autoComplete="off"
              >
                <option value="">Seçiniz</option>
                <option value="sahis">Şahıs Şirketi</option>
                <option value="limited">Limited Şirket</option>
                <option value="anonim">Anonim Şirket</option>
                <option value="kooperatif">Kooperatif</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vergi Dairesi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.tax_office}
                onChange={e => setInfo({...info, tax_office: e.target.value})}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Vergi Numarası */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.tax_number}
                onChange={e => setInfo({...info, tax_number: e.target.value})}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* SGK Numarası */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SGK Numarası</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.sgk_number}
                onChange={e => setInfo({...info, sgk_number: e.target.value})}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MERSIS No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MERSIS No</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.mersis_no}
                onChange={e => setInfo({...info, mersis_no: e.target.value})}
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon <span className="text-red-500">*</span></label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.phone}
                onChange={e => setInfo({...info, phone: e.target.value})}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* E-posta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta <span className="text-red-500">*</span></label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.email}
                onChange={e => setInfo({...info, email: e.target.value})}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Web Sitesi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  https://
                </span>
                <input
                  type="text"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={info.website}
                  onChange={e => setInfo({...info, website: e.target.value})}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900">Adres Bilgileri</h3>
          {/* Adres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres <span className="text-red-500">*</span></label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={info.address}
              onChange={e => setInfo({...info, address: e.target.value})}
              required
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* İlçe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.district}
                onChange={e => setInfo({...info, district: e.target.value})}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* İl */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İl <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.city}
                onChange={e => setInfo({...info, city: e.target.value})}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Ülke */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ülke <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.country}
                onChange={e => setInfo({...info, country: e.target.value})}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Posta Kodu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.postal_code}
                onChange={e => setInfo({...info, postal_code: e.target.value})}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900">Fatura Bilgileri</h3>
          {/* Fatura Adresi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Adresi <span className="text-red-500">*</span></label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={info.billing_address}
              onChange={e => setInfo({...info, billing_address: e.target.value})}
              required
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fatura Telefonu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Telefonu</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.phone_alt}
                onChange={e => setInfo({...info, phone_alt: e.target.value})}
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Fatura E-posta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fatura E-posta</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.email_alt}
                onChange={e => setInfo({...info, email_alt: e.target.value})}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Fatura Web Sitesi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Web Sitesi</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                https://
              </span>
              <input
                type="text"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.website_alt}
                onChange={e => setInfo({...info, website_alt: e.target.value})}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900">Ek Bilgiler</h3>
          
          {/* Firma Açıklaması */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Firma Açıklaması</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={info.description}
              onChange={e => setInfo({...info, description: e.target.value})}
              placeholder="Firmanız hakkında kısa bir açıklama..."
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kuruluş Yılı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kuruluş Yılı</label>
              <input
                type="number"
                min="1900"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.founded_year}
                onChange={e => setInfo({...info, founded_year: e.target.value})}
                placeholder="Örn: 2020"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Çalışan Sayısı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Çalışan Sayısı</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={info.employee_count}
                onChange={e => setInfo({...info, employee_count: e.target.value})}
                autoComplete="off"
              >
                <option value="">Seçiniz</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-100">51-100</option>
                <option value="101-250">101-250</option>
                <option value="251-500">251-500</option>
                <option value="501+">501+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  )
}
