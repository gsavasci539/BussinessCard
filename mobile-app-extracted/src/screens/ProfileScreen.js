import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const ProfileScreen = ({navigation}) => {
  // Mock data - will be replaced with API data
  const [profile, setProfile] = useState({
    full_name: 'Ahmet Yılmaz',
    title: 'Yazılım Geliştirici',
    company: 'Teknoloji A.Ş.',
    phone: '+90 555 123 4567',
    email: 'ahmet.yilmaz@teknoloji.com',
    website: 'www.teknoloji.com',
    about: '10+ yıl deneyimli full-stack geliştirici. React ve Node.js uzmanı.',
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!profile.full_name) {
      Alert.alert('Hata', 'Ad Soyad zorunludur');
      return;
    }

    setLoading(true);
    try {
      // API call will be implemented here
      // For now, simulate successful save
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi!');
        navigation.goBack();
      }, 1000);
    } catch (error) {
      setLoading(false);
      Alert.alert('Hata', 'Profil güncellenemedi');
    }
  };

  const updateField = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderInput = (placeholder, value, onChangeText, keyboardType = 'default', multiline = false) => (
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
      autoComplete="off"
      spellCheck={false}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profil Bilgileri</Text>
            <Text style={styles.headerSubtitle}>
              Kartvizit bilgilerinizi düzenleyin
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
            
            {renderInput('Ad Soyad', profile.full_name, (text) => updateField('full_name', text))}
            {renderInput('Ünvan', profile.title, (text) => updateField('title', text))}
            {renderInput('Şirket', profile.company, (text) => updateField('company', text))}

            <Text style={[styles.sectionTitle, styles.sectionTitleMarginTop]}>İletişim Bilgileri</Text>
            
            {renderInput('Telefon', profile.phone, (text) => updateField('phone', text), 'phone-pad')}
            {renderInput('E-posta', profile.email, (text) => updateField('email', text), 'email-address')}
            {renderInput('Web Sitesi', profile.website, (text) => updateField('website', text), 'url')}

            <Text style={[styles.sectionTitle, styles.sectionTitleMarginTop]}>Hakkında</Text>
            
            {renderInput('Kendinizden bahsedin', profile.about, (text) => updateField('about', text), 'default', true)}

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}>
              <Text style={styles.saveButtonText}>
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#111827',
    padding: 24,
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitleMarginTop: {
    marginTop: 24,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  inputMultiline: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  saveButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
