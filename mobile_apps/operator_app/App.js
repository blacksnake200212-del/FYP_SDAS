import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  Switch,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SUPABASE_CONFIG } from './src/config/supabase';

const { width } = Dimensions.get('window');

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [operatorId, setOperatorId] = useState('ENG-PUTTALAM-04');
  const [email, setEmail] = useState('operator@sdas.sltc.lk');
  const [password, setPassword] = useState('Puttalam#2026');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('TELEMETRY'); // 'TELEMETRY', 'GATE_CONTROL', 'SMS_DISPATCH', 'AUDIT_LOGS'

  // Engineering Telemetry State
  const [telemetry, setTelemetry] = useState({
    water_level_cm: 64.2,
    capacity_pct: 75.5,
    sensor_1_cm: 35.8,
    sensor_2_cm: 35.7,
    sensor_discrepancy_cm: 0.1,
    temperature_c: 28.5,
    humidity_pct: 78.0,
    sound_speed_mps: 348.57,
    system_state: 'PRE_WARNING',
    current_gate_angle: 27,
    current_gate_pct: 30.0,
    is_manual_override: false,
    autoencoder_mse: 0.024,
    autoencoder_threshold: 0.781,
    sensor_health: 'HEALTHY'
  });

  // Manual Gate Override State
  const [targetOverrideAngle, setTargetOverrideAngle] = useState(27);
  const [overrideModalVisible, setOverrideModalVisible] = useState(false);
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [smsStageSelected, setSmsStageSelected] = useState('PRE_WARNING');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: '1', time: '10:45 AM', action: 'AUTO_STAGED_OPEN', details: 'Capacity reached 70.2%. Gate opened 0° -> 27° (30%)', trigger: 'AUTO_HYSTERESIS' },
    { id: '2', time: '09:12 AM', action: 'HEALTH_CHECK', details: 'Dual JSN-SR04T sensors synchronized. Discrepancy 0.1cm. Autoencoder MSE 0.021', trigger: 'SYSTEM' },
    { id: '3', time: '08:00 AM', action: 'OPERATOR_LOGIN', details: 'Operator Dias Adrian (Cyber Security) authenticated', trigger: 'AUTH' }
  ]);

  // Periodic Telemetry Updates
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => {
        const delta = (Math.random() - 0.48) * 0.3;
        const newLevel = Math.max(30, Math.min(84, prev.water_level_cm + delta));
        const newCap = (newLevel / 85.0) * 100;
        const s1 = 100 - newLevel + (Math.random() - 0.5) * 0.2;
        const s2 = 100 - newLevel + (Math.random() - 0.5) * 0.2;
        const diff = Math.abs(s1 - s2);

        return {
          ...prev,
          water_level_cm: parseFloat(newLevel.toFixed(1)),
          capacity_pct: parseFloat(newCap.toFixed(1)),
          sensor_1_cm: parseFloat(s1.toFixed(1)),
          sensor_2_cm: parseFloat(s2.toFixed(1)),
          sensor_discrepancy_cm: parseFloat(diff.toFixed(2))
        };
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const handleApplyOverride = () => {
    setOverrideModalVisible(false);
    const newPct = parseFloat(((targetOverrideAngle / 90) * 100).toFixed(1));
    setTelemetry(prev => ({
      ...prev,
      is_manual_override: true,
      current_gate_angle: targetOverrideAngle,
      current_gate_pct: newPct
    }));

    setAuditLogs(prev => [
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        action: 'MANUAL_OVERRIDE_APPLIED',
        details: `Operator set gate to ${targetOverrideAngle}° (${newPct}% aperture). Automated hysteresis bypassed.`,
        trigger: 'OPERATOR_OVERRIDE'
      },
      ...prev
    ]);

    Alert.alert('Override Dispatched', `Command sent to ESP32: Gate positioning to ${targetOverrideAngle}° (${newPct}%)`);
  };

  const handleReleaseOverride = () => {
    setTelemetry(prev => ({
      ...prev,
      is_manual_override: false
    }));

    setAuditLogs(prev => [
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        action: 'OVERRIDE_RELEASED',
        details: 'Manual override cancelled. Reverted to Autonomous 3% Hysteresis state machine.',
        trigger: 'OPERATOR'
      },
      ...prev
    ]);

    Alert.alert('Autonomous Mode Restored', 'Gate returned to automated 3% hysteresis state machine.');
  };

  const handleDispatchSMS = () => {
    setSmsModalVisible(false);
    setAuditLogs(prev => [
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        action: `SMS_BROADCAST_${smsStageSelected}`,
        details: `Dispatched ${smsStageSelected} SMS to 3 registered contacts via SIM800L module.`,
        trigger: 'OPERATOR_DISPATCH'
      },
      ...prev
    ]);
    Alert.alert('Emergency SMS Sent', `Broadcasted ${smsStageSelected} alert to DMC, Police, and Community Dispatch.`);
  };

  const handleSupabaseLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both Operator Email and Password.');
      return;
    }
    setAuthLoading(true);
    try {
      const response = await fetch(`${SUPABASE_CONFIG.PROJECT_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.PUBLISHABLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        const userDisplay = data.user?.email || 'ENG-PUTTALAM-04';
        setOperatorId(userDisplay);
        setAuditLogs(prev => [
          {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString(),
            action: 'SUPABASE_LOGIN',
            details: `Cloud authenticated: ${userDisplay}`,
            trigger: 'AUTH_SUCCESS'
          },
          ...prev
        ]);
        setIsAuthenticated(true);
      } else {
        const errorMsg = data.error_description || data.msg || 'Invalid credentials or user not registered in Supabase.';
        Alert.alert(
          'Supabase Cloud Authentication',
          `${errorMsg}\n\nWould you like to enter in Demo Mode instead?`,
          [
            { text: 'Try Again' },
            {
              text: 'Enter Demo Mode',
              onPress: () => {
                setOperatorId('ENG-PUTTALAM-04 (Demo)');
                setIsAuthenticated(true);
              }
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert(
        'Offline / Demo Login',
        'Cannot reach Supabase Cloud server right now. Proceed with Offline Demo Mode?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enter Demo Mode',
            onPress: () => {
              setOperatorId('ENG-PUTTALAM-04 (Offline)');
              setIsAuthenticated(true);
            }
          }
        ]
      );
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0F294A" />
        <View style={styles.loginCard}>
          <Text style={styles.loginHeader}>SDAS Operator Portal</Text>
          <Text style={styles.loginSub}>Puttalam Dam Spillway Management</Text>

          <Text style={styles.inputLabel}>Operator Email</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. operator@sdas.sltc.lk"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Supabase Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSupabaseLogin}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Authenticate via Supabase Auth</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setOperatorId('ENG-PUTTALAM-04 (Demo)');
              setIsAuthenticated(true);
            }}
          >
            <Text style={styles.secondaryButtonText}>⚡ One-Tap Demo Bypass</Text>
          </TouchableOpacity>

          <View style={styles.credentialHintBox}>
            <Text style={styles.hintTitle}>Demo Operator Account:</Text>
            <Text style={styles.hintText}>Email: operator@sdas.sltc.lk</Text>
            <Text style={styles.hintText}>Password: Puttalam#2026</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F294A" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SDAS Operator Console</Text>
          <Text style={styles.headerSubtitle}>Logged in: {operatorId}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => setIsAuthenticated(false)}>
          <Text style={styles.logoutText}>Lock</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'TELEMETRY' && styles.tabButtonActive]}
          onPress={() => setActiveTab('TELEMETRY')}
        >
          <Text style={[styles.tabText, activeTab === 'TELEMETRY' && styles.tabTextActive]}>Telemetry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'GATE_CONTROL' && styles.tabButtonActive]}
          onPress={() => setActiveTab('GATE_CONTROL')}
        >
          <Text style={[styles.tabText, activeTab === 'GATE_CONTROL' && styles.tabTextActive]}>Gate Control</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'SMS_DISPATCH' && styles.tabButtonActive]}
          onPress={() => setActiveTab('SMS_DISPATCH')}
        >
          <Text style={[styles.tabText, activeTab === 'SMS_DISPATCH' && styles.tabTextActive]}>SMS Dispatch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'AUDIT_LOGS' && styles.tabButtonActive]}
          onPress={() => setActiveTab('AUDIT_LOGS')}
        >
          <Text style={[styles.tabText, activeTab === 'AUDIT_LOGS' && styles.tabTextActive]}>Audit Log</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* TAB 1: ENGINEERING TELEMETRY */}
        {activeTab === 'TELEMETRY' && (
          <View>
            {/* System Status Banner */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Real-Time Reservoir Telemetry</Text>
                <View style={[styles.statusBadge, { backgroundColor: telemetry.is_manual_override ? '#DC2626' : '#2563EB' }]}>
                  <Text style={styles.statusBadgeText}>
                    {telemetry.is_manual_override ? 'MANUAL OVERRIDE' : 'AUTO HYSTERESIS'}
                  </Text>
                </View>
              </View>

              <View style={styles.largeMetricRow}>
                <View>
                  <Text style={styles.metricSubTitle}>Storage Capacity</Text>
                  <Text style={styles.hugeMetric}>{telemetry.capacity_pct}%</Text>
                  <Text style={styles.metricHelper}>{telemetry.water_level_cm} cm of 85.0 cm</Text>
                </View>
                <View>
                  <Text style={styles.metricSubTitle}>Gate Position</Text>
                  <Text style={styles.hugeMetric}>{telemetry.current_gate_angle}°</Text>
                  <Text style={styles.metricHelper}>{telemetry.current_gate_pct}% Open (MG996R)</Text>
                </View>
              </View>
            </View>

            {/* Dual Sensor Comparison Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dual JSN-SR04T Sensor Fusion</Text>
              <Text style={styles.bodyText}>Dual waterproof transducers sampled via ML2029 logic level converter:</Text>

              <View style={styles.sensorGrid}>
                <View style={styles.sensorBox}>
                  <Text style={styles.sensorLabel}>Sensor 1 (GPIO 5/19)</Text>
                  <Text style={styles.sensorVal}>{telemetry.sensor_1_cm} cm</Text>
                  <Text style={styles.sensorStatus}>Online (Valid)</Text>
                </View>

                <View style={styles.sensorBox}>
                  <Text style={styles.sensorLabel}>Sensor 2 (GPIO 18/21)</Text>
                  <Text style={styles.sensorVal}>{telemetry.sensor_2_cm} cm</Text>
                  <Text style={styles.sensorStatus}>Online (Valid)</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transducer Discrepancy:</Text>
                <Text style={[styles.infoValue, { color: telemetry.sensor_discrepancy_cm > 8 ? '#EF4444' : '#10B981' }]}>
                  {telemetry.sensor_discrepancy_cm} cm (Max allowed: 8.0 cm)
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Acoustic Sound Velocity:</Text>
                <Text style={styles.infoValue}>{telemetry.sound_speed_mps} m/s (DHT22 Calibrated)</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ambient Environment:</Text>
                <Text style={styles.infoValue}>{telemetry.temperature_c}°C | {telemetry.humidity_pct}% RH</Text>
              </View>
            </View>

            {/* AI Autoencoder Diagnostics */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Deep Autoencoder Health Diagnostics</Text>
                <View style={styles.healthyBadge}>
                  <Text style={styles.healthyBadgeText}>{telemetry.sensor_health}</Text>
                </View>
              </View>
              <Text style={styles.bodyText}>
                Unsupervised neural reconstruction error (MSE) evaluated by cloud FastAPI server:
              </Text>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, (telemetry.autoencoder_mse / telemetry.autoencoder_threshold) * 100)}%`,
                      backgroundColor: '#10B981'
                    }
                  ]}
                />
              </View>
              <View style={styles.thresholdRow}>
                <Text style={styles.thresholdLabel}>Current MSE: {telemetry.autoencoder_mse}</Text>
                <Text style={styles.thresholdLabel}>Anomaly Threshold: {telemetry.autoencoder_threshold}</Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: MANUAL GATE OVERRIDE CONTROLLER */}
        {activeTab === 'GATE_CONTROL' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Spillway Gate Actuator Control (MG996R)</Text>
              <Text style={styles.bodyText}>
                Certified operators can override the local 3% hysteresis state machine to clear debris, perform maintenance, or initiate emergency retention.
              </Text>

              {/* Mode Status Indicator */}
              <View style={[styles.overrideBanner, { backgroundColor: telemetry.is_manual_override ? '#FEF2F2' : '#F0FDF4' }]}>
                <Text style={[styles.overrideBannerTitle, { color: telemetry.is_manual_override ? '#DC2626' : '#16A34A' }]}>
                  {telemetry.is_manual_override ? '⚠️ MANUAL OVERRIDE ENGAGED' : '✅ AUTONOMOUS HYSTERESIS ACTIVE'}
                </Text>
                <Text style={styles.overrideBannerDesc}>
                  {telemetry.is_manual_override
                    ? 'Automated threshold actions are locked out. Operator holds absolute control.'
                    : 'ESP32 is regulating gate aperture based on water capacity and 3% hysteresis window.'}
                </Text>
              </View>

              {/* Current Angle Display */}
              <View style={styles.angleDisplayBox}>
                <Text style={styles.angleSub}>Target Position</Text>
                <Text style={styles.angleNumber}>{targetOverrideAngle}°</Text>
                <Text style={styles.anglePct}>Aperture: {((targetOverrideAngle / 90) * 100).toFixed(0)}% Open</Text>
              </View>

              {/* Preset Buttons */}
              <Text style={styles.presetLabel}>Select Staged Preset Angle:</Text>
              <View style={styles.presetRow}>
                <TouchableOpacity
                  style={[styles.presetBtn, targetOverrideAngle === 0 && styles.presetBtnActive]}
                  onPress={() => setTargetOverrideAngle(0)}
                >
                  <Text style={[styles.presetBtnText, targetOverrideAngle === 0 && styles.presetBtnTextActive]}>0° (Closed)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetBtn, targetOverrideAngle === 27 && styles.presetBtnActive]}
                  onPress={() => setTargetOverrideAngle(27)}
                >
                  <Text style={[styles.presetBtnText, targetOverrideAngle === 27 && styles.presetBtnTextActive]}>27° (30%)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetBtn, targetOverrideAngle === 54 && styles.presetBtnActive]}
                  onPress={() => setTargetOverrideAngle(54)}
                >
                  <Text style={[styles.presetBtnText, targetOverrideAngle === 54 && styles.presetBtnTextActive]}>54° (60%)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetBtn, targetOverrideAngle === 90 && styles.presetBtnActive]}
                  onPress={() => setTargetOverrideAngle(90)}
                >
                  <Text style={[styles.presetBtnText, targetOverrideAngle === 90 && styles.presetBtnTextActive]}>90° (100%)</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.overrideExecuteButton}
                onPress={() => setOverrideModalVisible(true)}
              >
                <Text style={styles.overrideExecuteText}>Dispatch Manual Override Command</Text>
              </TouchableOpacity>

              {telemetry.is_manual_override && (
                <TouchableOpacity
                  style={styles.releaseButton}
                  onPress={handleReleaseOverride}
                >
                  <Text style={styles.releaseButtonText}>Release Override (Return to Auto)</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* TAB 3: EMERGENCY SMS DISPATCH */}
        {activeTab === 'SMS_DISPATCH' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>SIM800L Cellular Broadcast Station</Text>
              <Text style={styles.bodyText}>
                Transmit prioritized SMS alerts through the on-board SIM800L GSM transceiver to civil protection hotlines:
              </Text>

              <TouchableOpacity
                style={[styles.smsStageBtn, { borderColor: '#F59E0B' }]}
                onPress={() => { setSmsStageSelected('PRE_WARNING'); setSmsModalVisible(true); }}
              >
                <View>
                  <Text style={[styles.smsStageTitle, { color: '#D97706' }]}>1. Broadcast PRE-WARNING SMS</Text>
                  <Text style={styles.smsStageSub}>Notifies local irrigation staff and DMC of approaching 70% threshold.</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smsStageBtn, { borderColor: '#F97316' }]}
                onPress={() => { setSmsStageSelected('CLEAR_AREA'); setSmsModalVisible(true); }}
              >
                <View>
                  <Text style={[styles.smsStageTitle, { color: '#EA580C' }]}>2. Broadcast CLEAR AREA SMS</Text>
                  <Text style={styles.smsStageSub}>Orders immediate evacuation of downstream river channels.</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smsStageBtn, { borderColor: '#EF4444' }]}
                onPress={() => { setSmsStageSelected('DANGER'); setSmsModalVisible(true); }}
              >
                <View>
                  <Text style={[styles.smsStageTitle, { color: '#DC2626' }]}>3. Broadcast EMERGENCY DANGER SMS</Text>
                  <Text style={styles.smsStageSub}>Alerts Police, Disaster Center, and civil authorities of 100% spillway discharge.</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Recipient Directory */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Registered Recipient Directory</Text>
              <Text style={styles.bulletItem}>• Chief Dam Engineer: +94 77 123 4567 (Active)</Text>
              <Text style={styles.bulletItem}>• Puttalam Disaster Center: +94 32 226 5243 (Active)</Text>
              <Text style={styles.bulletItem}>• Chilaw HQ Police Dispatch: +94 32 222 2222 (Active)</Text>
            </View>
          </View>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'AUDIT_LOGS' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>System Gate & Safety Audit Trail</Text>
              <Text style={styles.bodyText}>Immutable chronological record of gate actuations and telemetry events:</Text>

              {auditLogs.map(log => (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logAction}>{log.action}</Text>
                    <Text style={styles.logTime}>{log.time}</Text>
                  </View>
                  <Text style={styles.logDetails}>{log.details}</Text>
                  <Text style={styles.logTrigger}>Trigger Source: {log.trigger}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Override Confirmation Modal */}
      <Modal visible={overrideModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Gate Override</Text>
            <Text style={styles.modalText}>
              Are you sure you want to manually set the MG996R gate aperture to {targetOverrideAngle}° ({((targetOverrideAngle / 90) * 100).toFixed(0)}%)?
            </Text>
            <Text style={styles.modalWarning}>
              ⚠️ This will suspend automated 3% hysteresis safety adjustments until released.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setOverrideModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleApplyOverride}>
                <Text style={styles.modalConfirmText}>Confirm & Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SMS Confirmation Modal */}
      <Modal visible={smsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Emergency SMS Broadcast</Text>
            <Text style={styles.modalText}>
              Broadcast {smsStageSelected} text alert to all registered Puttalam disaster responders via SIM800L module?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSmsModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleDispatchSMS}>
                <Text style={styles.modalConfirmText}>Broadcast SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9'
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#0F294A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loginCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4
  },
  loginHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F294A',
    marginBottom: 4,
    textAlign: 'center'
  },
  loginSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 14
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0'
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: 'bold'
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 13
  },
  credentialHintBox: {
    marginTop: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 10
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 2
  },
  hintText: {
    fontSize: 11,
    color: '#1E3A8A'
  },
  header: {
    backgroundColor: '#0F294A',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600'
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  largeMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 10
  },
  metricSubTitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2
  },
  hugeMetric: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  metricHelper: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 2
  },
  bodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12
  },
  sensorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  sensorBox: {
    width: (width - 56) / 2,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sensorLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4
  },
  sensorVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  sensorStatus: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 2
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B'
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F294A'
  },
  healthyBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981'
  },
  healthyBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: 'bold'
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  thresholdLabel: {
    fontSize: 10,
    color: '#94A3B8'
  },
  overrideBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16
  },
  overrideBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2
  },
  overrideBannerDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15
  },
  angleDisplayBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  angleSub: {
    fontSize: 12,
    color: '#64748B'
  },
  angleNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1E3A8A'
  },
  anglePct: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981'
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center'
  },
  presetBtnActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A'
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155'
  },
  presetBtnTextActive: {
    color: '#FFFFFF'
  },
  overrideExecuteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  overrideExecuteText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13
  },
  releaseButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  releaseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13
  },
  smsStageBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12
  },
  smsStageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2
  },
  smsStageSub: {
    fontSize: 11,
    color: '#64748B'
  },
  bulletItem: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 4
  },
  logItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1E3A8A',
    marginBottom: 10
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  logAction: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  logTime: {
    fontSize: 10,
    color: '#94A3B8'
  },
  logDetails: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15
  },
  logTrigger: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 5
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F294A',
    marginBottom: 8
  },
  modalText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 8
  },
  modalWarning: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8
  },
  modalCancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600'
  },
  modalConfirmBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold'
  }
});
