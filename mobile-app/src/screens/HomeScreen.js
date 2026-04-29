import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';

const HomeScreen = ({navigation}) => {
  const menuItems = [
    {
      id: 1,
      title: 'Kartvizitim',
      subtitle: 'Kartvizitinizi görüntüleyin',
      icon: '📇',
      screen: 'Kart',
      description: 'QR kodunuzu paylaşın ve kartvizitinizi gösterin'
    },
    {
      id: 2,
      title: 'Profil',
      subtitle: 'Profil bilgilerinizi düzenleyin',
      icon: '👤',
      screen: 'Profil',
      description: 'Kişisel ve iletişim bilgilerinizi güncelleyin'
    },
    {
      id: 3,
      title: 'Ayarlar',
      subtitle: 'Tema ve diğer ayarlar',
      icon: '⚙️',
      screen: 'Ayarlar',
      description: 'Kartvizit görünümünü kişiselleştirin'
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: 'QR Kod Paylaş',
      icon: '📱',
      action: () => navigation.navigate('Kart')
    },
    {
      id: 2,
      title: 'Tema Seç',
      icon: '🎨',
      action: () => navigation.navigate('Ayarlar')
    },
    {
      id: 3,
      title: 'Profil Düzenle',
      icon: '✏️',
      action: () => navigation.navigate('Profil')
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.screen)}>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          <Text style={styles.menuDescription}>{item.description}</Text>
        </View>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  const renderQuickAction = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.quickAction}
      onPress={item.action}>
      <Text style={styles.quickActionIcon}>{item.icon}</Text>
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const openWebsite = () => {
    Linking.openURL('https://kartvizit.app');
  };

  const showAbout = () => {
    Alert.alert(
      'Kartvizit Mobile',
      'Bu uygulama ile kartvizitlerinizi kolayca oluşturabilir, düzenleyebilir ve paylaşabilirsiniz.\n\nÖzellikler:\n• QR kod ile paylaşım\n• Tema özelleştirme\n• Profil fotoğrafı yükleme\n• Çoklu dil desteği',
      [{text: 'Tamam'}, {text: 'Web Sitesi', onPress: openWebsite}]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kartvizit Mobile</Text>
          <Text style={styles.headerSubtitle}>
            Dijital kartvizitlerinizi yönetin
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Menü</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Hakkında</Text>
          <Text style={styles.infoText}>
            Bu uygulama ile kartvizitlerinizi kolayca oluşturabilir, düzenleyebilir ve
            paylaşabilirsiniz. QR kodu ile kartvizitinizi başkalarına hızlıca
            gösterebilirsiniz.
          </Text>
          <TouchableOpacity style={styles.aboutButton} onPress={showAbout}>
            <Text style={styles.aboutButtonText}>Daha Fazla Bilgi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
  },
  menuContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 16,
  },
  quickActionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  aboutButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  aboutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  infoContainer: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default HomeScreen;
