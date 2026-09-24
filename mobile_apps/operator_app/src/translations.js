// SDAS Operator App Trilingual Translations (English, Sinhala, Tamil)
export const TRANSLATIONS = {
  en: {
    appTitle: 'SDAS OPERATOR PORTAL',
    appSubtitle: 'Engineering & Gate Actuation Interface • Puttalam',
    langName: 'English',
    tabs: {
      telemetry: 'Telemetry',
      gateControl: 'Gate Control',
      smsDispatch: 'SMS Dispatch',
      auditLogs: 'Audit Log'
    },
    status: {
      systemState: 'SYSTEM STATE',
      gateAperture: 'Gate Aperture',
      sensorHealth: 'Sensor Health',
      healthy: 'HEALTHY',
      fault: 'SENSOR FAULT',
      autoencoderMse: 'Autoencoder MSE',
      discrepancy: 'Sensor Discrepancy',
      manualActive: 'MANUAL OVERRIDE ACTIVE',
      autoActive: 'AUTONOMOUS 3% HYSTERESIS ACTIVE'
    },
    telemetry: {
      reservoirCapacity: 'Reservoir Capacity',
      waterLevel: 'Reservoir Level',
      sensor1: 'Ultrasonic S1 (JSN-SR04T)',
      sensor2: 'Ultrasonic S2 (JSN-SR04T)',
      temperature: 'Ambient Temp (DHT22)',
      humidity: 'Relative Humidity',
      soundSpeed: 'Compensated Sound Speed'
    },
    gateControl: {
      title: 'Manual Gate Actuation (MG996R)',
      subtitle: 'PWM aperture control with safety interlocks (0° to 90°)',
      currentAperture: 'Current Gate Aperture',
      targetAngle: 'Target Override Angle',
      applyOverride: 'Apply Manual Override',
      releaseOverride: 'Release Override (Return to Auto)',
      closed0: '0° (Closed)',
      stage27: '27° (30%)',
      stage54: '54° (60%)',
      full90: '90° (100%)',
      warningText: '⚠️ Manual override suspends autonomous 3% hysteresis safety adjustments until released.'
    },
    smsDispatch: {
      title: 'SIM800L Cellular Broadcast Station',
      subtitle: 'Transmit staged emergency SMS alerts exclusively to verified registered numbers.',
      criticalNotice: '⚠️ Emergency SMS alerts will ONLY be sent to the verified registered numbers below.',
      stage1Btn: '1. Broadcast PRE-WARNING SMS',
      stage1Sub: 'Alerts local irrigation staff & DMC of approaching 70% threshold.',
      stage2Btn: '2. Broadcast CLEAR AREA SMS',
      stage2Sub: 'Orders immediate evacuation of downstream river channels.',
      stage3Btn: '3. Broadcast EMERGENCY DANGER SMS',
      stage3Sub: 'Urgent civil alert: 100% full spillway discharge initiated.',
      directoryTitle: 'Registered Recipient Directory',
      registeredCount: 'Verified Recipients',
      addRecipientTitle: 'Add Authorized Recipient Number',
      namePlaceholder: 'Full Name / Official Title',
      phonePlaceholder: 'Phone Number (e.g. +94 77 123 4567)',
      rolePlaceholder: 'Role (e.g. Irrigation Engineer, Police, DMC)',
      addBtn: 'Register Number',
      removeBtn: 'Remove',
      confirmRemoveTitle: 'Remove Recipient Number',
      confirmRemoveMsg: 'Are you sure you want to remove this phone number? They will no longer receive emergency dam broadcasts.',
      confirmRemoveBtn: 'Remove Number',
      cancelBtn: 'Cancel',
      confirmBroadcastTitle: 'Confirm Emergency SMS Broadcast',
      confirmBroadcastIntro: 'You are about to transmit an emergency SMS alert to ONLY the following verified numbers:',
      confirmBroadcastWarning: '⚠️ This will initiate live cellular SMS transmissions via the SIM800L module.',
      confirmSendBtn: 'Confirm & Send Broadcast'
    },
    audit: {
      title: 'System Gate & Safety Audit Trail',
      subtitle: 'Immutable chronological record of gate actuations and telemetry events:'
    }
  },

  si: {
    appTitle: 'SDAS ක්‍රියාකරු පාලක පුවරුව',
    appSubtitle: 'ඉංජිනේරු සහ දොරටු ක්‍රියාකාරී පද්ධතිය • පුත්තලම',
    langName: 'සිංහල',
    tabs: {
      telemetry: 'ටෙලිමෙට්‍රි',
      gateControl: 'දොරටු පාලනය',
      smsDispatch: 'SMS පණිවිඩ',
      auditLogs: 'වාර්තා සටහන'
    },
    status: {
      systemState: 'පද්ධති තත්ත්වය',
      gateAperture: 'දොරටු විවෘත කිරීම',
      sensorHealth: 'සංවේදක තත්ත්වය',
      healthy: 'ක්‍රියාකාරීයි (නිරෝගී)',
      fault: 'සංවේදක දෝෂයකි',
      autoencoderMse: 'ඔටෝඑන්කෝඩර් MSE',
      discrepancy: 'සංවේදක පරතරය',
      manualActive: 'අතින් ක්‍රියාත්මක කිරීම සක්‍රීයයි',
      autoActive: 'ස්වයංක්‍රීය 3% ආරක්ෂණ ක්‍රමය ක්‍රියාත්මකයි'
    },
    telemetry: {
      reservoirCapacity: 'ජලාශ ධාරිතාව',
      waterLevel: 'ජල මට්ටම',
      sensor1: 'අතිධ්වනි සංවේදකය S1 (JSN-SR04T)',
      sensor2: 'අතිධ්වනි සංවේදකය S2 (JSN-SR04T)',
      temperature: 'පරිසර උෂ්ණත්වය (DHT22)',
      humidity: 'සාපේක්ෂ ආර්ද්‍රතාව',
      soundSpeed: 'සංශෝධිත ධ්වනි වේගය'
    },
    gateControl: {
      title: 'අතින් දොරටු පාලනය (MG996R)',
      subtitle: 'ආරක්ෂිත PWM දොරටු විවෘත කිරීමේ පාලනය (0° සිට 90° දක්වා)',
      currentAperture: 'වත්මන් දොරටු විවෘත කිරීම',
      targetAngle: 'අපේක්ෂිත විවෘත කෝණය',
      applyOverride: 'අතින් විවෘත කිරීම ක්‍රියාත්මක කරන්න',
      releaseOverride: 'ස්වයංක්‍රීය පාලනයට ආපසු යන්න',
      closed0: '0° (වසා ඇත)',
      stage27: '27° (30%)',
      stage54: '54° (60%)',
      full90: '90° (100%)',
      warningText: '⚠️ අතින් ක්‍රියාත්මක කිරීමේදී ස්වයංක්‍රීය 3% ආරක්ෂණ ක්‍රියාවලිය තාවකාලිකව අත්හිටුවනු ලැබේ.'
    },
    smsDispatch: {
      title: 'SIM800L සෙලියුලර් විකාශන ස්ථානය',
      subtitle: 'හදිසි SMS පණිවිඩ යවනු ලබන්නේ මෙහි ලියාපදිංචි කර ඇති දුරකථන අංක වෙත පමණි.',
      criticalNotice: '⚠️ හදිසි SMS අනතුරු ඇඟවීම් යවනු ලබන්නේ පහත ලියාපදිංචි අංක වෙත පමණි.',
      stage1Btn: '1. පූර්ව අනතුරු ඇඟවීමේ SMS යවන්න',
      stage1Sub: '70% සීමාව කරා ළඟාවීම පිළිබඳව වාරිමාර්ග නිලධාරීන් සහ DMC දැනුවත් කරයි.',
      stage2Btn: '2. ප්‍රදේශයෙන් ඉවත් වීමේ SMS යවන්න',
      stage2Sub: 'ගංගා පහළ නිම්න ප්‍රදේශවලින් වහාම ඉවත් වීමට නියෝග කෙරේ.',
      stage3Btn: '3. හදිසි අනතුරුදායක SMS යවන්න',
      stage3Sub: 'අතිශය හදිසි පණිවිඩය: වාන් දොරටු 100% විවෘත කිරීම ආරම්භ කර ඇත.',
      directoryTitle: 'ලියාපදිංචි ලබන්නන්ගේ නාමාවලිය',
      registeredCount: 'තහවුරු කළ අංක ගණන',
      addRecipientTitle: 'නව නිලධාරී අංකයක් ලියාපදිංචි කරන්න',
      namePlaceholder: 'සම්පූර්ණ නම / තනතුර',
      phonePlaceholder: 'දුරකථන අංකය (+94 77 123 4567)',
      rolePlaceholder: 'දෙපාර්තමේන්තුව / භූමිකාව (උදා: වාරිමාර්ග, පොලිසිය)',
      addBtn: 'අංකය එක් කරන්න',
      removeBtn: 'ඉවත් කරන්න',
      confirmRemoveTitle: 'දුරකථන අංකය ඉවත් කිරීම',
      confirmRemoveMsg: 'මෙම දුරකථන අංකය ඉවත් කිරීමට අවශ්‍ය බව තහවුරු කරන්නද? මින්පසු හදිසි SMS ලැබෙන්නේ නැත.',
      confirmRemoveBtn: 'අංකය ඉවත් කරන්න',
      cancelBtn: 'අවලංගු කරන්න',
      confirmBroadcastTitle: 'හදිසි SMS විකාශනය තහවුරු කරන්න',
      confirmBroadcastIntro: 'ඔබ හදිසි SMS අනතුරු ඇඟවීමක් යැවීමට සූදානම් වන්නේ පහත සක්‍රීය අංක වෙත පමණි:',
      confirmBroadcastWarning: '⚠️ මෙය SIM800L මොඩියුලය හරහා සෘජු සෙලියුලර් පණිවිඩ සම්ප්‍රේෂණය කරනු ඇත.',
      confirmSendBtn: 'තහවුරු කර විකාශනය කරන්න'
    },
    audit: {
      title: 'පද්ධති ක්‍රියාකාරීත්ව වාර්තා සටහන',
      subtitle: 'දොරටු ක්‍රියාත්මක වීම් සහ ටෙලිමෙට්‍රි සිදුවීම් පිළිබඳ කාලානුක්‍රමික සටහන:'
    }
  },

  ta: {
    appTitle: 'SDAS ஆபரேட்டர் போர்டல்',
    appSubtitle: 'பொறியியல் & கதவு இயக்க இடைமுகம் • புத்தளம்',
    langName: 'தமிழ்',
    tabs: {
      telemetry: 'தொலைஅளவியல்',
      gateControl: 'கதவு கட்டுப்பாடு',
      smsDispatch: 'SMS அனுப்புதல்',
      auditLogs: 'தணிக்கை பதிவு'
    },
    status: {
      systemState: 'அமைப்பு நிலை',
      gateAperture: 'கதவு திறப்பு',
      sensorHealth: 'சென்சார் நலம்',
      healthy: 'ஆரோக்கியமானது',
      fault: 'சென்சார் கோளாறு',
      autoencoderMse: 'தானியங்கி குறியாக்கி MSE',
      discrepancy: 'சென்சார் வேறுபாடு',
      manualActive: 'கைமுறை இயக்கம் செயலில் உள்ளது',
      autoActive: 'தானியங்கி 3% பாதுகாப்பு முறை செயலில் உள்ளது'
    },
    telemetry: {
      reservoirCapacity: 'நீர்த்தேக்க கொள்ளளவு',
      waterLevel: 'நீர் மட்டம்',
      sensor1: 'மீயொலி சென்சார் S1 (JSN-SR04T)',
      sensor2: 'மீயொலி சென்சார் S2 (JSN-SR04T)',
      temperature: 'சுற்றுப்புற வெப்பநிலை (DHT22)',
      humidity: 'ஒப்பீட்டு ஈரப்பதம்',
      soundSpeed: 'சரிசெய்யப்பட்ட ஒலி வேகம்'
    },
    gateControl: {
      title: 'கைமுறை கதவு இயக்கம் (MG996R)',
      subtitle: 'பாதுகாப்பு பூட்டுகளுடன் கூடிய PWM கதவு கட்டுப்பாடு (0° முதல் 90° வரை)',
      currentAperture: 'தற்போதைய கதவு திறப்பு',
      targetAngle: 'இலக்கு கோணம்',
      applyOverride: 'கைமுறை இயக்கத்தைப் பயன்படுத்து',
      releaseOverride: 'தானியங்கி நிலைக்கு திரும்புக',
      closed0: '0° (மூடப்பட்டது)',
      stage27: '27° (30%)',
      stage54: '54° (60%)',
      full90: '90° (100%)',
      warningText: '⚠️ கைமுறை இயக்கம் தானியங்கி 3% பாதுகாப்பு மாற்றங்களை தற்காலிகமாக நிறுத்தும்.'
    },
    smsDispatch: {
      title: 'SIM800L செல்லுலார் ஒளிபரப்பு நிலையம்',
      subtitle: 'அவசர SMS எச்சரிக்கைகள் இங்கு பதிவு செய்யப்பட்ட சரிபார்க்கப்பட்ட எண்களுக்கு மட்டுமே அனுப்பப்படும்.',
      criticalNotice: '⚠️ கீழே பதிவு செய்யப்பட்ட எண்களுக்கு மட்டுமே அவசர SMS அனுப்பப்படும்.',
      stage1Btn: '1. முந்தைய எச்சரிக்கை SMS அனுப்புக',
      stage1Sub: '70% வரம்பை எட்டுவது குறித்து உள்ளூர் நீர்ப்பாசன ஊழியர்கள் மற்றும் DMC ஐ எச்சரிக்கிறது.',
      stage2Btn: '2. பகுதியை காலி செய் SMS அனுப்புக',
      stage2Sub: 'கீழ்மட்ட ஆற்றுப்படுகையை உடனடியாக காலி செய்ய உத்தரவிடுகிறது.',
      stage3Btn: '3. அவசர ஆபத்து SMS அனுப்புக',
      stage3Sub: 'அவசர எச்சரிக்கை: 100% முழு வான் கதவு திறப்பு தொடங்கப்பட்டது.',
      directoryTitle: 'பதிவு செய்யப்பட்ட பெறுநர்கள் அடைவு',
      registeredCount: 'சரிபார்க்கப்பட்ட பெறுநர்கள்',
      addRecipientTitle: 'அங்கீகரிக்கப்பட்ட புதிய எண்ணைச் சேர்',
      namePlaceholder: 'முழு பெயர் / உத்தியோகபூர்வ பதவி',
      phonePlaceholder: 'தொலைபேசி எண் (எ.கா: +94 77 123 4567)',
      rolePlaceholder: 'துறை / பங்கு (எ.கா: நீர்ப்பாசனம், பொலிஸ், DMC)',
      addBtn: 'எண்ணைப் பதிவு செய்',
      removeBtn: 'நீக்கு',
      confirmRemoveTitle: 'பெறுநர் எண்ணை நீக்குதல்',
      confirmRemoveMsg: 'இந்த தொலைபேசி எண்ணை நிச்சயமாக நீக்க வேண்டுமா? இனி அவசர அணை எச்சரிக்கைகள் கிடைக்காது.',
      confirmRemoveBtn: 'எண்ணை நீக்கு',
      cancelBtn: 'ரத்து செய்',
      confirmBroadcastTitle: 'அவசர SMS ஒளிபரப்பை உறுதி செய்',
      confirmBroadcastIntro: 'பின்வரும் செயலில் உள்ள எண்களுக்கு மட்டுமே அவசர SMS அனுப்பப்படும்:',
      confirmBroadcastWarning: '⚠️ இது SIM800L தொகுதி வழியாக நேரடி செல்லுலார் SMS பரிமாற்றங்களைத் தொடங்கும்.',
      confirmSendBtn: 'உறுதி செய்து அனுப்புக'
    },
    audit: {
      title: 'கணினி கதவு & பாதுகாப்பு தணிக்கை பதிவு',
      subtitle: 'கதவு இயக்கங்கள் மற்றும் தொலைஅளவியல் நிகழ்வுகளின் காலவரிசை பதிவு:'
    }
  }
};
