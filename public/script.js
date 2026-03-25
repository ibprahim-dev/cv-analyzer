// ===================================
// الترجمات
// ===================================
const translations = {
  ar: {
    badge: '✨ مدعوم بالذكاء الاصطناعي',
    title: 'محلل السيرة الذاتية',
    subtitle: 'ارفع الـ CV بتاعك وهنحلله في ثواني ونديك تقرير احترافي كامل',
    uploadTitle: 'ارفع الـ CV بتاعك',
    uploadSub: 'PDF أو صورة — الحجم الأقصى 10MB',
    choose: 'اختار ملف',
    noFile: 'لم يتم اختيار ملف',
    analyze: '🔍 حلل الـ CV دلوقتي',
    loading: 'جاري تحليل الـ CV بالذكاء الاصطناعي...',
    resultTitle: '📊 نتيجة التحليل',
    reset: '🔄 حلل CV تاني',
    footer: '© 2026 CV Analyzer — جميع الحقوق محفوظة',
    currentLang: 'العربية',
    prompt: 'حلل الـ CV التالي وقدم تقريراً شاملاً باللغة العربية',
    dir: 'rtl'
  },
  en: {
    badge: '✨ Powered by AI',
    title: 'CV Analyzer',
    subtitle: 'Upload your CV and get a professional analysis in seconds',
    uploadTitle: 'Upload Your CV',
    uploadSub: 'PDF or Image — Max size 10MB',
    choose: 'Choose File',
    noFile: 'No file selected',
    analyze: '🔍 Analyze CV Now',
    loading: 'Analyzing your CV with AI...',
    resultTitle: '📊 Analysis Result',
    reset: '🔄 Analyze Another CV',
    footer: '© 2026 CV Analyzer — All Rights Reserved',
    currentLang: 'English',
    prompt: 'Analyze the following CV and provide a comprehensive report in English',
    dir: 'ltr'
  },
  es: {
    badge: '✨ Impulsado por IA',
    title: 'Analizador de CV',
    subtitle: 'Sube tu CV y obtén un análisis profesional en segundos',
    uploadTitle: 'Sube tu CV',
    uploadSub: 'PDF o imagen — Tamaño máximo 10MB',
    choose: 'Elegir archivo',
    noFile: 'Ningún archivo seleccionado',
    analyze: '🔍 Analizar CV ahora',
    loading: 'Analizando tu CV con IA...',
    resultTitle: '📊 Resultado del análisis',
    reset: '🔄 Analizar otro CV',
    footer: '© 2026 CV Analyzer — Todos los derechos reservados',
    currentLang: 'Español',
    prompt: 'Analiza el siguiente CV y proporciona un informe completo en español',
    dir: 'ltr'
  },
  de: {
    badge: '✨ KI-gestützt',
    title: 'Lebenslauf-Analysator',
    subtitle: 'Laden Sie Ihren Lebenslauf hoch und erhalten Sie in Sekunden eine professionelle Analyse',
    uploadTitle: 'Laden Sie Ihren Lebenslauf hoch',
    uploadSub: 'PDF oder Bild — Maximale Größe 10MB',
    choose: 'Datei auswählen',
    noFile: 'Keine Datei ausgewählt',
    analyze: '🔍 Lebenslauf jetzt analysieren',
    loading: 'Lebenslauf wird mit KI analysiert...',
    resultTitle: '📊 Analyseergebnis',
    reset: '🔄 Anderen Lebenslauf analysieren',
    footer: '© 2026 CV Analyzer — Alle Rechte vorbehalten',
    currentLang: 'Deutsch',
    prompt: 'Analysiere den folgenden Lebenslauf und erstelle einen umfassenden Bericht auf Deutsch',
    dir: 'ltr'
  }
};

// ===================================
// المتغيرات
// ===================================
let selectedFile = null;
let currentLang = 'ar';

const cvFile = document.getElementById('cvFile');
const fileName = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const resultBox = document.getElementById('resultBox');
const resultContent = document.getElementById('resultContent');
const uploadBox = document.getElementById('uploadBox');

// ===================================
// تغيير اللغة
// ===================================
function setLang(lang) {
  currentLang = lang;
  const t = translations[lang];
  
  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;
  
  document.getElementById('txt-badge').textContent = t.badge;
  document.getElementById('txt-title').textContent = t.title;
  document.getElementById('txt-subtitle').textContent = t.subtitle;
  document.getElementById('txt-upload-title').textContent = t.uploadTitle;
  document.getElementById('txt-upload-sub').textContent = t.uploadSub;
  document.getElementById('txt-choose').textContent = t.choose;
  document.getElementById('fileName').textContent = t.noFile;
  document.getElementById('txt-analyze').textContent = t.analyze;
  document.getElementById('txt-loading').textContent = t.loading;
  document.getElementById('txt-result-title').textContent = t.resultTitle;
  document.getElementById('txt-reset').textContent = t.reset;
  document.getElementById('txt-footer').textContent = t.footer;
  document.getElementById('currentLang').textContent = t.currentLang;
  
  toggleLangMenu();
}

function toggleLangMenu() {
  document.getElementById('langMenu').classList.toggle('open');
}

// إغلاق القائمة لما تضغط بره
document.addEventListener('click', (e) => {
  if (!document.getElementById('langSelector').contains(e.target)) {
    document.getElementById('langMenu').classList.remove('open');
  }
});

// ===================================
// اختيار الملف
// ===================================
cvFile.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ الملف أكبر من 10MB!');
      return;
    }
    selectedFile = file;
    fileName.textContent = '✅ ' + file.name;
    analyzeBtn.disabled = false;
  }
});

// Drag & Drop
uploadBox.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.style.borderColor = '#7c3aed';
  uploadBox.style.background = 'rgba(124,58,237,0.15)';
});

uploadBox.addEventListener('dragleave', () => {
  uploadBox.style.borderColor = '';
  uploadBox.style.background = '';
});

uploadBox.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBox.style.borderColor = '';
  uploadBox.style.background = '';
  const file = e.dataTransfer.files[0];
  if (file) {
    selectedFile = file;
    fileName.textContent = '✅ ' + file.name;
    analyzeBtn.disabled = false;
  }
});

// ===================================
// تحليل الـ CV
// ===================================
async function analyzeCV() {
  if (!selectedFile) return;

  loading.hidden = false;
  resultBox.hidden = true;
  analyzeBtn.hidden = true;
  uploadBox.style.opacity = '0.5';
  uploadBox.style.pointerEvents = 'none';

  try {
    const formData = new FormData();
    formData.append('cv', selectedFile);
    formData.append('lang', currentLang);
    formData.append('prompt', translations[currentLang].prompt);

    const response = await fetch('/analyze', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      resultContent.innerHTML = formatResult(data.analysis);
      resultBox.hidden = false;
      resultBox.scrollIntoView({ behavior: 'smooth' });
    } else {
      showError(data.error);
    }

  } catch (error) {
    showError('حصل خطأ في الاتصال');
  } finally {
    loading.hidden = true;
    uploadBox.style.opacity = '1';
    uploadBox.style.pointerEvents = 'auto';
    analyzeBtn.hidden = false;
  }
}

// ===================================
// تنسيق النتيجة
// ===================================
function formatResult(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#a78bfa">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p style="margin-top:15px">')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

function showError(message) {
  resultContent.innerHTML = `
    <div style="color:#f87171; padding:20px; text-align:center;">
      ❌ ${message}
    </div>`;
  resultBox.hidden = false;
}

function resetForm() {
  selectedFile = null;
  cvFile.value = '';
  fileName.textContent = translations[currentLang].noFile;
  analyzeBtn.disabled = true;
  analyzeBtn.hidden = false;
  resultBox.hidden = true;
  resultContent.innerHTML = '';
  uploadBox.scrollIntoView({ behavior: 'smooth' });
}