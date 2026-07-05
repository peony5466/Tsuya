import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { scheduleHabitReminder, scheduleStreakAlert } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

type RowProps = {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
};

function Row({ icon, label, sublabel, onPress, right, destructive }: RowProps) {
  return (
    <Pressable style={s.row} onPress={onPress} disabled={!onPress && !right}>
      <View style={[s.rowIcon, destructive && { backgroundColor: "#fee2e2" }]}>
        <Ionicons name={icon as any} size={20} color={destructive ? "#b91c1c" : "#1d4ed8"} />
      </View>
      <View style={s.rowText}>
        <Text style={[s.rowLabel, destructive && { color: "#b91c1c" }]}>{label}</Text>
        {sublabel && <Text style={s.rowSub}>{sublabel}</Text>}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color="#cbd5e1" /> : null)}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionBox}>{children}</View>
    </View>
  );
}

export default function Settings() {
  const { session, isAnonymous } = useAuth();
  const [notifHabits, setNotifHabits] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifBadges, setNotifBadges] = useState(true);

  function toggleHabitReminder(val: boolean) {
    setNotifHabits(val);
    scheduleHabitReminder(val);
  }

  function toggleStreakAlert(val: boolean) {
    setNotifStreak(val);
    scheduleStreakAlert(val);
  }
  const [emailModal, setEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  async function signOut() {
    Alert.alert("Déconnexion", "Tu veux vraiment te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnecter", style: "destructive", onPress: async () => {
        await supabase.auth.signOut();
      }},
    ]);
  }

  async function changeEmail() {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      Alert.alert("Erreur", "Saisis un email valide."); return;
    }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSavingEmail(false);
    if (error) { Alert.alert("Erreur", error.message); return; }
    setEmailModal(false);
    setNewEmail("");
    Alert.alert("Email modifié", "Un email de confirmation a été envoyé à ta nouvelle adresse. Clique sur le lien pour valider le changement.");
  }

  async function changePassword() {
    if (newPwd.length < 6) { Alert.alert("Erreur", "Le mot de passe doit faire au moins 6 caractères."); return; }
    if (newPwd !== confirmPwd) { Alert.alert("Erreur", "Les mots de passe ne correspondent pas."); return; }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) { Alert.alert("Erreur", error.message); return; }
    setPwdModal(false);
    setNewPwd(""); setConfirmPwd("");
    Alert.alert("Succès", "Mot de passe modifié avec succès.");
  }

  async function deleteAccount() {
    Alert.alert(
      "Supprimer le compte",
      "Cette action est irréversible. Toutes tes données seront supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => {
          await supabase.auth.signOut();
        }},
      ]
    );
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={s.title}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Compte */}
      {isAnonymous ? (
        <Section title="COMPTE">
          <Row
            icon="person-add-outline"
            label="Créer un compte"
            sublabel="Sauvegarde ta progression"
            onPress={() => router.push("/(auth)/register" as any)}
          />
          <Row
            icon="log-in-outline"
            label="Se connecter"
            onPress={() => router.push("/(auth)/login" as any)}
          />
        </Section>
      ) : (
        <Section title="COMPTE">
          <Row
            icon="mail-outline"
            label="Changer l'email"
            sublabel={session?.user.email ?? ""}
            onPress={() => { setNewEmail(""); setEmailModal(true); }}
          />
          <Row
            icon="lock-closed-outline"
            label="Modifier le mot de passe"
            onPress={() => { setNewPwd(""); setConfirmPwd(""); setPwdModal(true); }}
          />
        </Section>
      )}

      {/* Notifications */}
      <Section title="NOTIFICATIONS">
        <Row
          icon="notifications-outline"
          label="Rappel habitudes"
          sublabel="Chaque jour à 9h"
          right={
            <Switch
              value={notifHabits}
              onValueChange={toggleHabitReminder}
              trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
              thumbColor={notifHabits ? "#1d4ed8" : "#f4f4f5"}
            />
          }
        />
        <Row
          icon="flame-outline"
          label="Alerte streak"
          sublabel="Si tu risques de perdre ton streak"
          right={
            <Switch
              value={notifStreak}
              onValueChange={toggleStreakAlert}
              trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
              thumbColor={notifStreak ? "#1d4ed8" : "#f4f4f5"}
            />
          }
        />
      </Section>

      {/* À propos */}
      <Section title="À PROPOS">
        <Row
          icon="star-outline"
          label="Noter l'app"
          onPress={() => Linking.openURL("https://apps.apple.com")}
        />
        <Row
          icon="share-social-outline"
          label="Partager l'app"
          onPress={() => Alert.alert("Partager", "Fonctionnalité bientôt disponible")}
        />
        <Row
          icon="document-text-outline"
          label="Conditions d'utilisation"
          onPress={() => router.push("/cgu" as any)}
        />
        <Row
          icon="shield-checkmark-outline"
          label="Politique de confidentialité"
          onPress={() => router.push("/privacy" as any)}
        />
        <Row
          icon="information-circle-outline"
          label="Version"
          sublabel="1.0.0"
        />
      </Section>

      {/* Danger zone */}
      {!isAnonymous && (
        <Section title="COMPTE">
          <Row
            icon="log-out-outline"
            label="Se déconnecter"
            destructive
            onPress={signOut}
          />
          <Row
            icon="trash-outline"
            label="Supprimer mon compte"
            destructive
            onPress={deleteAccount}
          />
        </Section>
      )}

      {isAnonymous && (
        <Section title="SESSION">
          <Row
            icon="log-out-outline"
            label="Quitter le mode invité"
            destructive
            onPress={signOut}
          />
        </Section>
      )}

      <View style={{ height: 40 }} />

      {/* Password change modal */}
      <Modal visible={pwdModal} transparent animationType="fade" onRequestClose={() => setPwdModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Modifier le mot de passe</Text>
            <TextInput
              style={s.input}
              placeholder="Nouveau mot de passe"
              secureTextEntry
              value={newPwd}
              onChangeText={setNewPwd}
              autoFocus
            />
            <TextInput
              style={s.input}
              placeholder="Confirmer le mot de passe"
              secureTextEntry
              value={confirmPwd}
              onChangeText={setConfirmPwd}
            />
            <Text style={s.modalHint}>Minimum 6 caractères.</Text>
            <View style={s.modalBtns}>
              <Pressable style={s.cancelBtn} onPress={() => setPwdModal(false)}>
                <Text style={s.cancelText}>Annuler</Text>
              </Pressable>
              <Pressable style={s.confirmBtn} onPress={changePassword} disabled={savingPwd}>
                <Text style={s.confirmText}>{savingPwd ? "..." : "Confirmer"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Email change modal */}
      <Modal visible={emailModal} transparent animationType="fade" onRequestClose={() => setEmailModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Changer l'email</Text>
            <Text style={s.modalSub}>Email actuel : {session?.user.email}</Text>
            <TextInput
              style={s.input}
              placeholder="Nouvel email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={newEmail}
              onChangeText={setNewEmail}
              autoFocus
            />
            <Text style={s.modalHint}>Un lien de confirmation sera envoyé à ta nouvelle adresse.</Text>
            <View style={s.modalBtns}>
              <Pressable style={s.cancelBtn} onPress={() => setEmailModal(false)}>
                <Text style={s.cancelText}>Annuler</Text>
              </Pressable>
              <Pressable style={s.confirmBtn} onPress={changeEmail} disabled={savingEmail}>
                <Text style={s.confirmText}>{savingEmail ? "..." : "Confirmer"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#f8fafc" },
  container: { paddingBottom: 40 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 64, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "white" },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#0f172a" },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: "#64748b", letterSpacing: 1, marginBottom: 8 },
  sectionBox: { backgroundColor: "white", borderRadius: 18, overflow: "hidden" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 28 },
  modalBox: { backgroundColor: "white", borderRadius: 24, padding: 24, width: "100%", gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  modalSub: { fontSize: 13, color: "#64748b" },
  input: { borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, fontSize: 15, color: "#0f172a" },
  modalHint: { fontSize: 12, color: "#64748b", lineHeight: 18 },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  cancelText: { color: "#475569", fontWeight: "600" },
  confirmBtn: { flex: 1, backgroundColor: "#1d4ed8", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  confirmText: { color: "white", fontWeight: "700" },

  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  rowSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
});
