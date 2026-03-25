// ===================================
// المتغيرات
// ===================================
let selectedFile = null;

const cvFile = document.getElementById('cvFile');
const fileName = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const resultBox = document.getElementById('resultBox');
const resultContent = document.getElementById('resultContent');
const uploadBox = document.getElementById('uploadBox');

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

// ===================================
// Drag & Drop
// ===================================
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
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ الملف أكبر من 10MB!');
      return;
    }
    selectedFile = file;
    fileName.textContent = '✅ ' + file.name;
    analyzeBtn.disabled = false;
  }
});

// ===================================
// تحليل الـ CV
// ===================================
async function analyzeCV() {
  if (!selectedFile) {
    alert('❌ اختار ملف الأول!');
    return;
  }

  // إظهار اللودينج
  loading.hidden = false;
  resultBox.hidden = true;
  analyzeBtn.hidden = true;
  uploadBox.style.opacity = '0.5';
  uploadBox.style.pointerEvents = 'none';

  try {
    const formData = new FormData();
    formData.append('cv', selectedFile);

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
    showError('حصل خطأ في الاتصال — تأكد إن السيرفر شغال');
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

// ===================================
// إظهار الخطأ
// ===================================
function showError(message) {
  resultContent.innerHTML = `
    <div style="color:#f87171; padding:20px; text-align:center; font-size:1.1rem;">
      ❌ ${message}
    </div>`;
  resultBox.hidden = false;
}

// ===================================
// إعادة تعيين
// ===================================
function resetForm() {
  selectedFile = null;
  cvFile.value = '';
  fileName.textContent = 'لم يتم اختيار ملف';
  analyzeBtn.disabled = true;
  analyzeBtn.hidden = false;
  resultBox.hidden = true;
  resultContent.innerHTML = '';
  uploadBox.scrollIntoView({ behavior: 'smooth' });
}