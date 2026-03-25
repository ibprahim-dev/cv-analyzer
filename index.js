const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const sharp = require('sharp');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf','image/jpeg','image/jpg','image/png','image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('نوع الملف مش مدعوم'));
  }
});

app.use(express.static('public'));
app.use(express.json());

app.post('/analyze', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'محتاج ترفع ملف CV' });
    }

    const userPrompt = req.body.prompt || 'حلل الـ CV التالي وقدم تقريراً شاملاً باللغة العربية';

    const SYSTEM_PROMPT = `${userPrompt} يتضمن:

**1. نقاط القوة ✅**
اذكر كل نقاط القوة بالتفصيل

**2. نقاط الضعف ⚠️**
اذكر كل نقاط الضعف بوضوح

**3. نصائح للتحسين 💡**
قدم نصائح عملية ومحددة

**4. التقييم العام 🎯**
قيّم الـ CV من 10 مع شرح سبب التقييم

كن صريحاً ومفيداً في تحليلك.`;

    let cvText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      cvText = pdfData.text;
      if (!cvText || cvText.trim().length < 50) {
        return res.status(400).json({ success: false, error: 'الـ PDF فاضي أو مش قابل للقراءة' });
      }
    } else {
      const imageBuffer = await sharp(req.file.buffer).jpeg({ quality: 90 }).toBuffer();
      cvText = `[CV Image - analyze based on professional CV standards]`;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `CV:\n\n${cvText}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    res.json({ success: true, analysis: completion.choices[0].message.content });

  } catch (error) {
    console.error('خطأ:', error.message);
    res.status(500).json({ success: false, error: 'حصل خطأ أثناء التحليل' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ السيرفر شغال على http://localhost:${PORT}`);
});