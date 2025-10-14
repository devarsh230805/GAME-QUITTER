import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, FlatList } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useApp } from '../store/AppContext';
import { getThemeColors } from '../theme/tokens';

function toTime(ts) {
  try { return new Date(ts).toLocaleTimeString(); } catch { return '-'; }
}

export default function StatsHistoryScreen({ onClose }) {
  const { playLogs, msToday, dailyTargetHours, msByDayForLast7, running } = useApp();
  
  // Get theme colors based on whether game is running
  const themeColors = getThemeColors(running);
  const dynamicStyles = useMemo(() => createStyles(themeColors), [themeColors]);
  
  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = last week, etc.
  const [selectedIdx, setSelectedIdx] = useState(6); // Selected day index within week (0=Mon ... 6=Sun)
  const pageWidth = Dimensions.get('window').width;
  const pagerRef = useRef(null);
  const MAX_WEEKS = 12;

  // Build 7 day windows for the selected week (start/end ms) aligned to local midnight
  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i) - (weekOffset * 7)); // Offset by weeks
      const start = d.getTime();
      const end = start + 24 * 3600 * 1000;
      arr.push({ start, end });
    }
    return arr;
  }, [weekOffset]);

  // Compute selected day total from playLogs (overlap within window)
  const selectedTotalMs = useMemo(() => {
    const { start: dayStart, end: dayEnd } = days[selectedIdx] || {};
    if (dayStart == null || !Array.isArray(playLogs)) return 0;
    let t = 0;
    for (const l of playLogs) {
      const st = l.start, en = l.end || Date.now();
      const overlap = Math.max(0, Math.min(en, dayEnd) - Math.max(st, dayStart));
      t += overlap;
    }
    return t;
  }, [days, selectedIdx, playLogs]);

  const targetMs = (dailyTargetHours || 0) * 3600000;
  const progressPercent = targetMs > 0 ? Math.min(100, (selectedTotalMs / targetMs) * 100) : 0;
  const todayHours = Math.floor(selectedTotalMs / 3600000);
  const todayMins = Math.floor((selectedTotalMs % 3600000) / 60000);
  const selectedDayText = useMemo(() => {
    const win = days[selectedIdx];
    if (!win) return 'Today';
    const d = new Date(win.start);
    const now = new Date();
    const isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    return isToday ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }, [days, selectedIdx]);

  // Header text should show the selected bar's exact date or "Today" for today only
  const selectedHeaderText = useMemo(() => {
    const win = days[selectedIdx];
    if (!win) return '';
    const d = new Date(win.start);
    const now = new Date();
    
    // Check if selected day is actually today
    const isToday = d.getFullYear() === now.getFullYear() && 
                    d.getMonth() === now.getMonth() && 
                    d.getDate() === now.getDate();
    
    if (isToday) {
      return 'Today';
    }
    
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }, [days, selectedIdx]);
  
  // Compute totals for current week's 7 days
  const weekTotals = useMemo(() => {
    if (!Array.isArray(playLogs)) return Array(7).fill(0);
    return days.map(({ start: dayStart, end: dayEnd }) => {
      let t = 0;
      for (const l of playLogs) {
        const st = l.start, en = l.end || Date.now();
        const overlap = Math.max(0, Math.min(en, dayEnd) - Math.max(st, dayStart));
        t += overlap;
      }
      return t;
    });
  }, [days, playLogs]);
  
  const maxMs = Math.max(1, ...weekTotals);
  // Generate labels directly from each day's date to avoid misalignment
  const dayLabels = useMemo(() => days.map(({ start }) => {
    const d = new Date(start);
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  }), [days]);

  return (
    <View style={dynamicStyles.wrap}>
      <HeaderBar title="Stats" />
      <View style={dynamicStyles.content}>
        <View style={dynamicStyles.card}>
          
          {/* Progress Summary for selected day */}
          <View style={dynamicStyles.progressSection}>
            <Text style={dynamicStyles.todayTime}>{todayHours}h {todayMins}m</Text>
            <Text style={dynamicStyles.todayLabel}>{selectedDayText}</Text>
            <View style={dynamicStyles.progressBarContainer}>
              <View style={[dynamicStyles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={dynamicStyles.targetLabel}>Target: {dailyTargetHours || 0}h</Text>
          </View>
          
          {/* Swipeable Weekly Chart */}
          <View style={dynamicStyles.weeklySection}>
            <View style={dynamicStyles.weekHeader}>
              <Text style={dynamicStyles.weeklyTitle}>{selectedHeaderText}</Text>
            </View>
            <FlatList
              data={Array.from({ length: MAX_WEEKS }, (_, i) => i)}
              keyExtractor={(item) => `week-${item}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={pageWidth - 36}
              decelerationRate="fast"
              bounces={false}
              inverted
              initialScrollIndex={0}
              getItemLayout={(data, index) => ({
                length: pageWidth - 36,
                offset: (pageWidth - 36) * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  pagerRef.current?.scrollToIndex({ index: info.index, animated: false });
                }, 100);
              }}
              ref={pagerRef}
              onMomentumScrollEnd={(event) => {
                const newWeekOffset = Math.round(event.nativeEvent.contentOffset.x / (pageWidth - 36));
                setWeekOffset(newWeekOffset);
              }}
              renderItem={({ item: weekIdx }) => (
                <View style={{ width: pageWidth - 36, paddingHorizontal: 8 }}>
                  <View style={dynamicStyles.barRow}>
                    {weekTotals.map((v, i) => {
                      const isSel = i === selectedIdx;
                      return (
                        <Pressable key={i} style={dynamicStyles.barColumn} onPress={() => setSelectedIdx(i)}>
                          <View style={dynamicStyles.barContainer}>
                            <View
                              style={[
                                dynamicStyles.bar,
                                {
                                  height: Math.max(4, (v / maxMs) * 80),
                                  backgroundColor: isSel ? themeColors.primary : themeColors.border,
                                },
                              ]}
                            />
                          </View>
                          <Text style={dynamicStyles.dayLabel}>{dayLabels[i]}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            />
          </View>
          
          <View style={dynamicStyles.headerRow}>
            <Text style={[dynamicStyles.headCell, { flex: 1 }]}>Start</Text>
            <Text style={[dynamicStyles.headCell, { flex: 1 }]}>Stop</Text>
            <Text style={[dynamicStyles.headCell, { flex: 1.2 }]}>Total</Text>
          </View>
          <ScrollView style={{ maxHeight: 320 }}>
            {(() => {
              const win = days[selectedIdx];
              const items = (playLogs || [])
                .map((l) => {
                  const st = l.start;
                  const en = l.end || Date.now();
                  const overlap = Math.max(0, Math.min(en, win.end) - Math.max(st, win.start));
                  if (overlap <= 0) return null;
                  const startClip = Math.max(st, win.start);
                  const endClip = Math.min(en, win.end);
                  const durationMin = Math.max(0, Math.floor((endClip - startClip) / 60000));
                  return {
                    id: l.id + '-' + startClip,
                    start: toTime(startClip),
                    stop: l.end ? toTime(endClip) : (en >= win.end ? 'Continued' : 'Running'),
                    total: `${durationMin} min`,
                    sortKey: endClip,
                  };
                })
                .filter(Boolean)
                .sort((a, b) => b.sortKey - a.sortKey);
              if (items.length === 0) return <Text style={dynamicStyles.empty}>No sessions for this day.</Text>;
              return items.map((it) => (
                <View key={it.id} style={dynamicStyles.row}>
                  <Text style={dynamicStyles.cell}>{it.start}</Text>
                  <Text style={dynamicStyles.cell}>{it.stop}</Text>
                  <Text style={[dynamicStyles.cell, dynamicStyles.total]}>{it.total}</Text>
                </View>
              ));
            })()}
          </ScrollView>
        {/* Confessions section removed as requested */}
        {!!onClose && (
          <Pressable style={({ pressed }) => [dynamicStyles.closeBtn, pressed && dynamicStyles.closeBtnPressed]} onPress={onClose}>
            <Text style={dynamicStyles.closeTxt}>Close</Text>
          </Pressable>
        )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 18 },
  card: { flex: 1, backgroundColor: 'transparent', borderRadius: 0, padding: 0, shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  progressSection: { alignItems: 'center', paddingVertical: 20, marginBottom: 20 },
  todayTime: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 4 },
  todayLabel: { fontSize: 14, color: colors.textDim, marginBottom: 16 },
  progressBarContainer: { width: '100%', height: 8, backgroundColor: colors.border, borderRadius: 0, marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 0 },
  targetLabel: { fontSize: 12, color: colors.textDim },
  
  // Weekly Chart - Android Digital Wellbeing Style
  weeklySection: { marginBottom: 24 },
  weekHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  weeklyTitle: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'center' },
  navButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border, borderRadius: 20 },
  navButtonText: { fontSize: 20, color: colors.text, fontWeight: 'bold' },
  chartContainer: { paddingHorizontal: 8 },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, marginBottom: 8 },
  barColumn: { flex: 1, alignItems: 'center' },
  barContainer: { height: 80, justifyContent: 'flex-end', marginBottom: 8 },
  bar: { width: 24, borderRadius: 0 },
  dayLabel: { fontSize: 12, color: colors.textDim, textAlign: 'center' },
  
  headerRow: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: colors.border, marginBottom: 8 },
  headCell: { fontWeight: '700', color: colors.text, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  cell: { color: colors.text, flex: 1 },
  sub: { color: colors.text, fontWeight: '700' },
  empty: { color: colors.textDim, textAlign: 'center', paddingVertical: 10 },
  confTs: { color: colors.textDim, fontSize: 12 },
  conf: { color: colors.text },
  closeBtn: { alignItems: 'center', marginTop: 12, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 8 },
  closeBtnPressed: { backgroundColor: colors.primaryDim },
  closeTxt: { color: colors.background, fontWeight: '800' },
});
