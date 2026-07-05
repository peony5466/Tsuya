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

export default function Privacy() {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={s.title}>Politique de confidentialité</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={s.updated}>Dernière mise à jour : 13 juin 2026</Text>

      <Section title="1. Introduction">
        <P>TsuyaApp ("nous", "notre") s'engage à protéger ta vie privée. Cette politique explique quelles données nous collectons, comment nous les utilisons et tes droits à leur égard.</P>
      </Section>

      <Section title="2. Données collectées">
        <P><Text style={s.bold}>Données que tu nous fournis :</Text></P>
        <Li>Adresse email et mot de passe (à la création du compte)</Li>
        <Li>Pseudo et photo de profil</Li>
        <Li>Image de bannière de profil</Li>
        <Li>Habitudes, challenges et récompenses que tu crées</Li>

        <P><Text style={s.bold}>Données collectées automatiquement :</Text></P>
        <Li>Historique de validation des habitudes (dates et XP)</Li>
        <Li>Progression (niveau, XP total, coins, badges)</Li>
        <Li>Données d'utilisation et statistiques anonymes</Li>
        <Li>Informations sur l'appareil (modèle, système d'exploitation)</Li>
      </Section>

      <Section title="3. Utilisation des données">
        <P>Nous utilisons tes données pour :</P>
        <Li>Fournir et améliorer le service TsuyaApp</Li>
        <Li>Calculer ta progression, tes niveaux et tes récompenses</Li>
        <Li>Afficher ton profil et tes challenges aux autres utilisateurs</Li>
        <Li>T'envoyer des notifications si tu les as activées</Li>
        <Li>Détecter et prévenir les fraudes</Li>
        <Li>Analyser l'utilisation de l'app de façon anonyme</Li>
      </Section>

      <Section title="4. Partage des données">
        <P>Nous ne vendons jamais tes données personnelles. Nous partageons uniquement :</P>
        <Li><Text style={s.bold}>Supabase</Text> — notre fournisseur d'infrastructure (stockage sécurisé des données)</Li>
        <Li><Text style={s.bold}>Expo / Apple / Google</Text> — pour la distribution de l'application</Li>
        <P>Ton pseudo et ta photo de profil sont visibles par les autres utilisateurs de l'app dans les challenges publics.</P>
      </Section>

      <Section title="5. Stockage et sécurité">
        <P>Tes données sont stockées sur des serveurs sécurisés via Supabase (infrastructure AWS). Nous utilisons le chiffrement SSL/TLS pour toutes les communications.</P>
        <P>Les mots de passe sont chiffrés et ne sont jamais stockés en clair.</P>
      </Section>

      <Section title="6. Mode invité">
        <P>Si tu utilises TsuyaApp en mode invité, nous créons un compte anonyme temporaire. Ces données sont conservées tant que la session est active. Si tu crées un compte par la suite, tes données peuvent être transférées vers ton nouveau compte.</P>
      </Section>

      <Section title="7. Notifications">
        <P>TsuyaApp peut t'envoyer des notifications push si tu les as autorisées. Tu peux les désactiver à tout moment depuis les Paramètres de l'app ou les réglages de ton appareil.</P>
      </Section>

      <Section title="8. Conservation des données">
        <P>Nous conservons tes données tant que ton compte est actif. Si tu supprimes ton compte, toutes tes données personnelles sont effacées dans un délai de 30 jours, à l'exception des données requises par la loi.</P>
      </Section>

      <Section title="9. Tes droits (RGPD)">
        <P>Si tu résides dans l'Union Européenne, tu disposes des droits suivants :</P>
        <Li><Text style={s.bold}>Accès</Text> — obtenir une copie de tes données</Li>
        <Li><Text style={s.bold}>Rectification</Text> — corriger des données inexactes</Li>
        <Li><Text style={s.bold}>Suppression</Text> — demander l'effacement de tes données</Li>
        <Li><Text style={s.bold}>Portabilité</Text> — recevoir tes données dans un format lisible</Li>
        <Li><Text style={s.bold}>Opposition</Text> — t'opposer à certains traitements</Li>
        <P>Pour exercer ces droits, contacte-nous à : privacy@tsuyaapp.com</P>
      </Section>

      <Section title="10. Enfants">
        <P>TsuyaApp n'est pas destiné aux enfants de moins de 13 ans. Nous ne collectons pas sciemment de données personnelles d'enfants de moins de 13 ans. Si nous découvrons qu'un enfant a créé un compte, nous supprimerons immédiatement ses données.</P>
      </Section>

      <Section title="11. Modifications">
        <P>Nous pouvons mettre à jour cette politique de confidentialité. Toute modification importante sera notifiée dans l'application. La date de dernière mise à jour est indiquée en haut de cette page.</P>
      </Section>

      <Section title="12. Contact">
        <P>Pour toute question relative à la confidentialité :</P>
        <Li>Email : privacy@tsuyaapp.com</Li>
        <Li>Application : Paramètres → Politique de confidentialité</Li>
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
  title: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  updated: { fontSize: 12, color: "#64748b", textAlign: "center", paddingVertical: 12, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 10 },
  p: { fontSize: 14, color: "#475569", lineHeight: 22, marginBottom: 8 },
  bold: { fontWeight: "700", color: "#334155" },
  liRow: { flexDirection: "row", gap: 8, marginBottom: 6, paddingLeft: 4 },
  bullet: { fontSize: 14, color: "#1d4ed8", fontWeight: "700", marginTop: 3 },
  liText: { fontSize: 14, color: "#475569", lineHeight: 22, flex: 1 },
});
