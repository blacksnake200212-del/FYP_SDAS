// SDAS Public App Trilingual Translations (English, Sinhala, Tamil)
export const TRANSLATIONS = {
  en: {
    appTitle: 'SMART DAM ALERT SYSTEM',
    appSubtitle: 'Community Flood Safety Network • Deduru Oya',
    reservoirName: 'Puttalam Deduru Oya Spillway #1',
    langName: 'English',
    tabs: {
      dashboard: 'Dashboard',
      forecast: 'AI Forecast',
      evacuation: 'Safe Zones',
      hotlines: 'Hotlines'
    },
    stages: {
      NORMAL: {
        title: 'NORMAL LEVEL',
        description: 'Reservoir is below 70% capacity. Spillway gates closed. Downstream riverbed conditions are safe.',
        action: 'Continuous environmental monitoring active.'
      },
      PRE_WARNING: {
        title: 'PRE-WARNING (CAUTION)',
        description: 'Water level reached 70%–85%. Spillway gate opening 25%. Downstream caution advised.',
        action: 'Avoid recreational river bathing and fishing near spillway.'
      },
      CLEAR_AREA: {
        title: 'CLEAR AREA WARNING',
        description: 'Water level rising rapidly within 70%–85%. Spillway gate progressive opening 60%.',
        action: 'EVACUATE low-lying riverbanks and downstream flood channels immediately!'
      },
      DANGER: {
        title: 'DANGER EMERGENCY',
        description: 'CRITICAL: Reservoir exceeded 85% capacity! Floodgates 100% full discharge.',
        action: 'IMMEDIATE EVACUATION to designated high-ground community relief shelters.'
      }
    },
    metrics: {
      storageCapacity: 'Storage Capacity',
      waterLevel: 'Current Water Level',
      spillwayGate: 'Spillway Gate',
      closed: 'Closed',
      open: 'Open',
      temperature: 'Temperature',
      humidity: 'Humidity',
      inflowRate: 'Inflow Rate',
      acousticSpeed: 'Acoustic Speed',
      maxDamDepth: 'Max Dam Safe Depth',
      sensorDiscrepancy: 'Sensor Discrepancy',
      autoSync: 'Auto-sync active'
    },
    forecast: {
      title: 'LSTM Neural Hydrological Forecast',
      subtitle: 'Next 1-Hour Water Level Projection (MAPE 0.66%)',
      projectedLevel: 'Projected Water Level',
      projectedCapacity: 'Projected Reservoir Capacity',
      predictedTrend: 'Expected Trend',
      trendRising: 'Steady Inflow Rise Expected',
      trendStable: 'Stable Inflow Projected',
      aiConfidence: 'Confidence Interval: 99.34% (Bi-LSTM Hybrid Model)'
    },
    evacuation: {
      title: 'Designated High-Ground Safe Centers',
      subtitle: 'Puttalam District Disaster Management Authorized Shelters',
      capacity: 'Capacity',
      distance: 'Distance',
      elevation: 'Elevation above river',
      shelter1: {
        name: 'Deduru Oya Raja Maha Viharaya Community Hall',
        location: 'Zone A - High Ground Ridge, 1.2 km North',
        capacity: '500 Persons',
        elevation: '+24m Elevation'
      },
      shelter2: {
        name: 'St. Mary\'s College Evacuation Center, Chilaw',
        location: 'Zone B - Elevated School Grounds, 3.4 km West',
        capacity: '800 Persons',
        elevation: '+18m Elevation'
      },
      shelter3: {
        name: 'Puttalam Town Hall Disaster Operations Camp',
        location: 'Zone C - Municipal Safe Hub, 5.8 km North-West',
        capacity: '1,200 Persons',
        elevation: '+28m Elevation'
      }
    },
    hotlines: {
      title: 'Emergency Dispatch & Helplines',
      subtitle: 'Tap to connect directly to 24/7 civil protection authorities',
      callNow: 'Call Now',
      dmc: 'Disaster Management Centre (DMC)',
      police: 'Emergency Police & Search Rescue',
      damOffice: 'Deduru Oya Dam Engineering Office',
      ambulance: 'Suwa Seriya National Ambulance'
    }
  },

  si: {
    appTitle: 'ස්මාර්ට් වේලි අනතුරු ඇඟවීමේ පද්ධතිය',
    appSubtitle: 'ප්‍රජා ගංවතුර ආරක්ෂණ ජාලය • දැදුරු ඔය',
    reservoirName: 'පුත්තලම දැදුරු ඔය වාන් දොරටුව #1',
    langName: 'සිංහල',
    tabs: {
      dashboard: 'පුවරුව',
      forecast: 'AI අනාවැකිය',
      evacuation: 'ආරක්ෂිත කලාප',
      hotlines: 'හදිසි ඇමතුම්'
    },
    stages: {
      NORMAL: {
        title: 'සාමාන්‍ය මට්ටම',
        description: 'ජලාශය 70% ධාරිතාවට වඩා අඩුය. වාන් දොරටු වසා ඇත. ගංගා ඉවුර සාමාන්‍ය තත්ත්වයේ පවතී.',
        action: 'පාරිසරික අධීක්ෂණය අඛණ්ඩව ක්‍රියාත්මක වේ.'
      },
      PRE_WARNING: {
        title: 'පූර්ව අනතුරු ඇඟවීම (සැලකිලිමත් වන්න)',
        description: 'ජල මට්ටම 70%–85% දක්වා පැමිණ ඇත. වාන් දොරටුව 25% විවෘත වේ. ගංගා පහළ ප්‍රදේශ සැලකිලිමත් වන්න.',
        action: 'වාන් දොරටුව අසල දිය නෑම, මසුන් ඇල්ලීම සහ අනවශ්‍ය ගමන් වලින් වළකින්න.'
      },
      CLEAR_AREA: {
        title: 'ප්‍රදේශයෙන් ඉවත් වීමේ අනතුරු ඇඟවීම',
        description: 'ජල මට්ටම වේගයෙන් ඉහළ යයි (70%–85%). වාන් දොරටුව 60% දක්වා විවෘත කරනු ලැබේ.',
        action: 'පහත් බිම් සහ ගංගා ආශ්‍රිත ප්‍රදේශවලින් වහාම ආරක්ෂිත ස්ථාන වෙත ඉවත් වන්න!'
      },
      DANGER: {
        title: 'අවදානම් හදිසි තත්ත්වය',
        description: 'අතිශය බරපතලයි: ජලාශය 85% ඉක්මවා ඇත! වාන් දොරටු 100% පූර්ණ ලෙස විවෘත කර ඇත.',
        action: 'නම් කරන ලද උස් බිම් ප්‍රජා සහන මධ්‍යස්ථාන වෙත වහාම ඉවත් වන්න!'
      }
    },
    metrics: {
      storageCapacity: 'ජල ධාරිතාව',
      waterLevel: 'වත්මන් ජල මට්ටම',
      spillwayGate: 'වාන් දොරටුව',
      closed: 'වසා ඇත',
      open: 'විවෘතයි',
      temperature: 'උෂ්ණත්වය',
      humidity: 'ආර්ද්‍රතාව',
      inflowRate: 'ගලා ඒමේ වේගය',
      acousticSpeed: 'ධ්වනි වේගය',
      maxDamDepth: 'උපරිම ආරක්ෂිත ගැඹුර',
      sensorDiscrepancy: 'සංවේදක පරතරය',
      autoSync: 'ස්වයංක්‍රීයව සමමුහුර්ත වේ'
    },
    forecast: {
      title: 'LSTM ස්නායුක ජල විද්‍යාත්මක අනාවැකිය',
      subtitle: 'මීළඟ පැය 1 ජල මට්ටම් පුරෝකථනය (MAPE 0.66%)',
      projectedLevel: 'අපේක්ෂිත ජල මට්ටම',
      projectedCapacity: 'අපේක්ෂිත ජල ධාරිතාව',
      predictedTrend: 'අපේක්ෂිත ප්‍රවණතාවය',
      trendRising: 'ජලය ක්‍රමයෙන් වැඩිවීම අපේක්ෂා කෙරේ',
      trendStable: 'ස්ථාවර ජල මට්ටමක් අපේක්ෂිතයි',
      aiConfidence: 'විශ්වසනීයත්වය: 99.34% (Bi-LSTM දෙමුහුන් ආකෘතිය)'
    },
    evacuation: {
      title: 'නම් කරන ලද උස් බිම් ආරක්ෂිත මධ්‍යස්ථාන',
      subtitle: 'පුත්තලම දිස්ත්‍රික් ආපදා කළමනාකරණ බලයලත් ස්ථාන',
      capacity: 'ධාරිතාව',
      distance: 'දුර',
      elevation: 'ගඟේ සිට උස',
      shelter1: {
        name: 'දැදුරු ඔය රජ මහා විහාර ප්‍රජා ශාලාව',
        location: 'කලාපය A - උස් කඳු වැටිය, කි.මී. 1.2 උතුරින්',
        capacity: 'පුද්ගලයින් 500',
        elevation: '+24m උන්නතාංශය'
      },
      shelter2: {
        name: 'ශාන්ත මරියා විද්‍යාලයීය සහන කඳවුර, හලාවත',
        location: 'කලාපය B - උස් පාසල් භූමිය, කි.මී. 3.4 බටහිරින්',
        capacity: 'පුද්ගලයින් 800',
        elevation: '+18m උන්නතාංශය'
      },
      shelter3: {
        name: 'පුත්තලම නගර ශාලා ආපදා මෙහෙයුම් කඳවුර',
        location: 'කලාපය C - නාගරික ආරක්ෂිත මධ්‍යස්ථානය, කි.මී. 5.8 වයඹ',
        capacity: 'පුද්ගලයින් 1,200',
        elevation: '+28m උන්නතාංශය'
      }
    },
    hotlines: {
      title: 'හදිසි ඇමතුම් සහ සේවා',
      subtitle: 'පැය 24 පුරා ක්‍රියාත්මක ආපදා සේවා හා සම්බන්ධ වීමට තට්ටු කරන්න',
      callNow: 'අමතන්න',
      dmc: 'ආපදා කළමනාකරණ මධ්‍යස්ථානය (DMC)',
      police: 'හදිසි පොලිස් සහ සෝදිසි මුදවාගැනීම්',
      damOffice: 'දැදුරු ඔය වේලි ඉංජිනේරු කාර්යාලය',
      ambulance: 'සුවසැරිය ජාතික ගිලන්රථ සේවය'
    }
  },

  ta: {
    appTitle: 'ஸ்மார்ட் அணை எச்சரிக்கை அமைப்பு',
    appSubtitle: 'சமூக வெள்ள பாதுகாப்பு வலையமைப்பு • தெதுரு ஓயா',
    reservoirName: 'புத்தளம் தெதுரு ஓயா வான் கதவு #1',
    langName: 'தமிழ்',
    tabs: {
      dashboard: 'டாஷ்போர்டு',
      forecast: 'AI முன்னறிவிப்பு',
      evacuation: 'பாதுகாப்பு மண்டலங்கள்',
      hotlines: 'அவசர எண்கள்'
    },
    stages: {
      NORMAL: {
        title: 'இயல்பு நிலை',
        description: 'நீர்த்தேக்கம் 70% கொள்ளளவிற்குக் கீழே உள்ளது. வான் கதவுகள் மூடப்பட்டுள்ளன. ஆற்றுப்படுகை பாதுகாப்பானது.',
        action: 'சுற்றுச்சூழல் கண்காணிப்பு தொடர்ச்சியாக செயல்படுகிறது.'
      },
      PRE_WARNING: {
        title: 'முந்தைய எச்சரிக்கை (கவனம்)',
        description: 'நீர் மட்டம் 70%–85% எட்டியுள்ளது. வான் கதவு 25% திறக்கப்படுகிறது. கீழ்மட்ட ஆற்றுப்பகுதி எச்சரிக்கை.',
        action: 'வான் கதவு அருகே குளித்தல், மீன்பிடித்தலைத் தவிர்க்கவும்.'
      },
      CLEAR_AREA: {
        title: 'பகுதியை காலி செய் எச்சரிக்கை',
        description: 'நீர் மட்டம் வேகமாக உயர்கிறது. வான் கதவு 60% திறக்கப்படுகிறது.',
        action: 'தாழ்வான ஆற்றுப்படுகை மற்றும் வெள்ளப் பகுதிகளை உடனே காலி செய்யுங்கள்!'
      },
      DANGER: {
        title: 'அவசர ஆபத்து நிலை',
        description: 'அதிதீவிர எச்சரிக்கை: நீர்த்தேக்கம் 85% தாண்டியது! வெள்ளக் கதவுகள் 100% முழுமையாகத் திறக்கப்பட்டுள்ளன.',
        action: 'உடனடியாக நியமிக்கப்பட்ட உயரமான பாதுகாப்பு நிவாரண முகாம்களுக்கு செல்லுங்கள்!'
      }
    },
    metrics: {
      storageCapacity: 'சேமிப்பு கொள்ளளவு',
      waterLevel: 'தற்போதைய நீர் மட்டம்',
      spillwayGate: 'வான் கதவு',
      closed: 'மூடப்பட்டது',
      open: 'திறந்துள்ளது',
      temperature: 'வெப்பநிலை',
      humidity: 'ஈரப்பதம்',
      inflowRate: 'நீர் வரத்து விகிதம்',
      acousticSpeed: 'ஒலி வேகம்',
      maxDamDepth: 'அதிகபட்ச பாதுகாப்பான ஆழம்',
      sensorDiscrepancy: 'சென்சார் வேறுபாடு',
      autoSync: 'தானியங்கி ஒத்திசைவு செயலில் உள்ளது'
    },
    forecast: {
      title: 'LSTM நரம்பியல் நீரியல் முன்னறிவிப்பு',
      subtitle: 'அடுத்த 1 மணி நேர நீர் மட்ட கணிப்பு (MAPE 0.66%)',
      projectedLevel: 'எதிர்பார்க்கப்படும் நீர் மட்டம்',
      projectedCapacity: 'எதிர்பார்க்கப்படும் கொள்ளளவு',
      predictedTrend: 'எதிர்பார்க்கப்படும் போக்கு',
      trendRising: 'நீர் வரத்து படிப்படியாக அதிகரிக்கும் என எதிர்பார்க்கப்படுகிறது',
      trendStable: 'நிலையான நீர் வரத்து கணிக்கப்பட்டுள்ளது',
      aiConfidence: 'நம்பகத்தன்மை: 99.34% (Bi-LSTM கலப்பு மாதிரி)'
    },
    evacuation: {
      title: 'குறிப்பிடப்பட்ட உயரமான பாதுகாப்பு மையங்கள்',
      subtitle: 'புத்தளம் மாவட்ட பேரிடர் மேலாண்மை அங்கீகரிக்கப்பட்ட இடங்கள்',
      capacity: 'கொள்ளளவு',
      distance: 'தூரம்',
      elevation: 'ஆற்றிலிருந்து உயரம்',
      shelter1: {
        name: 'தெதுரு ஓயா ராஜ மகா விகாரை சமூக மண்டபம்',
        location: 'மண்டலம் A - உயரமான மலை முகடு, 1.2 கி.மீ வடக்கு',
        capacity: '500 நபர்கள்',
        elevation: '+24மீ உயரம்'
      },
      shelter2: {
        name: 'புனித மேரி கல்லூரி வெளியேற்ற மையம், சிலாபம்',
        location: 'மண்டலம் B - உயரமான பள்ளி வளாகம், 3.4 கி.மீ மேற்கு',
        capacity: '800 நபர்கள்',
        elevation: '+18மீ உயரம்'
      },
      shelter3: {
        name: 'புத்தளம் நகர சபை பேரிடர் செயல்பாட்டு முகாம்',
        location: 'மண்டலம் C - நகராட்சி பாதுகாப்பு மையம், 5.8 கி.மீ வடமேற்கு',
        capacity: '1,200 நபர்கள்',
        elevation: '+28மீ உயரம்'
      }
    },
    hotlines: {
      title: 'அவசர உதவி தொலைபேசி எண்கள்',
      subtitle: '24 மணி நேர பேரிடர் அதிகாரிகளை நேரடியாக அழைக்க தட்டவும்',
      callNow: 'அழைக்க',
      dmc: 'பேரிடர் மேலாண்மை மையம் (DMC)',
      police: 'அவசர பொலிஸ் மற்றும் தேடல் மீட்பு',
      damOffice: 'தெதுரு ஓயா அணை பொறியியல் அலுவலகம்',
      ambulance: 'சுவ செரிய தேசிய அவசர ஆம்புலன்ஸ்'
    }
  }
};
