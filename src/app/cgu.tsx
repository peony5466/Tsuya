import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={s.p}>{children}</Text>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.liRow}>
      <Text style={s.bullet}>•</Text>
      <Text style={s.liText}>{children}</Text>
    </View>
  );
}

export default function CGU() {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={s.title}>Conditions d'utilisation</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={s.updated}>Dernière mise à jour : 13 juin 2026</Text>

      <Section title="1. Acceptation des conditions">
        <P>En accédant à TsuyaApp et en l'utilisant, tu acceptes d'être lié par ces conditions d'utilisation. Si tu n'acceptes pas ces conditions, tu ne dois pas utiliser l'application.</P>
      </Section>

      <Section title="2. Description du service">
        <P>TsuyaApp est une application de suivi d'habitudes gamifiée qui te permet de :</P>
        <Li>Créer et suivre des habitudes quotidiennes et hebdomadaires</Li>
        <Li>Gagner de l'XP et monter de niveau</Li>
        <Li>Rejoindre des challenges publics</Li>
        <Li>Débloquer des badges et des récompenses</Li>
        <Li>Personnaliser ton profil</Li>
      </Section>

      <Section title="3. Création de compte">
        <P>Tu peux utiliser TsuyaApp en mode invité ou créer un compte. En créant un compte, tu t'engages à :</P>
        <Li>Fournir des informations exactes et à jour</Li>
        <Li>Maintenir la confidentialité de ton mot de passe</Li>
        <Li>Notifier immédiatement tout accès non autorisé à ton compte</Li>
        <Li>Être responsable de toutes les activités sur ton compte</Li>
        <P>Tu dois avoir au moins 13 ans pour créer un compte.</P>
      </Section>

      <Section title="4. Contenu des utilisateurs">
        <P>En créant des habitudes publiques ou des challenges, tu accordes à TsuyaApp une licence non exclusive pour afficher ce contenu aux autres utilisateurs.</P>
        <P>Tu t'engages à ne pas publier de contenu :</P>
        <Li>Illégal, offensant, haineux ou discriminatoire</Li>
        <Li>Portant atteinte aux droits d'auteur ou à la propriété intellectuelle</Li>
        <Li>Contenant des logiciels malveillants ou du spam</Li>
        <Li>Usurpant l'identité d'autres personnes</Li>
      </Section>

      <Section title="5. Règles de la communauté">
        <P>TsuyaApp est une communauté bienveillante. Nous attendons de tous les utilisateurs qu'ils :</P>
        <Li>Traitent les autres avec respect</Li>
        <Li>Ne harcèlent pas d'autres utilisateurs</Li>
        <Li>Ne tentent pas de manipuler le système de récompenses</Li>
        <Li>Ne créent pas de faux comptes</Li>
      </Section>

      <Section title="6. Système de gamification">
        <P>Les XP, niveaux, coins, badges et récompenses virtuelles n'ont aucune valeur monétaire réelle et ne peuvent pas être échangés contre de l'argent. TsuyaApp se réserve le droit de modifier le système de gamification à tout moment.</P>
        <P>Un plafond journalier d'XP est appliqué pour garantir une expérience équitable à tous les utilisateurs.</P>
      </Section>

      <Section title="7. Disponibilité du service">
        <P>TsuyaApp s'efforce de maintenir le service disponible 24h/24, 7j/7, mais ne garantit pas une disponibilité ininterrompue. Des maintenances peuvent occasionner des interruptions temporaires.</P>
      </Section>

      <Section title="8. Résiliation">
        <P>TsuyaApp se réserve le droit de suspendre ou supprimer tout compte qui violerait ces conditions d'utilisation, sans préavis.</P>
        <P>Tu peux supprimer ton compte à tout moment depuis les Paramètres de l'application.</P>
      </Section>

      <Section title="9. Limitation de responsabilité">
        <P>TsuyaApp est fourni "tel quel". Nous ne garantissons pas que l'application sera exempte d'erreurs. TsuyaApp ne peut être tenu responsable des dommages indirects résultant de l'utilisation du service.</P>
      </Section>

      <Section title="10. Modifications">
        <P>Nous pouvons modifier ces conditions à tout moment. Les modifications importantes seront notifiées dans l'application. L'utilisation continue de TsuyaApp après modification vaut acceptation des nouvelles conditions.</P>
      </Section>

      <Section title="11. Contact">
        <P>Pour toute question concernant ces conditions, contacte-nous à : support@tsuyaapp.com</P>
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#f8fafc" },
  container: { paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 64, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "white" },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  updated: { fontSize: 12, color: "#64748b", textAlign: "center", paddingVertical: 12, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 10 },
  p: { fontSize: 14, color: "#475569", lineHeight: 22, marginBottom: 8 },
  liRow: { flexDirection: "row", gap: 8, marginBottom: 6, paddingLeft: 4 },
  bullet: { fontSize: 14, color: "#1d4ed8", fontWeight: "700", marginTop: 3 },
  liText: { fontSize: 14, color: "#475569", lineHeight: 22, flex: 1 },
});
