const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const sharp = require('sharp');
require('dotenv').config();

const app = express();
const PORT = 3000;

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

const CV_PROMPT = `أنت خبير HR محترف ومتخصص في تحليل السير الذاتية.
حلل الـ CV التالي وقدم تقريراً شاملاً باللغة العربية يتضمن:

**✅ نقاط القوة:**
اذكر كل نقاط القوة بالتفصيل

**⚠️ نقاط الضعف:**
اذكر كل نقاط الضعف بوضوح

**💡 نصائح للتحسين:**
قدم نصائح عملية ومحددة

**🎯 التقييم العام:**
قيّم الـ CV من 10 مع شرح سبب التقييم

كن صريحاً ومفيداً في تحليلك.`;

app.post('/analyze', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'محتاج ترفع ملف CV' });
    }

    let cvText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      cvText = pdfData.text;
      if (!cvText || cvText.trim().length < 50) {
        return res.status(400).json({ success: false, error: 'الـ PDF فاضي أو مش قابل للقراءة' });
      }
    } else {
      const imageBuffer = await sharp(req.file.buffer).jpeg({ quality: 90 }).toBuffer();
      cvText = imageBuffer.toString('base64');
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: CV_PROMPT },
        { role: 'user', content: req.file.mimetype === 'application/pdf' 
          ? `حلل الـ CV ده:\n\n${cvText}`
          : `هذه صورة CV - حللها بناءً على ما تعرفه عن السير الذاتية الاحترافية`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    res.json({ success: true, analysis: completion.choices[0].message.content });

  } catch (error) {
    console.error('خطأ:', error.message);
    res.status(500).json({ success: false, error: 'حصل خطأ أثناء التحليل — حاول تاني' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ السيرفر شغال على http://localhost:${PORT}`);
});