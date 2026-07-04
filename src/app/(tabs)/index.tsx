import ConfirmModal from "@/components/ConfirmModal";
import WeekStrip from "@/components/WeekStrip";
import { useAuth } from "@/context/AuthContext";
import { useHabits } from "@/context/HabitsContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Svg, { Circle } from "react-native-svg";

type Habit = {
  id: string;
  title: string;
  description: string | null;
  xp_reward: number;
  frequency: string;
  duration_days: number | null;
  is_public: boolean;
  source_habit_id: string | null;
};

function dKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Arc gauge component — 270° track, fills based on percent
function ArcGauge({ percent, color, size = 62 }: { percent: number; color: string; size?: number }) {
  const strokeW = 7;
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2; const cy = size / 2;
  const fullCirc = 2 * Math.PI * r;
  const arc = fullCirc * 0.75;
  const fill = arc * Math.max(0, Math.min(1, percent));
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: "135deg" }] }}>
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeW}
        strokeDasharray={`${arc} ${fullCirc}`} strokeLinecap="round" />
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={`${fill} ${fullCirc}`} strokeLinecap="round" />
    </Svg>
  );
}

const ENCOURAGE_MESSAGES = [
  "Tu es discipliné(e) ! Continue comme ça 💪",
  "Un pas de plus vers tes objectifs !",
  "Excellente habitude ! Tu es constant(e).",
  "Bravo ! La régularité, c'est ta force.",
];

export default function Home() {
  const { session } = useAuth();
  const { refreshKey, openEditModal } = useHabits();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState(dKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<Habit | null>(null);
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "challenge">("all");
  const [encourageVisible, setEncourageVisible] = useState(false);
  const [encourageMsg, setEncourageMsg] = useState("");

  const isToday = selectedDate === dKey(new Date());

  const fetchHabits = useCallback(async (date: string) => {
    const { data, error } = await supabase
      .from("habits")
      .select("id, title, description, xp_reward, frequency, duration_days, is_public, source_habit_id")
      .eq("user_id", session?.user.id)
      .eq("is_active", true)
      .lte("start_date", date)
      .order("created_at", { ascending: false });
    if (error) { Alert.alert("Erreur", error.message); setLoading(false); return; }
    setHabits(data ?? []);
    setLoading(false);
  }, [session]);

  const fetchLogs = useCallback(async (date: string) => {
    const { data, error } = await supabase.from("habit_logs").select("habit_id").eq("completed_on", date);
    if (!error) setDone(new Set((data ?? []).map((l) => l.habit_id)));
  }, []);

  useFocusEffect(useCallback(() => {
    fetchHabits(selectedDate);
  }, [fetchHabits, selectedDate]));

  useEffect(() => {
    fetchHabits(selectedDate);
  }, [refreshKey, fetchHabits, selectedDate]);

  useEffect(() => { fetchLogs(selectedDate); }, [selectedDate, refreshKey, fetchLogs]);

  async function complete(habit: Habit) {
    if (!isToday) { Alert.alert("Info", "Tu ne peux valider que pour aujourd'hui."); return; }
    if (done.has(habit.id)) return;
    setDone((prev) => new Set(prev).add(habit.id));
    const { error } = await supabase.rpc("complete_habit", { p_habit_id: habit.id });
    if (error) {
      setDone((prev) => { const n = new Set(prev); n.delete(habit.id); return n; });
      Alert.alert("Oups", error.message); return;
    }
    setEncourageMsg(ENCOURAGE_MESSAGES[Math.floor(Math.random() * ENCOURAGE_MESSAGES.length)]);
    setEncourageVisible(true);
  }

  function confirmRemove(habit: Habit) {
    setConfirmTarget(habit);
  }

  async function removeHabit(habit: Habit) {
    let error: any;
    if (habit.source_habit_id) {
      // Leave challenge: hard delete + record leave so rejoin is blocked
      const [{ error: delErr }, { error: leaveErr }] = await Promise.all([
        supabase.from("habits").delete().eq("id", habit.id),
        supabase.from("challenge_leaves").insert({ user_id: session?.user.id, challenge_id: habit.source_habit_id }),
      ]);
      error = delErr ?? leaveErr;
    } else {
      ({ error } = await supabase.from("habits").delete().eq("id", habit.id));
    }
    if (error) { Alert.alert("Erreur", error.message); return; }
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
  }

  function renderLeftActions(habit: Habit) {
    return (
      <Pressable style={s.editBox} onPress={() => openEditModal(habit)}>
        <Ionicons name="pencil" size={20} color="white" />
        <Text style={s.swipeLabel}>Modifier</Text>
      </Pressable>
    );
  }

  function renderRightActions(habit: Habit) {
    const isJoined = !!habit.source_habit_id;
    return (
      <Pressable style={s.deleteBox} onPress={() => confirmRemove(habit)}>
        <Ionicons name={isJoined ? "exit-outline" : "trash"} size={20} color="white" />
        <Text style={s.swipeLabel}>{isJoined ? "Quitter" : "Supprimer"}</Text>
      </Pressable>
    );
  }

  if (loading)
    return <View style={s.center}><ActivityIndicator color="#6366f1" size="large" /></View>;

  const FILTERS = [
    { key: "all",       label: "Tous" },
    { key: "daily",     label: "Quotidien" },
    { key: "weekly",    label: "Hebdo" },
    { key: "challenge", label: "Challenges" },
  ] as const;

  const filteredHabits = habits.filter((h) => {
    if (filter === "all") return true;
    if (filter === "daily") return h.frequency === "daily" && !h.source_habit_id;
    if (filter === "weekly") return h.frequency === "weekly" && !h.source_habit_id;
    if (filter === "challenge") return !!h.source_habit_id;
    return true;
  });

  return (
    <View style={s.container}>
      {/* Blue header */}
      <View style={s.header}>
        <View style={s.topBar}>
          <Text style={s.pageTitle}>Mes habitudes</Text>
        </View>
        <WeekStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
      </View>

      {/* White content area */}
      <View style={s.content}>
        {/* Filter pills */}
        <View style={s.pillsRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[s.filterPill, filter === f.key && s.filterPillActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.filterPillText, filter === f.key && s.filterPillTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={filteredHabits}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 18, paddingTop: 8 }}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyEmoji}>🌱</Text>
              <Text style={s.emptyText}>Aucune habitude.{"\n"}Appuie sur + pour commencer !</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isDone = done.has(item.id);
            const isChallenge = !!item.source_habit_id;
            const cardBg = isDone ? "#e0f2fe" : isChallenge ? "#ede9fe" : "#eff6ff";
            const emoji = item.title.match(/^\p{Emoji}/u)?.[0] ?? (isChallenge ? "🏆" : "✨");
            const titleClean = item.title.replace(/^\p{Emoji}\s*/u, "");

            return (
              <Swipeable
                renderLeftActions={isChallenge ? undefined : () => renderLeftActions(item)}
                renderRightActions={() => renderRightActions(item)}
                overshootRight={false}
                overshootLeft={false}
              >
                <Pressable
                  style={[s.card, { backgroundColor: cardBg }, !isToday && s.cardPast]}
                  onPress={() => complete(item)}
                  disabled={isToday && isDone}
                >
                  {/* Arc gauge */}
                  <View style={s.arcWrap}>
                    <ArcGauge percent={isDone ? 1 : 0} color={isDone ? "#60a5fa" : isChallenge ? "#a78bfa" : "#f9a8d4"} size={62} />
                    <View style={s.arcCenter}>
                      {isDone
                        ? <Ionicons name="checkmark" size={18} color="#10b981" />
                        : <Ionicons name="ellipse-outline" size={18} color="#c4c4c4" />}
                    </View>
                  </View>

                  {/* Content */}
                  <View style={s.cardBody}>
                    <Text style={s.cardFreq}>{item.frequency === "daily" ? "Quotidien" : "Hebdomadaire"}</Text>
                    <Text style={[s.cardTitle, isDone && s.cardTitleDone]} numberOfLines={2}>{titleClean}</Text>
                    {item.duration_days && isChallenge ? (
                      <Text style={s.cardProgress}>{item.duration_days} jours</Text>
                    ) : null}
                  </View>

                  {/* Circle checkbox */}
                  <View style={[s.circle, isDone && s.circleDone]}>
                    {isDone && <Ionicons name="checkmark" size={18} color="white" />}
                  </View>
                </Pressable>
              </Swipeable>
            );
          }}
        />
      </View>

      <ConfirmModal
        visible={!!confirmTarget}
        title={confirmTarget?.source_habit_id ? "Quitter le challenge ?" : "Supprimer ?"}
        message={confirmTarget?.source_habit_id
          ? `Tu pourras rejoindre « ${confirmTarget?.title} » depuis les Challenges.`
          : `Supprimer « ${confirmTarget?.title} » définitivement ?`}
        confirmLabel={confirmTarget?.source_habit_id ? "Quitter" : "Supprimer"}
        destructive
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => { if (confirmTarget) removeHabit(confirmTarget); setConfirmTarget(null); }}
      />

      {encourageVisible && (
        <Pressable style={s.encOverlay} onPress={() => setEncourageVisible(false)}>
          <View style={s.encCard} onStartShouldSetResponder={() => true}>
            <Text style={s.encTitle}>Bravo !</Text>
            <Text style={s.encMessage}>{encourageMsg}</Text>
            <Pressable style={s.encBtn} onPress={() => setEncourageVisible(false)}>
              <Text style={s.encBtnText}>Merci !</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#dbeafe" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: { backgroundColor: "#dbeafe", paddingTop: 64, paddingHorizontal: 18, paddingBottom: 20 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: "#1e3a5f" },

  // Content area
  content: { flex: 1, backgroundColor: "#ffffff", borderTopLeftRadius: 28, borderTopRightRadius: 28 },

  // Filter pills
  pillsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 4 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 24, backgroundColor: "#f1f5f9" },
  filterPillActive: { backgroundColor: "#dbeafe" },
  filterPillText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  filterPillTextActive: { color: "#1e3a5f", fontWeight: "800" },

  // Empty state
  emptyWrap: { alignItems: "center", marginTop: 48, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { textAlign: "center", color: "#94a3b8", lineHeight: 22, fontSize: 14 },

  // Habit cards
  card: { borderRadius: 22, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  cardPast: { opacity: 0.6 },
  arcWrap: { width: 62, height: 62, alignItems: "center", justifyContent: "center", position: "relative" },
  arcCenter: { position: "absolute" },
  cardBody: { flex: 1, gap: 3 },
  cardFreq: { fontSize: 11, fontWeight: "600", color: "#64748b" },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", lineHeight: 21 },
  cardTitleDone: { textDecorationLine: "line-through", color: "#9ca3af" },
  cardProgress: { fontSize: 11, color: "#3b82f6", fontWeight: "600" },
  circle: { width: 34, height: 34, borderRadius: 17, borderWidth: 2.5, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
  circleDone: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },

  // Encouragement modal
  encOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: 24 },
  encCard: { backgroundColor: "#ffffff", borderRadius: 24, padding: 28, alignItems: "center", gap: 14, width: "100%" },
  encTitle: { fontSize: 28, fontWeight: "900", color: "#0f172a" },
  encMessage: { fontSize: 15, color: "#64748b", textAlign: "center", lineHeight: 22, fontWeight: "500" },
  encBtn: { width: "100%", backgroundColor: "#0f172a", borderRadius: 28, paddingVertical: 16, alignItems: "center" },
  encBtnText: { color: "white", fontSize: 16, fontWeight: "800" },

  // Swipe actions
  editBox: { backgroundColor: "#7c3aed", justifyContent: "center", alignItems: "center", width: 80, borderRadius: 22, gap: 4, marginBottom: 12 },
  deleteBox: { backgroundColor: "#ef4444", justifyContent: "center", alignItems: "center", width: 80, borderRadius: 22, gap: 4, marginBottom: 12 },
  swipeLabel: { color: "white", fontWeight: "600", fontSize: 11 },
});
