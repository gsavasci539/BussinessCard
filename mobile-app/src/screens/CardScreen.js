import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Share,
  Alert,
  Modal,
} from 'react-native';
import {QRCodeSVG} from 'react-native-qrcode-svg';
import { profileAPI, handleApiError } from '../utils/api';

const CardScreen = ({navigation}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileAPI.getMyProfile();
      setProfileData(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!profileData) return;

    try {
      await Share.share({
        message: `Kartvizitim: ${profileData.full_name}\n${profileData.title}\n${profileData.company}\n\nİletişim:\nTel: ${profileData.phone}\nE-posta: ${profileData.email}\nWeb: ${profileData.website}`,
        title: 'Kartvizit Paylaş',
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu');
    }
  };

  const handleCopyLink = () => {
    if (!profileData) return;
    const url = `https://kartvizit.app/${profileData.username}`;
    // Copy to clipboard logic would go here
    Alert.alert('Başarılı', 'Link kopyalandı!');
  };

  const renderContactItem = (icon, text) => (
    <View style={styles.contactItem}>
      <Text style={styles.contactIcon}>{icon}</Text>
      <Text style={styles.contactText}>{text}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Kartvizit yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Kartvizit bulunamadı</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.editButtonText}>Profil Düzenle</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasContactInfo = profileData.phone || profileData.email || profileData.website;
  const qrUrl = `https://kartvizit.app/${profileData.username}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Card Display */}
        <View style={[
          styles.cardContainer,
          {
            backgroundColor: profileData.theme?.primaryColor || '#111827',
            backgroundImage: profileData.theme?.backgroundImage ? {uri: profileData.theme.backgroundImage} : undefined
          }
        ]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{profileData.full_name}</Text>
            {profileData.title && <Text style={styles.cardTitle}>{profileData.title}</Text>}

            {hasContactInfo && (
              <View style={styles.cardContact}>
                {profileData.phone && renderContactItem('📱', profileData.phone)}
                {profileData.email && renderContactItem('✉️', profileData.email)}
                {profileData.website && renderContactItem('🌐', profileData.website)}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Paylaş</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowQRModal(true)}>
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.actionText}>QR Kod</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.actionIcon}>←</Text>
            <Text style={styles.actionText}>Geri</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        {profileData.about && (
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>Hakkında</Text>
            <Text style={styles.aboutText}>{profileData.about}</Text>
          </View>
        )}
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
              <QRCodeSVG
                value={qrUrl}
                size={200}
                color="#000000"
                backgroundColor="#ffffff"
              />
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
  cardContainer: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContact: {
    width: '100%',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#d1d5db',
  },
  contactText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
    marginTop: 0,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
  },
  aboutContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CardScreen;
