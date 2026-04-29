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
  Modal,
} from 'react-native';

const SettingsScreen = ({navigation}) => {
  const [theme, setTheme] = useState({
    primaryColor: '#111827',
    backgroundImage: '',
    font: 'Inter, system-ui',
  });

  const [showQRModal, setShowQRModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fontOptions = [
    {label: 'Inter', value: 'Inter, system-ui'},
    {label: 'Roboto', value: 'Roboto, sans-serif'},
    {label: 'Open Sans', value: 'Open Sans, sans-serif'},
    {label: 'Lato', value: 'Lato, sans-serif'},
    {label: 'Montserrat', value: 'Montserrat, sans-serif'},
    {label: 'Poppins', value: 'Poppins, sans-serif'},
  ];

  const presetThemes = [
    {name: 'Klasik', primaryColor: '#111827'},
    {name: 'Mavi', primaryColor: '#1e40af'},
    {name: 'Yeşil', primaryColor: '#059669'},
    {name: 'Mor', primaryColor: '#7c3aed'},
    {name: 'Kırmızı', primaryColor: '#dc2626'},
    {name: 'Turuncu', primaryColor: '#ea580c'},
  ];

  const handleSaveTheme = async () => {
    setLoading(true);
    try {
      // API call will be implemented here
      // For now, simulate successful save
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Başarılı', 'Tema ayarları güncellendi!');
      }, 1000);
    } catch (error) {
      setLoading(false);
      Alert.alert('Hata', 'Tema ayarları güncellenemedi');
    }
  };

  const handleCopyLink = () => {
    Alert.alert('Başarılı', 'Profil linki kopyalandı!');
  };

  const applyPresetTheme = (color) => {
    setTheme(prev => ({
      ...prev,
      primaryColor: color,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <Text style={styles.headerSubtitle}>
            Kartvizit görünümünü kişiselleştirin
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {/* Theme Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tema Ayarları</Text>
            
            <Text style={styles.label}>Birincil Renk</Text>
            <View style={styles.colorInputContainer}>
              <TextInput
                style={styles.colorInput}
                value={theme.primaryColor}
                onChangeText={(text) => setTheme(prev => ({...prev, primaryColor: text}))}
                placeholder="#111827"
              />
              <View 
                style={[styles.colorPreview, {backgroundColor: theme.primaryColor}]} 
              />
            </View>

            <Text style={styles.label}>Hazır Temalar</Text>
            <View style={styles.presetContainer}>
              {presetThemes.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.presetButton, {backgroundColor: preset.primaryColor}]}
                  onPress={() => applyPresetTheme(preset.primaryColor)}>
                  <Text style={styles.presetText}>{preset.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Arka Plan Görseli</Text>
            <TextInput
              style={styles.input}
              value={theme.backgroundImage}
              onChangeText={(text) => setTheme(prev => ({...prev, backgroundImage: text}))}
              placeholder="Görsel URL'sini girin"
            />

            <Text style={styles.label}>Font</Text>
            <View style={styles.fontContainer}>
              {fontOptions.map((font, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.fontButton,
                    theme.font === font.value && styles.fontButtonActive,
                  ]}
                  onPress={() => setTheme(prev => ({...prev, font: font.value}))}>
                  <Text style={[
                    styles.fontText,
                    theme.font === font.value && styles.fontTextActive,
                  ]}>
                    {font.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSaveTheme}
              disabled={loading}>
              <Text style={styles.saveButtonText}>
                {loading ? 'Kaydediliyor...' : 'Tema Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* QR Code Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QR Kod</Text>
            <Text style={styles.description}>
              Kartvizitinizi başkalarına göstermek için QR kodunu kullanabilirsiniz.
            </Text>
            
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => setShowQRModal(true)}>
              <Text style={styles.qrButtonText}>QR Kodu Göster</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowQRModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>QR Kod</Text>
            
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>QR Kod</Text>
                <Text style={styles.qrPlaceholderSubtext}>
                  kartvizit.app/ahmet.yilmaz
                </Text>
              </View>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Bu QR kodu taratarak kartvizitimi görüntüleyebilirsiniz
            </Text>
            
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
              <Text style={styles.copyButtonText}>Linki Kopyala</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
  settingsContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  colorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 12,
    color: '#111827',
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  presetText: {
    color: '#ffffff',
    fontSize: 12,
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
  fontContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  fontButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  fontButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  fontText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  fontTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  qrButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    margin: 20,
    width: '90%',
    maxWidth: 300,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  qrContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
  },
  qrPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  qrPlaceholderSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  copyButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SettingsScreen;
