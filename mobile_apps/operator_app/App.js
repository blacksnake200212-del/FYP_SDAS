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
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SUPABASE_CONFIG } from './src/config/supabase';
import { TRANSLATIONS } from './src/translations';

const { width } = Dimensions.get('window');

export default function App() {
  // Language State: 'en', 'si', 'ta'
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

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

  // SMS Dispatch State & Dynamic Registered Recipient Directory
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [smsStageSelected, setSmsStageSelected] = useState('PRE_WARNING');
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);

  // Registered Contacts List (Only these will receive broadcasts)
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Eng. K. A. Perera', phone_number: '+94 77 123 4567', role: 'Chief Dam Engineer' },
    { id: '2', name: 'Puttalam Disaster Center (DMC Desk)', phone_number: '+94 32 226 5243', role: 'DMC Operations' },
    { id: '3', name: 'Chilaw HQ Police Emergency', phone_number: '+94 32 222 2222', role: 'Police Command' }
  ]);

  // Add Contact Form State
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRole, setNewContactRole] = useState('');

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

  // Manual Gate Override Handlers
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
        action: 'MANUAL_GATE_OVERRIDE',
        details: `Gate aperture manually set to ${targetOverrideAngle}° (${newPct}%) by ${operatorId}.`,
        trigger: 'MANUAL_OVERRIDE'
      },
      ...prev
    ]);

    Alert.alert(
      'Manual Override Active',
      `MG996R gate target commanded to ${targetOverrideAngle}° (${newPct}% aperture).`
    );
  };

  const handleReleaseOverride = () => {
    setTelemetry(prev => ({
      ...prev,
      is_manual_override: false,
      current_gate_angle: 27,
      current_gate_pct: 30.0
    }));

    setAuditLogs(prev => [
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        action: 'RELEASE_OVERRIDE',
        details: `Manual override released by ${operatorId}. System returned to autonomous 3% hysteresis state machine.`,
        trigger: 'MANUAL_RELEASE'
      },
      ...prev
    ]);

    Alert.alert('Autonomous Mode Restored', 'Gate returned to automated 3% hysteresis state machine.');
  };

  // Add Contact Handler
  const handleAddContact = () => {
    const trimmedName = newContactName.trim();
    const trimmedPhone = newContactPhone.trim();
    const trimmedRole = newContactRole.trim() || 'Responder';

    if (!trimmedName || !trimmedPhone) {
      Alert.alert('Required Information', 'Please provide both the contact name and phone number.');
      return;
    }

    // Basic format check
    if (trimmedPhone.length < 9) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number (e.g. +94 77 123 4567).');
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      name: trimmedName,
      phone_number: trimmedPhone,
      role: trimmedRole
    };

    setContacts(prev => [newContact, ...prev]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRole('');
    setAddContactModalVisible(false);

    setAuditLogs(prev => [
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        action: 'RECIPIENT_ADDED',
        details: `Added SMS recipient: ${trimmedName} (${trimmedPhone}, ${trimmedRole}) by ${operatorId}.`,
        trigger: 'DIRECTORY_MANAGEMENT'
      },
      ...prev
    ]);

    Alert.alert('Recipient Registered', `Emergency broadcasts will now be transmitted to ${trimmedPhone} (${trimmedName}).`);
  };

  // Remove Contact Handler
  const handleRemoveContact = (id, name, phone) => {
    Alert.alert(
      t.smsDispatch.confirmRemoveTitle,
      `${t.smsDispatch.confirmRemoveMsg}\n\n• ${name}: ${phone}`,
      [
        { text: t.smsDispatch.cancelBtn, style: 'cancel' },
        {
          text: t.smsDispatch.confirmRemoveBtn,
          style: 'destructive',
          onPress: () => {
            setContacts(prev => prev.filter(c => c.id !== id));
            setAuditLogs(prevLog => [
              {
                id: Date.now().toString(),
                time: new Date().toLocaleTimeString(),
                action: 'RECIPIENT_REMOVED',
                details: `Removed recipient ${name} (${phone}) from emergency directory by ${operatorId}.`,
                trigger: 'DIRECTORY_MANAGEMENT'
              },
              ...prevLog
            ]);
            Alert.alert('Removed', `${phone} removed from emergency broadcast directory.`);
          }
        }
      ]
    );
  };

  // Emergency SMS Broadcast Handler (Sends ONLY to registered numbers)
  const handleDispatchSMS = () => {
    setSmsModalVisible(false);

    if (contacts.length === 0) {
      Alert.alert(
        'No Recipients Registered',
        'Cannot dispatch broadcast: there are no authorized phone numbers in the directory. Please add at least one recipient.'
      );
      return;
    }

    const recipientList = contacts.map(c => `${c.name} (${c.phone_number})`).join('\n• ');
    const phoneNumbers = contacts.map(c => c.phone_number).join(', ');

    setAuditLogs(prev => [
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        action: `SMS_BROADCAST_${smsStageSelected}`,
        details: `Dispatched ${smsStageSelected} SMS via SIM800L to ${contacts.length} verified numbers: ${phoneNumbers}.`,
        trigger: 'OPERATOR_DISPATCH'
      },
      ...prev
    ]);

    Alert.alert(
      'Emergency SMS Broadcast Transmitted',
      `Stage: ${smsStageSelected}\n\nDispatched exclusively to ${contacts.length} registered recipient(s):\n• ${recipientList}`
    );
  };

  // Supabase Authentication
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

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0F294A" />

        {/* Language selector on login screen */}
        <View style={styles.loginLangRow}>
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

        <View style={styles.loginCard}>
          <Text style={styles.loginHeader}>{t.appTitle}</Text>
          <Text style={styles.loginSub}>{t.appSubtitle}</Text>

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

  // MAIN OPERATOR DASHBOARD
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F294A" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t.appTitle}</Text>
          <Text style={styles.headerSubtitle}>Logged in: {operatorId}</Text>
        </View>

        {/* Trilingual Toggle */}
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
          <Text style={[styles.tabText, activeTab === 'TELEMETRY' && styles.tabTextActive]}>
            {t.tabs.telemetry}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'GATE_CONTROL' && styles.tabButtonActive]}
          onPress={() => setActiveTab('GATE_CONTROL')}
        >
          <Text style={[styles.tabText, activeTab === 'GATE_CONTROL' && styles.tabTextActive]}>
            {t.tabs.gateControl}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'SMS_DISPATCH' && styles.tabButtonActive]}
          onPress={() => setActiveTab('SMS_DISPATCH')}
        >
          <Text style={[styles.tabText, activeTab === 'SMS_DISPATCH' && styles.tabTextActive]}>
            {t.tabs.smsDispatch}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'AUDIT_LOGS' && styles.tabButtonActive]}
          onPress={() => setActiveTab('AUDIT_LOGS')}
        >
          <Text style={[styles.tabText, activeTab === 'AUDIT_LOGS' && styles.tabTextActive]}>
            {t.tabs.auditLogs}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* TAB 1: ENGINEERING TELEMETRY */}
        {activeTab === 'TELEMETRY' && (
          <View>
            {/* System Status Banner */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{t.status.systemState}</Text>
                <View style={[styles.statusBadge, { backgroundColor: telemetry.is_manual_override ? '#DC2626' : '#2563EB' }]}>
                  <Text style={styles.statusBadgeText}>
                    {telemetry.is_manual_override ? t.status.manualActive : t.status.autoActive}
                  </Text>
                </View>
              </View>

              <View style={styles.largeMetricRow}>
                <View>
                  <Text style={styles.metricSubTitle}>{t.telemetry.reservoirCapacity}</Text>
                  <Text style={styles.hugeMetric}>{telemetry.capacity_pct}%</Text>
                  <Text style={styles.metricHelper}>{telemetry.water_level_cm} cm of 85.0 cm</Text>
                </View>
                <View>
                  <Text style={styles.metricSubTitle}>{t.status.gateAperture}</Text>
                  <Text style={styles.hugeMetric}>{telemetry.current_gate_angle}°</Text>
                  <Text style={styles.metricHelper}>{telemetry.current_gate_pct}% Open (MG996R)</Text>
                </View>
              </View>
            </View>

            {/* Dual Sensor Comparison */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dual Ultrasonic Verification</Text>
              <Text style={styles.bodyText}>Redundant acoustic sensing with real-time discrepancy monitoring:</Text>

              <View style={styles.sensorRow}>
                <View style={styles.sensorBox}>
                  <Text style={styles.sensorLabel}>{t.telemetry.sensor1}</Text>
                  <Text style={styles.sensorValue}>{telemetry.sensor_1_cm} cm</Text>
                </View>
                <View style={styles.sensorBox}>
                  <Text style={styles.sensorLabel}>{t.telemetry.sensor2}</Text>
                  <Text style={styles.sensorValue}>{telemetry.sensor_2_cm} cm</Text>
                </View>
              </View>

              <View style={styles.discrepancyBox}>
                <Text style={styles.discrepancyLabel}>{t.status.discrepancy}:</Text>
                <Text style={[styles.discrepancyValue, { color: telemetry.sensor_discrepancy_cm > 2.0 ? '#DC2626' : '#16A34A' }]}>
                  {telemetry.sensor_discrepancy_cm} cm {telemetry.sensor_discrepancy_cm <= 2.0 ? '✓ (Synchronized)' : '⚠️ (High Error)'}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>{t.status.autoencoderMse}:</Text>
                <Text style={styles.metricValueText}>{telemetry.autoencoder_mse} (Threshold: {telemetry.autoencoder_threshold})</Text>
              </View>
            </View>

            {/* Environmental Compensation */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Acoustic Environmental Compensation</Text>
              <View style={styles.envGrid}>
                <View style={styles.envItem}>
                  <Text style={styles.envLabel}>{t.telemetry.temperature}</Text>
                  <Text style={styles.envValue}>{telemetry.temperature_c}°C</Text>
                </View>
                <View style={styles.envItem}>
                  <Text style={styles.envLabel}>{t.telemetry.humidity}</Text>
                  <Text style={styles.envValue}>{telemetry.humidity_pct}%</Text>
                </View>
                <View style={styles.envItem}>
                  <Text style={styles.envLabel}>{t.telemetry.soundSpeed}</Text>
                  <Text style={styles.envValue}>{telemetry.sound_speed_mps} m/s</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: MANUAL GATE CONTROL */}
        {activeTab === 'GATE_CONTROL' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.gateControl.title}</Text>
              <Text style={styles.bodyText}>{t.gateControl.subtitle}</Text>

              <View style={styles.currentPositionBox}>
                <Text style={styles.currentPositionLabel}>{t.gateControl.currentAperture}:</Text>
                <Text style={styles.currentPositionValue}>{telemetry.current_gate_angle}° ({telemetry.current_gate_pct}%)</Text>
              </View>

              <Text style={styles.controlSectionHeader}>{t.gateControl.targetAngle}:</Text>
              <View style={styles.presetRow}>
                {[0, 27, 54, 90].map(angle => (
                  <TouchableOpacity
                    key={angle}
                    style={[styles.presetBtn, targetOverrideAngle === angle && styles.presetBtnActive]}
                    onPress={() => setTargetOverrideAngle(angle)}
                  >
                    <Text style={[styles.presetBtnText, targetOverrideAngle === angle && styles.presetBtnTextActive]}>
                      {angle === 0 ? t.gateControl.closed0 : angle === 27 ? t.gateControl.stage27 : angle === 54 ? t.gateControl.stage54 : t.gateControl.full90}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sliderLabel}>Fine Tuning: {targetOverrideAngle}°</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTargetOverrideAngle(prev => Math.max(0, prev - 5))}
                >
                  <Text style={styles.stepperBtnText}>- 5°</Text>
                </TouchableOpacity>

                <View style={styles.angleDisplayBox}>
                  <Text style={styles.angleDisplayText}>{targetOverrideAngle}°</Text>
                </View>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTargetOverrideAngle(prev => Math.min(90, prev + 5))}
                >
                  <Text style={styles.stepperBtnText}>+ 5°</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setOverrideModalVisible(true)}
              >
                <Text style={styles.applyBtnText}>{t.gateControl.applyOverride}</Text>
              </TouchableOpacity>

              {telemetry.is_manual_override && (
                <TouchableOpacity
                  style={styles.releaseBtn}
                  onPress={handleReleaseOverride}
                >
                  <Text style={styles.releaseBtnText}>{t.gateControl.releaseOverride}</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.miniWarning}>{t.gateControl.warningText}</Text>
            </View>
          </View>
        )}

        {/* TAB 3: EMERGENCY SMS DISPATCH & RECIPIENT MANAGEMENT */}
        {activeTab === 'SMS_DISPATCH' && (
          <View>
            {/* Critical Security Notice */}
            <View style={styles.noticeCard}>
              <Text style={styles.noticeCardText}>{t.smsDispatch.criticalNotice}</Text>
            </View>

            {/* Broadcast Triggers Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.smsDispatch.title}</Text>
              <Text style={styles.bodyText}>{t.smsDispatch.subtitle}</Text>

              <TouchableOpacity
                style={[styles.smsStageBtn, { borderColor: '#F59E0B' }]}
                onPress={() => { setSmsStageSelected('PRE_WARNING'); setSmsModalVisible(true); }}
              >
                <View>
                  <Text style={[styles.smsStageTitle, { color: '#D97706' }]}>{t.smsDispatch.stage1Btn}</Text>
                  <Text style={styles.smsStageSub}>{t.smsDispatch.stage1Sub}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smsStageBtn, { borderColor: '#F97316' }]}
                onPress={() => { setSmsStageSelected('CLEAR_AREA'); setSmsModalVisible(true); }}
              >
                <View>
                  <Text style={[styles.smsStageTitle, { color: '#EA580C' }]}>{t.smsDispatch.stage2Btn}</Text>
                  <Text style={styles.smsStageSub}>{t.smsDispatch.stage2Sub}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smsStageBtn, { borderColor: '#EF4444' }]}
                onPress={() => { setSmsStageSelected('DANGER'); setSmsModalVisible(true); }}
              >
                <View>
                  <Text style={[styles.smsStageTitle, { color: '#DC2626' }]}>{t.smsDispatch.stage3Btn}</Text>
                  <Text style={styles.smsStageSub}>{t.smsDispatch.stage3Sub}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Recipient Management Directory */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>{t.smsDispatch.directoryTitle}</Text>
                  <Text style={styles.directoryCountText}>
                    {t.smsDispatch.registeredCount}: {contacts.length}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addContactBtn}
                  onPress={() => setAddContactModalVisible(true)}
                >
                  <Text style={styles.addContactBtnText}>+ {t.smsDispatch.addBtn}</Text>
                </TouchableOpacity>
              </View>

              {contacts.length === 0 ? (
                <View style={styles.emptyContactsBox}>
                  <Text style={styles.emptyContactsText}>
                    No recipients registered. Please add phone numbers below so emergency alerts can be dispatched.
                  </Text>
                </View>
              ) : (
                contacts.map(c => (
                  <View key={c.id} style={styles.contactItemCard}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.contactHeaderRow}>
                        <Text style={styles.contactName}>{c.name}</Text>
                        <View style={styles.roleBadge}>
                          <Text style={styles.roleBadgeText}>{c.role}</Text>
                        </View>
                      </View>
                      <Text style={styles.contactPhone}>📱 {c.phone_number}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.removeContactBtn}
                      onPress={() => handleRemoveContact(c.id, c.name, c.phone_number)}
                    >
                      <Text style={styles.removeContactBtnText}>{t.smsDispatch.removeBtn}</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'AUDIT_LOGS' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.audit.title}</Text>
              <Text style={styles.bodyText}>{t.audit.subtitle}</Text>

              {auditLogs.map(log => (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logAction}>{log.action}</Text>
                    <Text style={styles.logTime}>{log.time}</Text>
                  </View>
                  <Text style={styles.logDetails}>{log.details}</Text>
                  <Text style={styles.logTrigger}>Source: {log.trigger}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ADD RECIPIENT MODAL */}
      <Modal visible={addContactModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.smsDispatch.addRecipientTitle}</Text>
            <Text style={styles.bodyText}>
              Broadcast SMS alerts will be transmitted exclusively to this recipient:
            </Text>

            <Text style={styles.inputLabel}>Full Name / Official Role</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.smsDispatch.namePlaceholder}
              value={newContactName}
              onChangeText={setNewContactName}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.smsDispatch.phonePlaceholder}
              keyboardType="phone-pad"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
            />

            <Text style={styles.inputLabel}>Department / Role</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.smsDispatch.rolePlaceholder}
              value={newContactRole}
              onChangeText={setNewContactRole}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAddContactModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>{t.smsDispatch.cancelBtn}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleAddContact}
              >
                <Text style={styles.modalConfirmText}>{t.smsDispatch.addBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OVERRIDE CONFIRMATION MODAL */}
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

      {/* SMS BROADCAST CONFIRMATION MODAL */}
      <Modal visible={smsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.smsDispatch.confirmBroadcastTitle}</Text>
            <Text style={styles.modalText}>
              Stage: <Text style={{ fontWeight: 'bold', color: '#DC2626' }}>{smsStageSelected}</Text>
            </Text>

            <Text style={styles.recipientIntroText}>
              {t.smsDispatch.confirmBroadcastIntro}
            </Text>

            {/* Recipient list preview in modal */}
            <ScrollView style={styles.modalRecipientList}>
              {contacts.length === 0 ? (
                <Text style={styles.emptyContactsText}>⚠️ No registered numbers! Please add recipients first.</Text>
              ) : (
                contacts.map(c => (
                  <View key={c.id} style={styles.modalRecipientItem}>
                    <Text style={styles.modalRecipientBullet}>✓</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalRecipientName}>{c.name} ({c.role})</Text>
                      <Text style={styles.modalRecipientPhone}>{c.phone_number}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <Text style={styles.modalWarning}>{t.smsDispatch.confirmBroadcastWarning}</Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSmsModalVisible(false)}>
                <Text style={styles.modalCancelText}>{t.smsDispatch.cancelBtn}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, contacts.length === 0 && { opacity: 0.5 }]}
                disabled={contacts.length === 0}
                onPress={handleDispatchSMS}
              >
                <Text style={styles.modalConfirmText}>{t.smsDispatch.confirmSendBtn}</Text>
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
  loginLangRow: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16
  },
  loginCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4
  },
  loginHeader: {
    fontSize: 20,
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
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F294A',
    marginBottom: 14
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F294A',
    marginBottom: 10
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0'
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold'
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#0F294A',
    fontSize: 13,
    fontWeight: 'bold'
  },
  credentialHintBox: {
    marginTop: 16,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 2
  },
  hintText: {
    fontSize: 11,
    color: '#3B82F6'
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
    fontSize: 15,
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
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 11,
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
  noticeCard: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14
  },
  noticeCardText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16
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
  directoryCountText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
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
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginTop: 4
  },
  metricSubTitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2
  },
  hugeMetric: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F294A'
  },
  metricHelper: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600'
  },
  bodyText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12
  },
  sensorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  sensorBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sensorLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  discrepancyBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  discrepancyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  discrepancyValue: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B'
  },
  metricValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F294A'
  },
  envGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  envItem: {
    flex: 1,
    alignItems: 'center'
  },
  envLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 2
  },
  envValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  currentPositionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14
  },
  currentPositionLabel: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600'
  },
  currentPositionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A'
  },
  controlSectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  presetBtn: {
    flex: 1,
    minWidth: (width - 70) / 2,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center'
  },
  presetBtnActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A'
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155'
  },
  presetBtnTextActive: {
    color: '#FFFFFF'
  },
  sliderLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center'
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16
  },
  stepperBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  stepperBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  angleDisplayBox: {
    backgroundColor: '#0F294A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  angleDisplayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  applyBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  releaseBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  releaseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold'
  },
  miniWarning: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4
  },
  smsStageBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF'
  },
  smsStageTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2
  },
  smsStageSub: {
    fontSize: 11,
    color: '#64748B'
  },
  addContactBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  addContactBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  emptyContactsBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  emptyContactsText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18
  },
  contactItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8
  },
  contactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2
  },
  contactName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  roleBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  roleBadgeText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '600'
  },
  contactPhone: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600'
  },
  removeContactBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  removeContactBtnText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: 'bold'
  },
  logItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#64748B',
    marginBottom: 8
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
    color: '#334155',
    lineHeight: 16
  },
  logTrigger: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%'
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
    marginBottom: 10
  },
  recipientIntroText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 6
  },
  modalRecipientList: {
    maxHeight: 140,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 12
  },
  modalRecipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  modalRecipientBullet: {
    color: '#16A34A',
    fontWeight: 'bold',
    fontSize: 14
  },
  modalRecipientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F294A'
  },
  modalRecipientPhone: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600'
  },
  modalWarning: {
    fontSize: 11,
    color: '#DC2626',
    marginBottom: 16,
    lineHeight: 16
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center'
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    alignItems: 'center'
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});
