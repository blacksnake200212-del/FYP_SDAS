import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Dimensions
} from 'react-native';
import { TRANSLATIONS } from './src/translations';

const { width } = Dimensions.get('window');

// Color mapping for the 4-tier warning stages
const STAGE_THEMES = {
  NORMAL: {
    color: '#10B981', // Green
    bgColor: '#ECFDF5',
    borderColor: '#059669',
  },
  PRE_WARNING: {
    color: '#F59E0B', // Yellow
    bgColor: '#FFFBEB',
    borderColor: '#D97706',
  },
  CLEAR_AREA: {
    color: '#F97316', // Orange
    bgColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  DANGER: {
    color: '#EF4444', // Red
    bgColor: '#FEF2F2',
    borderColor: '#DC2626',
  }
};

export default function App() {
  const [lang, setLang] = useState('en'); // 'en', 'si', 'ta'
  const [activeTab, setActiveTab] = useState('DASHBOARD'); // 'DASHBOARD', 'FORECAST', 'EVACUATION', 'HOTLINES'
  const [telemetry, setTelemetry] = useState({
    water_level_cm: 64.2,
    capacity_pct: 75.5,
    max_level_cm: 85.0,
    stage: 'PRE_WARNING',
    rate_of_change: '+1.8 cm/hr',
    last_update: 'Just now',
    gate_opening_pct: 25.0,
    temperature_c: 28.5,
    humidity_pct: 78.0,
    forecast_1hr_cm: 68.4,
    forecast_1hr_pct: 80.5,
    forecast_advisory: 'CLEAR_AREA'
  });

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const currentTheme = STAGE_THEMES[telemetry.stage] || STAGE_THEMES.NORMAL;
  const currentStageText = t.stages[telemetry.stage] || t.stages.NORMAL;

  // Periodic Telemetry Updates
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => {
        const delta = (Math.random() - 0.45) * 0.4;
        const newLevel = Math.max(30, Math.min(84, prev.water_level_cm + delta));
        const newCap = (newLevel / 85.0) * 100;
        let newStage = 'NORMAL';
        if (newCap >= 85) newStage = 'DANGER';
        else if (newCap >= 78) newStage = 'CLEAR_AREA';
        else if (newCap >= 70) newStage = 'PRE_WARNING';

        return {
          ...prev,
          water_level_cm: parseFloat(newLevel.toFixed(1)),
          capacity_pct: parseFloat(newCap.toFixed(1)),
          stage: newStage,
          last_update: new Date().toLocaleTimeString()
        };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F294A" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t.appTitle}</Text>
          <Text style={styles.headerSubtitle}>{t.appSubtitle}</Text>
        </View>

        {/* Trilingual Switcher */}
        <View style={styles.langContainer}>
          <TouchableOpacity
            style={[styles.langPill, lang === 'en' && styles.langPillActive]}
            onPress={() => setLang('en')}
          >
            <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>EN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langPill, lang === 'si' && styles.langPillActive]}
            onPress={() => setLang('si')}
          >
            <Text style={[styles.langText, lang === 'si' && styles.langTextActive]}>සිං</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langPill, lang === 'ta' && styles.langPillActive]}
            onPress={() => setLang('ta')}
          >
            <Text style={[styles.langText, lang === 'ta' && styles.langTextActive]}>த</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'DASHBOARD' && styles.tabButtonActive]}
          onPress={() => setActiveTab('DASHBOARD')}
        >
          <Text style={[styles.tabText, activeTab === 'DASHBOARD' && styles.tabTextActive]}>
            {t.tabs.dashboard}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'FORECAST' && styles.tabButtonActive]}
          onPress={() => setActiveTab('FORECAST')}
        >
          <Text style={[styles.tabText, activeTab === 'FORECAST' && styles.tabTextActive]}>
            {t.tabs.forecast}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'EVACUATION' && styles.tabButtonActive]}
          onPress={() => setActiveTab('EVACUATION')}
        >
          <Text style={[styles.tabText, activeTab === 'EVACUATION' && styles.tabTextActive]}>
            {t.tabs.evacuation}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'HOTLINES' && styles.tabButtonActive]}
          onPress={() => setActiveTab('HOTLINES')}
        >
          <Text style={[styles.tabText, activeTab === 'HOTLINES' && styles.tabTextActive]}>
            {t.tabs.hotlines}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* TAB 1: DASHBOARD / REAL-TIME STATUS */}
        {activeTab === 'DASHBOARD' && (
          <View>
            {/* Staged Hazard Banner */}
            <View style={[styles.statusBanner, { backgroundColor: currentTheme.bgColor, borderColor: currentTheme.borderColor }]}>
              <View style={styles.statusHeaderRow}>
                <View style={[styles.badge, { backgroundColor: currentTheme.color }]}>
                  <Text style={styles.badgeText}>{currentStageText.title}</Text>
                </View>
                <Text style={styles.timestampText}>{telemetry.last_update}</Text>
              </View>
              <Text style={styles.statusDesc}>{currentStageText.description}</Text>
              <View style={styles.actionBox}>
                <Text style={[styles.actionText, { color: currentTheme.borderColor }]}>
                  ⚠️ {currentStageText.action}
                </Text>
              </View>
            </View>

            {/* Circular Reservoir Gauge */}
            <View style={styles.gaugeCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderTitle}>{t.metrics.storageCapacity}</Text>
                <Text style={styles.stationBadge}>{t.reservoirName}</Text>
              </View>

              <View style={styles.gaugeCircle}>
                <Text style={[styles.gaugeCapacityText, { color: currentTheme.color }]}>
                  {telemetry.capacity_pct}%
                </Text>
                <Text style={styles.gaugeSubText}>
                  {telemetry.water_level_cm} cm / 85.0 cm
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, telemetry.capacity_pct)}%`, backgroundColor: currentTheme.color }]} />
              </View>

              {/* Threshold Labels */}
              <View style={styles.thresholdRow}>
                <Text style={styles.thresholdLabel}>0%</Text>
                <Text style={styles.thresholdLabel}>70% (Pre-Warn)</Text>
                <Text style={styles.thresholdLabel}>85% (Danger)</Text>
                <Text style={styles.thresholdLabel}>100%</Text>
              </View>
            </View>

            {/* Telemetry Metric Grid */}
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.metricLabel}>{t.metrics.waterLevel}</Text>
                <Text style={styles.metricValue}>{telemetry.water_level_cm} cm</Text>
                <Text style={styles.metricSub}>{telemetry.rate_of_change}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.metricLabel}>{t.metrics.spillwayGate}</Text>
                <Text style={styles.metricValue}>{telemetry.gate_opening_pct}%</Text>
                <Text style={styles.metricSub}>
                  {telemetry.gate_opening_pct > 0 ? t.metrics.open : t.metrics.closed}
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.metricLabel}>{t.metrics.temperature}</Text>
                <Text style={styles.metricValue}>{telemetry.temperature_c}°C</Text>
                <Text style={styles.metricSub}>DHT22 Sensor</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.metricLabel}>{t.metrics.humidity}</Text>
                <Text style={styles.metricValue}>{telemetry.humidity_pct}%</Text>
                <Text style={styles.metricSub}>Puttalam Coastal</Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: AI FORECAST */}
        {activeTab === 'FORECAST' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>{t.forecast.title}</Text>
              <Text style={styles.bodyText}>{t.forecast.subtitle}</Text>

              <View style={styles.forecastMetricBox}>
                <View>
                  <Text style={styles.forecastSub}>{t.forecast.projectedLevel}</Text>
                  <Text style={styles.forecastValue}>{telemetry.forecast_1hr_cm} cm</Text>
                </View>
                <View>
                  <Text style={styles.forecastSub}>{t.forecast.projectedCapacity}</Text>
                  <Text style={[styles.forecastValue, { color: '#F97316' }]}>{telemetry.forecast_1hr_pct}%</Text>
                </View>
              </View>

              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  📈 {t.forecast.predictedTrend}: {telemetry.forecast_1hr_pct > telemetry.capacity_pct ? t.forecast.trendRising : t.forecast.trendStable}
                </Text>
              </View>

              <Text style={styles.miniNote}>{t.forecast.aiConfidence}</Text>
            </View>
          </View>
        )}

        {/* TAB 3: EVACUATION SAFE ZONES */}
        {activeTab === 'EVACUATION' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>{t.evacuation.title}</Text>
              <Text style={styles.bodyText}>{t.evacuation.subtitle}</Text>

              {/* Shelter 1 */}
              <View style={styles.zoneItem}>
                <Text style={styles.zoneTitle}>1. {t.evacuation.shelter1.name}</Text>
                <Text style={styles.zoneDesc}>📍 {t.evacuation.shelter1.location}</Text>
                <View style={styles.zoneMetaRow}>
                  <Text style={styles.zoneMetaBadge}>👥 {t.evacuation.shelter1.capacity}</Text>
                  <Text style={styles.zoneMetaBadge}>⛰️ {t.evacuation.shelter1.elevation}</Text>
                </View>
              </View>

              {/* Shelter 2 */}
              <View style={styles.zoneItem}>
                <Text style={styles.zoneTitle}>2. {t.evacuation.shelter2.name}</Text>
                <Text style={styles.zoneDesc}>📍 {t.evacuation.shelter2.location}</Text>
                <View style={styles.zoneMetaRow}>
                  <Text style={styles.zoneMetaBadge}>👥 {t.evacuation.shelter2.capacity}</Text>
                  <Text style={styles.zoneMetaBadge}>⛰️ {t.evacuation.shelter2.elevation}</Text>
                </View>
              </View>

              {/* Shelter 3 */}
              <View style={styles.zoneItem}>
                <Text style={styles.zoneTitle}>3. {t.evacuation.shelter3.name}</Text>
                <Text style={styles.zoneDesc}>📍 {t.evacuation.shelter3.location}</Text>
                <View style={styles.zoneMetaRow}>
                  <Text style={styles.zoneMetaBadge}>👥 {t.evacuation.shelter3.capacity}</Text>
                  <Text style={styles.zoneMetaBadge}>⛰️ {t.evacuation.shelter3.elevation}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TAB 4: EMERGENCY HOTLINES */}
        {activeTab === 'HOTLINES' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>{t.hotlines.title}</Text>
              <Text style={styles.bodyText}>{t.hotlines.subtitle}</Text>

              {/* DMC 117 */}
              <TouchableOpacity
                style={styles.hotlineButton}
                onPress={() => Linking.openURL('tel:117')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.hotlineName}>{t.hotlines.dmc}</Text>
                  <Text style={styles.hotlineSub}>National Disaster Emergency Hot Line</Text>
                </View>
                <View style={styles.callBadge}>
                  <Text style={styles.callBadgeText}>📞 117</Text>
                </View>
              </TouchableOpacity>

              {/* Police 119 */}
              <TouchableOpacity
                style={styles.hotlineButton}
                onPress={() => Linking.openURL('tel:119')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.hotlineName}>{t.hotlines.police}</Text>
                  <Text style={styles.hotlineSub}>Emergency Police Response & Rescue</Text>
                </View>
                <View style={styles.callBadge}>
                  <Text style={styles.callBadgeText}>📞 119</Text>
                </View>
              </TouchableOpacity>

              {/* Suwa Seriya 1990 */}
              <TouchableOpacity
                style={styles.hotlineButton}
                onPress={() => Linking.openURL('tel:1990')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.hotlineName}>{t.hotlines.ambulance}</Text>
                  <Text style={styles.hotlineSub}>National Pre-Hospital Emergency Care</Text>
                </View>
                <View style={styles.callBadge}>
                  <Text style={styles.callBadgeText}>📞 1990</Text>
                </View>
              </TouchableOpacity>

              {/* Dam Engineering Office */}
              <TouchableOpacity
                style={styles.hotlineButton}
                onPress={() => Linking.openURL('tel:0322265243')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.hotlineName}>{t.hotlines.damOffice}</Text>
                  <Text style={styles.hotlineSub}>Puttalam Engineering Headquarters</Text>
                </View>
                <View style={styles.callBadge}>
                  <Text style={styles.callBadgeText}>📞 032-2265243</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9'
  },
  header: {
    backgroundColor: '#0F294A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2
  },
  langContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 2,
    marginHorizontal: 8
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  langPillActive: {
    backgroundColor: '#3B82F6'
  },
  langText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: 'bold'
  },
  langTextActive: {
    color: '#FFFFFF'
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4
  },
  liveText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: 'bold'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center'
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#1E3A8A'
  },
  tabText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#1E3A8A',
    fontWeight: 'bold'
  },
  contentContainer: {
    padding: 16
  },
  statusBanner: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  timestampText: {
    fontSize: 10,
    color: '#64748B'
  },
  statusDesc: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 8
  },
  actionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 8
  },
  actionText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  stationBadge: {
    fontSize: 10,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  gaugeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14
  },
  gaugeCapacityText: {
    fontSize: 42,
    fontWeight: '900'
  },
  gaugeSubText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6
  },
  thresholdLabel: {
    fontSize: 10,
    color: '#94A3B8'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  gridItem: {
    width: (width - 42) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  metricSub: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 2,
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  bodyText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12
  },
  forecastMetricBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginVertical: 10
  },
  forecastSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2
  },
  forecastValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  infoBadge: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 8
  },
  infoBadgeText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '600'
  },
  miniNote: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4
  },
  zoneItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginBottom: 10
  },
  zoneTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F294A',
    marginBottom: 2
  },
  zoneDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6
  },
  zoneMetaRow: {
    flexDirection: 'row',
    gap: 8
  },
  zoneMetaBadge: {
    fontSize: 10,
    color: '#1E40AF',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600'
  },
  hotlineButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10
  },
  hotlineName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  hotlineSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  callBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  callBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803D'
  }
});
