import React, {useState, useEffect} from 'react';
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
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import { profileAPI, handleApiError } from '../utils/api';

const ProfileScreen = ({navigation}) => {
  const [profile, setProfile] = useState({
    full_name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    about: '',
    photo_url: '',
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await profileAPI.getMyProfile();
      setProfile({
        full_name: profileData.full_name || '',
        title: profileData.title || '',
        company: profileData.company || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        website: profileData.website || '',
        about: profileData.about || '',
        photo_url: profileData.photo_url || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      // If profile doesn't exist, keep empty form
    } finally {
      setInitialLoading(false);
    }
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Hata', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
        await uploadImage(response.assets[0]);
      }
    });
  };

  const uploadImage = async (image) => {
    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || 'photo.jpg',
      });

      // Note: React Native doesn't have FormData like web
      // This would need to be implemented differently
      // For now, we'll just update the photo_url in profile
      const updatedProfile = {
        ...profile,
        photo_url: image.uri,
      };

      await profileAPI.updateProfile(updatedProfile);
      setProfile(updatedProfile);
      Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi!');
    } catch (error) {
      setLoading(false);
      const errorMessage = handleApiError(error);
      Alert.alert('Hata', errorMessage);
    }
  };

  const handleSave = async () => {
    if (!profile.full_name) {
      Alert.alert('Hata', 'Ad Soyad zorunludur');
      return;
    }

    setLoading(true);
    try {
      await profileAPI.updateProfile(profile);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi!');
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const errorMessage = handleApiError(error);
      Alert.alert('Hata', errorMessage);
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
            <Text style={styles.sectionTitle}>Profil Fotoğrafı</Text>

            <TouchableOpacity style={styles.photoContainer} onPress={selectImage}>
              {profile.photo_url || selectedImage ? (
                <Image
                  source={{uri: selectedImage?.uri || profile.photo_url}}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>📷</Text>
                  <Text style={styles.photoPlaceholderSubtext}>Fotoğraf Seç</Text>
                </View>
              )}
            </TouchableOpacity>

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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#d1d5db',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 32,
    marginBottom: 4,
  },
  photoPlaceholderSubtext: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default ProfileScreen;
