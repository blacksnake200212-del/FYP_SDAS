-- ============================================================================
-- SMART DAM ALERT SYSTEM (SDAS) - SUPABASE POSTGRESQL SCHEMA
-- SLTC Research University | Faculty of Computing & IT | Final Year Project
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. SYSTEM CONFIGURATION & CALIBRATION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservoir_name VARCHAR(100) NOT NULL DEFAULT 'Puttalam Deduru Oya Reservoir Node 1',
    sensor_height_cm NUMERIC(6, 2) NOT NULL DEFAULT 100.00,
    max_water_level_cm NUMERIC(6, 2) NOT NULL DEFAULT 85.00,
    threshold_pre_warning_pct NUMERIC(4, 1) NOT NULL DEFAULT 70.0,
    threshold_clear_area_pct NUMERIC(4, 1) NOT NULL DEFAULT 78.0,
    threshold_danger_pct NUMERIC(4, 1) NOT NULL DEFAULT 85.0,
    hysteresis_pct NUMERIC(4, 1) NOT NULL DEFAULT 3.0,
    operator_override_active BOOLEAN NOT NULL DEFAULT FALSE,
    override_gate_angle INT NOT NULL DEFAULT 0 CHECK (override_gate_angle BETWEEN 0 AND 90),
    override_operator_id VARCHAR(100) DEFAULT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. SENSOR TELEMETRY READINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    water_level_cm NUMERIC(6, 2) NOT NULL,
    capacity_pct NUMERIC(5, 2) NOT NULL,
    sensor_1_cm NUMERIC(6, 2),
    sensor_2_cm NUMERIC(6, 2),
    temperature_c NUMERIC(5, 2),
    humidity_pct NUMERIC(5, 2),
    sound_speed_mps NUMERIC(6, 2),
    gate_angle_deg INT NOT NULL,
    gate_opening_pct NUMERIC(5, 2) NOT NULL,
    system_state VARCHAR(30) NOT NULL, -- 'NORMAL', 'PRE-WARNING', 'CLEAR-AREA', 'DANGER', 'SENSOR-FAULT'
    is_manual_override BOOLEAN NOT NULL DEFAULT FALSE,
    sensor_discrepancy BOOLEAN NOT NULL DEFAULT FALSE,
    is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    anomaly_score NUMERIC(7, 4) DEFAULT 0.0000,
    predicted_water_level_1hr NUMERIC(6, 2) DEFAULT NULL,
    predicted_capacity_1hr NUMERIC(5, 2) DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_created_at ON public.sensor_readings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_state ON public.sensor_readings (system_state);

-- ----------------------------------------------------------------------------
-- 3. GATE ACTUATION AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gate_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    previous_angle INT NOT NULL,
    new_angle INT NOT NULL,
    previous_pct NUMERIC(5, 2) NOT NULL,
    new_pct NUMERIC(5, 2) NOT NULL,
    trigger_source VARCHAR(30) NOT NULL, -- 'AUTO_HYSTERESIS', 'MANUAL_OVERRIDE', 'FAILSAFE'
    operator_id VARCHAR(100) DEFAULT 'SYSTEM_CONTROLLER',
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_gate_logs_created_at ON public.gate_logs (created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. ALARMS & EMERGENCY NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alarms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stage VARCHAR(30) NOT NULL, -- 'PRE_WARNING', 'CLEAR_AREA', 'DANGER', 'SENSOR_FAULT'
    water_level_cm NUMERIC(6, 2) NOT NULL,
    capacity_pct NUMERIC(5, 2) NOT NULL,
    sms_broadcast_status VARCHAR(20) NOT NULL DEFAULT 'SENT', -- 'PENDING', 'SENT', 'FAILED'
    sms_recipient_count INT DEFAULT 3,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(100) DEFAULT NULL,
    acknowledged_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_alarms_created_at ON public.alarms (created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. EMERGENCY CONTACTS DIRECTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(25) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'OPERATOR', 'DISASTER_OFFICE', 'POLICE', 'COMMUNITY_REP'
    department VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Public / Anonymous Users: Can read telemetry and active alarms (For Public App)
CREATE POLICY "Public Read Telemetry" ON public.sensor_readings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Alarms" ON public.alarms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read System Config" ON public.system_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Contacts" ON public.emergency_contacts FOR SELECT TO anon, authenticated USING (active = true);

-- Hardware Node (anon with key or service_role): Can insert sensor telemetry
CREATE POLICY "Node Insert Telemetry" ON public.sensor_readings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated Operators: Full Control
CREATE POLICY "Operator Manage Config" ON public.system_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Operator Gate Logs" ON public.gate_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Operator Manage Alarms" ON public.alarms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Operator Manage Contacts" ON public.emergency_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- AUTOMATED ALARM TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_process_sensor_alarm()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically record high severity alarms when thresholds are crossed
    IF NEW.capacity_pct >= 70.0 AND (
        SELECT COUNT(*) FROM public.alarms 
        WHERE stage = CASE 
            WHEN NEW.capacity_pct >= 85.0 THEN 'DANGER'
            WHEN NEW.capacity_pct >= 78.0 THEN 'CLEAR_AREA'
            ELSE 'PRE_WARNING'
        END AND created_at > NOW() - INTERVAL '5 minutes'
    ) = 0 THEN
        INSERT INTO public.alarms (stage, water_level_cm, capacity_pct, sms_broadcast_status)
        VALUES (
            CASE 
                WHEN NEW.capacity_pct >= 85.0 THEN 'DANGER'
                WHEN NEW.capacity_pct >= 78.0 THEN 'CLEAR_AREA'
                ELSE 'PRE_WARNING'
            END,
            NEW.water_level_cm,
            NEW.capacity_pct,
            'SENT'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_sensor_alarm ON public.sensor_readings;
CREATE TRIGGER trg_process_sensor_alarm
AFTER INSERT ON public.sensor_readings
FOR EACH ROW EXECUTE FUNCTION public.fn_process_sensor_alarm();
