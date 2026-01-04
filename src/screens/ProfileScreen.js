import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../Context/AuthContext';
import { ThemeContext } from '../../Context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUserProfile, deleteUserAccount } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  
  const mode = themeContext?.mode || 'light';
  const theme = themeContext?.theme || {
    background: '#FAFAFA',
    text: '#1E293B',
    card: '#ffffff',
  };
  const isDark = mode === 'dark';

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert("Logout Error", "Failed to logout. Please try again.");
            }
          }, 
          style: "destructive" 
        }
      ]
    );
  };

  const handleEditProfile = () => {
    setNewDisplayName(user?.displayName || '');
    setEditModalVisible(true);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => setDeleteModalVisible(true)
        }
      ]
    );
  };

  const saveProfileChanges = async () => {
    if (!newDisplayName.trim()) {
      Alert.alert("Error", "Please enter a valid name");
      return;
    }
    if (newDisplayName === user?.displayName) {
      Alert.alert("No Changes", "Name hasn't been changed");
      setEditModalVisible(false);
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile({ displayName: newDisplayName });
      Alert.alert("Success", "Profile updated successfully!");
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password to confirm deletion");
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteUserAccount(password);
      Alert.alert("Account Deleted", "Your account has been permanently deleted.", [{ text: "OK" }]);
      setDeleteModalVisible(false);
      setPassword('');
    } catch (error) {
      console.error("Delete error:", error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert("Error", "Incorrect password. Please try again.");
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Re-authentication Required", "Please logout and login again, then try deleting your account.");
      } else {
        Alert.alert("Error", "Failed to delete account. Please try again.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getJoinDate = () => {
    if (user?.metadata?.creationTime) {
      const date = new Date(user.metadata.creationTime);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return "Recently";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Hero Header */}
      <View style={[styles.heroSection, { backgroundColor: isDark ? '#1E293B' : '#6366F1' }]}>
        <View style={styles.heroOverlay} />
        
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholderButton} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{user?.displayName || "CyberNews User"}</Text>
          
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={18} color="#CBD5E1" />
            <Text style={styles.email}>{user?.email || "user@cybernews.com"}</Text>
          </View>

          <View style={styles.joinDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
            <Text style={styles.joinDate}>Joined {getJoinDate()}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: theme.card }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={22} color="#6366F1" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#64748B" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={[styles.appInfo, { borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}>
          <View style={styles.appLogo}>
            <Ionicons name="shield-checkmark" size={36} color="#6366F1" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>CyberNews Pro</Text>
          <Text style={[styles.appVersion, { color: isDark ? '#94A3B8' : '#64748B' }]}>Version 2.1.0</Text>
          <Text style={[styles.appTagline, { color: isDark ? '#64748B' : '#94A3B8' }]}>
            Stay Secure, Stay Informed
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.closeButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Display Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0', color: theme.text }]}
                value={newDisplayName}
                onChangeText={setNewDisplayName}
                placeholder="Enter your name"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                autoFocus
                maxLength={50}
              />
              <Text style={[styles.charCount, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                {newDisplayName.length}/50
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }, loading && styles.disabledButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={saveProfileChanges}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal animationType="slide" transparent={true} visible={deleteModalVisible} onRequestClose={() => { setDeleteModalVisible(false); setPassword(''); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={28} color="#EF4444" />
              </View>
              <TouchableOpacity 
                onPress={() => { setDeleteModalVisible(false); setPassword(''); }}
                style={[styles.closeButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteTitle}>Delete Your Account</Text>
            <Text style={[styles.deleteWarning, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              This action cannot be undone. All your data, bookmarks, and preferences will be permanently deleted.
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Enter your password to confirm deletion</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: '#FCA5A5', color: theme.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                secureTextEntry
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }, deleteLoading && styles.disabledButton]}
                onPress={() => { setDeleteModalVisible(false); setPassword(''); }}
                disabled={deleteLoading}
              >
                <Text style={[styles.cancelButtonText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.deleteConfirmButton, deleteLoading && styles.disabledButton]}
                onPress={confirmDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.deleteConfirmText}>Delete Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { height: 280, position: 'relative', paddingTop: 50, paddingBottom: 30 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  placeholderButton: { width: 44, height: 44 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  profileInfo: { alignItems: 'center', paddingHorizontal: 20 },
  avatarContainer: { position: 'relative', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.3)' },
  avatarFallback: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255, 255, 255, 0.9)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.3)' },
  avatarText: { fontSize: 40, fontWeight: '800', color: '#6366F1', letterSpacing: -1 },
  name: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8, letterSpacing: -0.5, textAlign: 'center' },
  emailContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  email: { fontSize: 16, color: '#E2E8F0', fontWeight: '500' },
  joinDateContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  joinDate: { fontSize: 14, color: '#CBD5E1', fontWeight: '500' },
  content: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  buttonsContainer: { gap: 12, marginTop: 20, marginBottom: 40 },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#EEF2FF', borderRadius: 16, paddingVertical: 18, borderWidth: 2, borderColor: '#E0E7FF' },
  editButtonText: { color: '#6366F1', fontSize: 17, fontWeight: '700' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#FEF2F2', borderRadius: 16, paddingVertical: 18, borderWidth: 2, borderColor: '#FECACA' },
  deleteButtonText: { color: '#EF4444', fontSize: 17, fontWeight: '700' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F8FAFC', borderRadius: 16, paddingVertical: 18, borderWidth: 2, borderColor: '#E2E8F0' },
  logoutButtonText: { color: '#64748B', fontSize: 17, fontWeight: '700' },
  appInfo: { alignItems: 'center', paddingTop: 20, borderTopWidth: 1 },
  appLogo: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  appName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  appVersion: { fontSize: 14, marginBottom: 8 },
  appTagline: { fontSize: 14, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { borderRadius: 24, width: '100%', maxWidth: 400, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  warningIcon: { flex: 1, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  deleteTitle: { fontSize: 24, fontWeight: '800', color: '#EF4444', textAlign: 'center', marginBottom: 16 },
  deleteWarning: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  closeButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 2, borderRadius: 12, padding: 16, fontSize: 16 },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 4 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
  saveButton: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, backgroundColor: '#6366F1' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  deleteConfirmButton: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, backgroundColor: '#EF4444' },
  deleteConfirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  disabledButton: { opacity: 0.6 },
});