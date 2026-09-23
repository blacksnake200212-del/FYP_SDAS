-- ============================================================================
-- SMART DAM ALERT SYSTEM (SDAS) - SEED DATA FOR PUTTALAM DISTRICT NODE
-- ============================================================================

-- 1. Initial System Configuration
INSERT INTO public.system_config (
    reservoir_name,
    sensor_height_cm,
    max_water_level_cm,
    threshold_pre_warning_pct,
    threshold_clear_area_pct,
    threshold_danger_pct,
    hysteresis_pct,
    operator_override_active,
    override_gate_angle
) VALUES (
    'Puttalam Deduru Oya Reservoir — Spillway 01',
    100.00,
    85.00,
    70.0,
    78.0,
    85.0,
    3.0,
    FALSE,
    0
);

-- 2. Emergency Contact Directory (Puttalam District)
INSERT INTO public.emergency_contacts (name, phone_number, role, department, active) VALUES
('Puttalam District Disaster Management Centre (DMC)', '+94322265243', 'DISASTER_OFFICE', 'Ministry of Disaster Management', true),
('Deduru Oya Reservoir Chief Irrigation Engineer', '+94771234567', 'OPERATOR', 'Department of Irrigation, Sri Lanka', true),
('Puttalam HQ Police Station Emergency Dispatch', '+94322222222', 'POLICE', 'Sri Lanka Police Service', true),
('Chilaw Riverine Community Flood Ward', '+94719876543', 'COMMUNITY_REP', 'Puttalam District Community Council', true),
('National Disaster Relief Services Centre (NDRSC)', '+94112670002', 'DISASTER_OFFICE', 'Disaster Relief Ministry', true);

-- 3. Realistic Recent Sensor Telemetry Readings
INSERT INTO public.sensor_readings (
    created_at,
    water_level_cm,
    capacity_pct,
    sensor_1_cm,
    sensor_2_cm,
    temperature_c,
    humidity_pct,
    sound_speed_mps,
    gate_angle_deg,
    gate_opening_pct,
    system_state,
    is_manual_override,
    sensor_discrepancy,
    is_anomaly,
    anomaly_score,
    predicted_water_level_1hr,
    predicted_capacity_1hr
) VALUES
(NOW() - INTERVAL '40 minutes', 54.20, 63.76, 45.8, 45.9, 28.4, 78.2, 348.51, 0, 0.0, 'NORMAL', false, false, false, 0.008, 56.10, 66.00),
(NOW() - INTERVAL '30 minutes', 57.80, 68.00, 42.2, 42.1, 28.5, 79.0, 348.57, 0, 0.0, 'NORMAL', false, false, false, 0.012, 60.50, 71.18),
(NOW() - INTERVAL '20 minutes', 60.35, 71.00, 39.7, 39.6, 28.6, 80.5, 348.63, 27, 30.0, 'PRE-WARNING', false, false, false, 0.015, 63.80, 75.06),
(NOW() - INTERVAL '10 minutes', 63.40, 74.59, 36.6, 36.5, 28.5, 82.0, 348.57, 27, 30.0, 'PRE-WARNING', false, false, false, 0.011, 67.20, 79.06),
(NOW() - INTERVAL '2 minutes', 67.50, 79.41, 32.5, 32.6, 28.4, 84.1, 348.51, 54, 60.0, 'CLEAR-AREA', false, false, false, 0.009, 72.40, 85.18);

-- 4. Initial Gate Audit History
INSERT INTO public.gate_logs (created_at, previous_angle, new_angle, previous_pct, new_pct, trigger_source, operator_id, notes) VALUES
(NOW() - INTERVAL '20 minutes', 0, 27, 0.0, 30.0, 'AUTO_HYSTERESIS', 'SYSTEM_CONTROLLER', 'Water capacity crossed 70.0% threshold (rising). Pre-warning staged opening.'),
(NOW() - INTERVAL '2 minutes', 27, 54, 30.0, 60.0, 'AUTO_HYSTERESIS', 'SYSTEM_CONTROLLER', 'Water capacity crossed 78.0% threshold (rapid inflow). Clear-area progressive discharge.');

-- 5. Staged Alarms
INSERT INTO public.alarms (created_at, stage, water_level_cm, capacity_pct, sms_broadcast_status, sms_recipient_count) VALUES
(NOW() - INTERVAL '20 minutes', 'PRE_WARNING', 60.35, 71.00, 'SENT', 3),
(NOW() - INTERVAL '2 minutes', 'CLEAR_AREA', 67.50, 79.41, 'SENT', 3);
