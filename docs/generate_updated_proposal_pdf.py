"""
Script to generate the updated academic proposal PDF for Smart Dam Alert System (SDAS)
Incorporating real hardware from circuit schematic:
- MG996R Servo Motor
- Dual JSN-SR04T Waterproof Ultrasonic Sensors (with HC-SR04 prototyping support)
- DHT22 Acoustic Temperature Compensation
- Dual XL4015 Buck Converters (5V and 4V isolated rails)
- Embedded Circuit Schematic Diagram
- Staged Warning Protocol with 3% Hysteresis
- Advisory ML Pipeline on Cloud/Edge Server
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#4A5568"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Smart Dam Alert System (SDAS) - Research Proposal & System Specification")
            self.setStrokeColor(colors.HexColor("#CBD5E0"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)
        
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.drawString(54, 36, "SLTC Research University | Faculty of Computing & IT | Final Year Project")
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.5)
        self.line(54, 46, 558, 46)
        self.restoreState()

def build_pdf(output_path, schematic_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=21,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0F172A')
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1E3A8A')
    )

    authors_style = ParagraphStyle(
        'Authors',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1F2937')
    )

    inst_style = ParagraphStyle(
        'Institution',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#4B5563')
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor('#0F294A'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor('#1F2937'),
        leftIndent=12,
        spaceAfter=2
    )

    caption_style = ParagraphStyle(
        'Caption',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10.5,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#4B5563'),
        spaceBefore=3,
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        alignment=TA_CENTER,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1F2937')
    )

    table_cell_left = ParagraphStyle(
        'TableCellLeft',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        alignment=TA_LEFT,
        textColor=colors.HexColor('#1F2937')
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("Smart Dam Alert System with Automated Gate Control", title_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Revised System Proposal & Hardware Implementation Specification", subtitle_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph(
        "<b>Dias Adrian</b> (Cyber Security) &nbsp;|&nbsp; <b>AAA Aadhil</b> (Data Science) &nbsp;|&nbsp; <b>JMRA Dilshan</b> (Software Engineering)",
        authors_style
    ))
    story.append(Paragraph(
        "Supervisor: <b>Dr. Sanika Wijayasekara</b> (Data Science & Cyber Security) &nbsp;|&nbsp; Co-supervisor: <b>Mr. Kavinda Tharindu</b> (Data Science)",
        authors_style
    ))
    story.append(Paragraph(
        "Faculty of Computing and IT, SLTC Research University, Ingiriya Road, Meepe, Sri Lanka",
        inst_style
    ))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#0F294A'), spaceAfter=8))

    # 1. Introduction
    story.append(Paragraph("1. Introduction", h1_style))
    story.append(Paragraph(
        "Floods in the Puttalam region of Sri Lanka occur with catastrophic regularity due to the lack of automation in regional dam monitoring and spillway regulation. Manually dispatched gate operations currently incur response delays exceeding 30 to 45 minutes during rapid inflow surges, resulting in widespread agricultural destruction, loss of property, and fatal human casualties. The Smart Dam Alert System (SDAS) solves this vulnerability by engineering a fully integrated, low-latency (<2.0s), dual-redundant IoT hardware prototype coupled with a cloud backend (Supabase), cloud-hosted machine learning inference (TensorFlow LSTM and Autoencoder), multi-stage GSM SMS broadcasts, and two React Native mobile applications (Public and Operator).",
        body_style
    ))

    # 1.1 Summary of Literature
    story.append(Paragraph("1.1 Summary of Literature", h2_style))
    story.append(Paragraph(
        "<b>Weerasinghe et al. [1]</b> formulated functional criteria for Early Warning Systems (EWS) to minimize dam breach probabilities in Sri Lanka, emphasizing hydrological risk profiling but omitting an automated physical actuator and sensor prototype. <b>Sasikala et al. [2]</b> demonstrated an IoT water-monitoring framework using ultrasonic sensing for reservoir acquisition, but lacked automated gate control, hardware-level sensor redundancy, and staged community warnings. <b>Nirmal and Shekapure [3]</b> investigated AI algorithms for dam flood management, yet their framework lacked multi-tier public alerting and localized offline fail-safe execution.",
        body_style
    ))

    # 1.2 Research Gap & Problem Definition
    story.append(Paragraph("1.2 Research Gap & 1.3 Problem Definition", h2_style))
    story.append(Paragraph(
        "Existing solutions suffer from critical voids: (a) systems monitor water levels but defer gate regulation to delayed manual intervention; (b) automated gates dispatch generic SMS without localized tiered warnings or dual mobile applications; (c) cloud ML architectures lack local edge fallback, risking dam safety when communication fails. SDAS directly bridges these gaps through: (i) dual-redundant waterproof ultrasonic sensing with real-time temperature compensation; (ii) local autonomous gate regulation (<2s latency) via high-torque servo actuation with 3% hysteresis; (iii) cloud-connected advisory ML for 1-hour ahead water level prediction and sensor anomaly detection; (iv) an autonomous 3-stage emergency warning system (Buzzer, RGB LED, SIM800L SMS); and (v) twin mobile interfaces tailored for citizens (login-free) and dam operators (authenticated).",
        body_style
    ))

    # 1.4 Research Questions & 2. Project Goal
    story.append(Paragraph("1.4 Research Questions & 2. Goal of the Project", h2_style))
    story.append(Paragraph(
        "This project investigates: (1) How can dual waterproof ultrasonic sensors with acoustic temperature compensation achieve resilient ±2.0 cm water level precision? (2) What autonomous state machine ensures safe, oscillation-free gate regulation while supporting instantaneous operator override? (3) Can staged SMS and audible alerts notify emergency responders within <10 seconds? (4) How effectively can cloud-hosted LSTM and Autoencoder models deliver advisory flood forecasts (MAPE < 5%) and flag sensor failures? (5) How can two distinct mobile applications serve both community awareness and authenticated operator control?",
        body_style
    ))

    # 3. Aims and Objectives
    story.append(Paragraph("3. Aims and Objectives", h1_style))
    story.append(Paragraph("• <b>Hardware Prototype:</b> Fabricate a robust physical prototype with ESP32 DevKit V1, dual JSN-SR04T waterproof ultrasonic sensors, DHT22 sensor, MG996R metal-gear servo actuator, SIM800L GSM, RGB LED, active buzzer, and dual XL4015 buck converters.", bullet_style))
    story.append(Paragraph("• <b>Resilient Firmware:</b> Implement C/C++ firmware executing deterministic local decision-making (<2s response time) with a 3% hysteresis band, operational even during complete network or cloud outages.", bullet_style))
    story.append(Paragraph("• <b>Advisory Cloud Machine Learning:</b> Deploy an LSTM model for 1-hour ahead water level forecasting (MAPE < 5%) and an Autoencoder for sensor anomaly detection running on a cloud inference server, providing decision support without compromising local gate safety.", bullet_style))
    story.append(Paragraph("• <b>Staged Multi-Tier Warning:</b> Dispatch coordinated audible, visual, and SIM800L GSM SMS notifications across Normal, Pre-Warning, Clear-Area, and Danger stages.", bullet_style))
    story.append(Paragraph("• <b>Dual Mobile Apps:</b> Develop two React Native (Expo) applications: a Public App for login-free community alerts and an Operator App for authenticated monitoring and remote gate override.", bullet_style))

    # 4. Revised Hardware Implementation & Power Architecture
    story.append(Paragraph("4. System Hardware Architecture & Power Engineering", h1_style))
    story.append(Paragraph(
        "To elevate the prototype from basic hobby components to industrial-grade reliability, key hardware selections were revised from the preliminary draft. Gate actuation utilizes the <b>MG996R Metal-Gear High-Torque Servo Motor</b> (controlled via ESP32 PWM on GPIO25) rather than an on/off DC motor and relay, enabling precise continuous aperture regulation (0% to 100%). Water level detection employs <b>dual JSN-SR04T waterproof ultrasonic sensors</b> with an <b>ML2029 4-channel bi-directional logic level converter</b>, delivering IP67 environmental resilience and dual-sensor fault cross-validation (while maintaining software compatibility with HC-SR04 sensors for bench testing). A <b>DHT22 temperature sensor</b> dynamically compensates for variations in the acoustic speed of sound: <i>v = 331.3 + (0.606 × T) m/s</i>.",
        body_style
    ))

    # Circuit Diagram Image
    if os.path.exists(schematic_path):
        story.append(Spacer(1, 4))
        img = Image(schematic_path, width=490, height=275)
        story.append(img)
        story.append(Paragraph("<b>Figure 1:</b> SDAS Complete Hardware Wiring Schematic, Pin Assignments, and Dual-Rail Power Distribution Network.", caption_style))
        story.append(Spacer(1, 4))

    # Power architecture description
    story.append(Paragraph(
        "<b>Power Distribution Network:</b> Operating the ESP32, MG996R servo, and SIM800L module from a single unregulated rail causes severe voltage sags and microcontroller brownouts due to servo stall currents (>1.5A) and SIM800L 2G transmission bursts (up to 2A at 217 Hz). As shown in Figure 1, the design implements an isolated dual-rail power topology powered by a 12V 3A DC supply with a 1000 µF 25V input filter (C1):<br/>"
        "• <b>Buck Converter #1 (XL4015, 12V to 5V, 1000 µF C2):</b> Supplies 5V for the MG996R servo, ESP32 VIN, Level Converter HV, 5V active buzzer, and JSN-SR04T sensors.<br/>"
        "• <b>Buck Converter #2 (XL4015, 12V to 4V, 1000 µF C3):</b> Dedicated 4.0V rail specifically sized for the SIM800L module's stringent 3.7V–4.2V operating window and high pulse currents.<br/>"
        "• <b>Common Ground:</b> All ground returns are unified to eliminate ground loops and reference float.",
        body_style
    ))

    # Pin Assignment Table & Warning Matrix Table
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Table 1:</b> ESP32 DevKit V1 Hardware Pin Assignment", h2_style))

    pin_data = [
        [Paragraph("<b>Peripheral / Signal</b>", table_header_style), Paragraph("<b>ESP32 Pin</b>", table_header_style), Paragraph("<b>Voltage / Logic</b>", table_header_style), Paragraph("<b>Function / Notes</b>", table_header_style)],
        [Paragraph("JSN-SR04T Sensor 1 (TRIG)", table_cell_left), Paragraph("GPIO5", table_cell_style), Paragraph("3.3V LV (5V HV)", table_cell_style), Paragraph("Level converter Ch 1; 10 µs trigger pulse", table_cell_left)],
        [Paragraph("JSN-SR04T Sensor 1 (ECHO)", table_cell_left), Paragraph("GPIO19", table_cell_style), Paragraph("3.3V LV (5V HV)", table_cell_style), Paragraph("Level converter Ch 2; pulse width capture", table_cell_left)],
        [Paragraph("JSN-SR04T Sensor 2 (TRIG)", table_cell_left), Paragraph("GPIO18", table_cell_style), Paragraph("3.3V LV (5V HV)", table_cell_style), Paragraph("Level converter Ch 3; redundant trigger", table_cell_left)],
        [Paragraph("JSN-SR04T Sensor 2 (ECHO)", table_cell_left), Paragraph("GPIO21", table_cell_style), Paragraph("3.3V LV (5V HV)", table_cell_style), Paragraph("Level converter Ch 4; redundant echo capture", table_cell_left)],
        [Paragraph("DHT22 Temp & Humidity", table_cell_left), Paragraph("GPIO4", table_cell_style), Paragraph("3.3V", table_cell_style), Paragraph("10kΩ pull-up to 3.3V; acoustic temp compensation", table_cell_left)],
        [Paragraph("MG996R Servo (PWM Signal)", table_cell_left), Paragraph("GPIO25", table_cell_style), Paragraph("3.3V PWM (5V VCC)", table_cell_style), Paragraph("LEDC PWM 50Hz; gate angle regulation (0°-90°)", table_cell_left)],
        [Paragraph("5V Active Buzzer", table_cell_left), Paragraph("GPIO27", table_cell_style), Paragraph("3.3V GPIO", table_cell_style), Paragraph("Active buzzer via 1N4007 flyback protection", table_cell_left)],
        [Paragraph("RGB LED (Red Cathode)", table_cell_left), Paragraph("GPIO32", table_cell_style), Paragraph("3.3V (Active LOW)", table_cell_style), Paragraph("220Ω series resistor; Common Anode VCC = 3.3V", table_cell_left)],
        [Paragraph("RGB LED (Green Cathode)", table_cell_left), Paragraph("GPIO33", table_cell_style), Paragraph("3.3V (Active LOW)", table_cell_style), Paragraph("220Ω series resistor; Common Anode VCC = 3.3V", table_cell_left)],
        [Paragraph("RGB LED (Blue Cathode)", table_cell_left), Paragraph("GPIO13", table_cell_style), Paragraph("3.3V (Active LOW)", table_cell_style), Paragraph("220Ω series resistor; Common Anode VCC = 3.3V", table_cell_left)],
        [Paragraph("SIM800L GSM (TX / RX)", table_cell_left), Paragraph("GPIO17 / 16", table_cell_style), Paragraph("3.3V UART2", table_cell_style), Paragraph("HardwareSerial2 (16=TX2 to RXD, 17=RX2 to TXD)", table_cell_left)],
    ]

    pin_table = Table(pin_data, colWidths=[130, 65, 85, 230])
    pin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F294A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(pin_table)
    story.append(Spacer(1, 6))

    # Staged Warning Protocol Table
    story.append(Paragraph("<b>Table 2:</b> Staged Warning Protocol and Gate Actuation Logic (with 3% Hysteresis)", h2_style))
    stage_data = [
        [Paragraph("<b>Status</b>", table_header_style), Paragraph("<b>Reservoir Capacity</b>", table_header_style), Paragraph("<b>MG996R Gate</b>", table_header_style), Paragraph("<b>RGB LED</b>", table_header_style), Paragraph("<b>Buzzer</b>", table_header_style), Paragraph("<b>SMS Alert Broadcast</b>", table_header_style)],
        [Paragraph("<b>NORMAL</b>", table_cell_left), Paragraph("&lt; 70%", table_cell_style), Paragraph("Closed (0% / 0°)", table_cell_style), Paragraph("Green", table_cell_style), Paragraph("OFF", table_cell_style), Paragraph("No SMS; continuous background logging", table_cell_left)],
        [Paragraph("<b>PRE-WARNING</b>", table_cell_left), Paragraph("70% - 85% (rising)", table_cell_style), Paragraph("Opening 20% - 30% (27°)", table_cell_style), Paragraph("Yellow (R+G)", table_cell_style), Paragraph("Periodic chirp", table_cell_style), Paragraph("Pre-warning SMS to all registered contacts", table_cell_left)],
        [Paragraph("<b>CLEAR-AREA</b>", table_cell_left), Paragraph("70% - 85% (rapid surge)", table_cell_style), Paragraph("Progressive 30% - 70% (54°)", table_cell_style), Paragraph("Orange", table_cell_style), Paragraph("Pulsed beep", table_cell_style), Paragraph("'Clear Downstream Area' SMS broadcast", table_cell_left)],
        [Paragraph("<b>DANGER</b>", table_cell_left), Paragraph("&gt; 85% capacity", table_cell_style), Paragraph("Full Open 100% (90°)", table_cell_style), Paragraph("Red", table_cell_style), Paragraph("Continuous siren", table_cell_style), Paragraph("Emergency SMS to operators, police & public", table_cell_left)],
    ]
    stage_table = Table(stage_data, colWidths=[75, 80, 95, 60, 60, 140])
    stage_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F294A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(stage_table)
    story.append(Spacer(1, 6))

    # 5. Proposed Methodology & ML Pipeline
    story.append(Paragraph("5. Proposed Methodology & Machine Learning Architecture", h1_style))
    story.append(Paragraph(
        "The system coordinates five core architectural layers:<br/>"
        "1. <b>Embedded Edge Node:</b> ESP32 firmware executes non-blocking acquisition of dual JSN-SR04T sensors, median filters raw samples, applies temperature compensation, calculates capacity, and enforces the 3% hysteresis state machine (<2s cycle). An offline fail-safe ensures complete operational autonomy if cloud or network links fail.<br/>"
        "2. <b>Cloud Backend (Supabase):</b> Serves as the central real-time PostgreSQL database hosting tables for <i>sensor_readings</i>, <i>gate_logs</i>, <i>alarms</i>, and <i>emergency_contacts</i>. Row Level Security (RLS) protects operator command endpoints while enabling public read access.<br/>"
        "3. <b>Advisory Machine Learning Engine:</b> Due to hardware constraints on microcontrollers, the ML models run on a cloud/edge FastAPI inference server connected via webhooks. The <b>LSTM neural network</b> ingests a 24-step sequence of past water levels, temperature, and rate-of-rise to forecast water level 1 hour ahead (MAPE < 5%). The <b>Deep Autoencoder</b> reconstructs multi-sensor readings; if Mean Squared Error (MSE) exceeds a statistical threshold, a sensor anomaly/drift alert is flagged within <5 seconds. Crucially, ML outputs serve as <i>advisory decision support</i> for operators rather than unconstrained physical triggers.<br/>"
        "4. <b>Mobile Applications (React Native Expo):</b> The <b>Public App</b> provides zero-login real-time dam capacity visualization, staged hazard color banners, 1-hour ML predictions, and Puttalam evacuation maps. The <b>Operator App</b> requires Supabase Auth and provides live dual-sensor telemetry, manual gate override controls (0% to 100%), emergency SMS dispatch triggers, and alarm audit logs.<br/>"
        "5. <b>Physical Prototype Testing:</b> Validated on a scaled reservoir rig evaluating sensor accuracy (±2.0 cm), gate cycle durability (100+ cycles), and SMS dispatch latency (<10s).",
        body_style
    ))

    # 6. Resource Requirements, Ethics, and Risk Assessment
    story.append(Paragraph("6. Resource Requirements, Ethics, and Risk Management", h1_style))
    story.append(Paragraph(
        "<b>Hardware:</b> ESP32 DevKit V1, Dual JSN-SR04T waterproof ultrasonic sensors, DHT22 sensor, MG996R servo motor, SIM800L GSM, dual XL4015 buck converters, 12V 3A adapter, common anode RGB LED, 5V active buzzer, 1000 µF filter capacitors, ML2029 logic level converter.<br/>"
        "<b>Software:</b> Arduino C/C++ IDE, Python 3.12, TensorFlow / Keras, FastAPI, Supabase Cloud (PostgreSQL, Auth), React Native with Expo SDK.<br/>"
        "<b>Ethics & Safety:</b> Only synthetic and historical hydrological data from the Puttalam district (2017–2023) is used; no personal surveillance data is collected. Emergency contact numbers are securely encrypted. Hard-coded physical threshold limits and manual operator overrides prevent software faults from causing hazardous gate movements.",
        body_style
    ))

    # 7. References
    story.append(Paragraph("7. References", h1_style))
    refs = [
        "[1] L. N. K. Weerasinghe, M. Thayaparan, and T. Fernando, 'Functional Characteristics of an EWS to Minimise the Risk of Dam Breaks in Sri Lanka,' in <i>Proc. 10th World Construction Symposium</i>, Jun. 2022, pp. 507-517.",
        "[2] G. Sasikala, S. Srinivasan, J. Navarajan, and M. M. Theresa, 'IoT based Water Level Monitoring and Management in Reservoir,' in <i>Proc. 2022 3rd Int. Conf. on Electronics and Sustainable Communication Systems (ICESC)</i>, Coimbatore, India, 2022, pp. 1763-1767.",
        "[3] B. Nirmal and S. Shekapure, 'AI-Driven Smart Dam Management System for Enhanced Safety and Flood Prevention,' <i>Journal of Mines, Metals and Fuels</i>, vol. 73, no. 7, 2025, pp. 2137-2145.",
        "[4] Espressif Systems, 'ESP32 Series Datasheet and Hardware Design Guidelines,' Espressif Inc., 2025.",
        "[5] Supabase, 'Supabase Architecture and PostgreSQL Row Level Security Documentation,' 2026. [Online]. Available: https://supabase.com/docs.",
        "[6] Meta Platforms, 'React Native and Expo Cross-Platform Framework Documentation,' 2026. [Online]. Available: https://docs.expo.dev."
    ]
    for ref in refs:
        story.append(Paragraph(ref, bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated updated proposal PDF at: {output_path}")

if __name__ == '__main__':
    out_pdf = "f:/FYP SDAS/docs/SDAS_Updated_Proposal.pdf"
    schematic = "f:/FYP SDAS/hardware_schematic/circuit_schematic.png"
    build_pdf(out_pdf, schematic)
