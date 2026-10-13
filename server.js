require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { PDFDocument } = require('pdf-lib');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));
const PORT = Number(process.env.PORT || 3030);
const MAX_MB = Math.min(Number(process.env.MAX_UPLOAD_MB || 15), 20);
const uploadDir = path.join(__dirname, 'private-uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const orders = new Map(); // In-memory only: use a database before online production deployment.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, _file, cb) => cb(null, crypto.randomUUID() + '.pdf')
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    cb(ok ? null : new Error('केवल PDF फाइल स्वीकार है'), ok);
  }
});
function rateFor(kind) { return kind === 'colour' ? 15 : 10; }
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Shatakshi QR Auto Print', productionReady: false }));
app.post('/api/orders', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PDF फाइल जरूरी है' });
  try {
    const { customerName = '', phone = '', paperSize = 'A4', kind = 'bw', copies = '1', note = '', paymentMethod = 'cash' } = req.body;
    if (!['A4', 'ID'].includes(paperSize) || !['bw', 'colour'].includes(kind)) throw new Error('साइज या प्रिंट प्रकार गलत है');
    if (!['cash', 'upi'].includes(paymentMethod)) throw new Error('पेमेंट तरीका चुनें');
    const nCopies = Number(copies);
    if (!Number.isInteger(nCopies) || nCopies < 1 || nCopies > 100) throw new Error('कॉपी की संख्या 1 से 100 के बीच रखें');
    const bytes = fs.readFileSync(req.file.path);
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: false });
    const pageCount = pdf.getPageCount();
    if (!pageCount) throw new Error('PDF में कोई पेज नहीं है');
    // ID layout can have multiple card faces on a page. Until crop/layout detection is added,
    // ID orders are priced by uploaded PDF page count and must be reviewed by the shop.
    const ratePerPage = rateFor(kind);
    const total = pageCount * nCopies * ratePerPage;
    const id = 'SGP-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const order = {
      id, customerName: String(customerName).slice(0, 80),
      phone: String(phone).replace(/\D/g, '').slice(0, 10),
      originalName: path.basename(req.file.originalname), privateFile: req.file.path,
      paperSize, kind, copies: nCopies, pageCount, ratePerPage, total, paymentMethod,
      note: String(note).slice(0, 500), paymentStatus: 'pending',
      printStatus: 'waiting_for_payment_or_cash_approval', createdAt: new Date().toISOString()
    };
    orders.set(id, order);
    res.status(201).json({ orderId: id, pageCount, paperSize, kind, copies: nCopies, ratePerPage, total,
      currency: 'INR', paymentStatus: 'pending', printStatus: order.printStatus,
      paymentMethod, message: 'PDF मिली और पेज गिने गए। भुगतान की पुष्टि दुकान से होगी। UPI का ऑटो-वेरिफिकेशन और ऑटो-प्रिंट अभी सक्रिय नहीं हैं।' });
  } catch (e) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: e.message || 'PDF पढ़ी नहीं जा सकी। बिना पासवर्ड वाली सही PDF अपलोड करें।' });
  }
});
app.post('/api/admin/orders/:id/approve-cash', (req, res) => {
  const supplied = req.get('x-admin-password');
  if (!process.env.ADMIN_PASSWORD || supplied !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Admin authentication failed' });
  const order = orders.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'ऑर्डर नहीं मिला' });
  order.paymentStatus = 'cash_confirmed';
  order.printStatus = 'ready_for_print_agent';
  res.json({ ok: true, orderId: order.id, printStatus: order.printStatus, note: 'Print-agent integration अभी आवश्यक है।' });
});
app.post('/api/admin/orders/:id/confirm-upi-manual', (req, res) => {
  const supplied = req.get('x-admin-password');
  if (!process.env.ADMIN_PASSWORD || supplied !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Admin authentication failed' });
  const order = orders.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'ऑर्डर नहीं मिला' });
  if (order.paymentMethod !== 'upi') return res.status(400).json({ error: 'यह UPI ऑर्डर नहीं है' });
  // Manual shop-side confirmation only. Never treat a customer screenshot as automated verification.
  order.paymentStatus = 'upi_manually_confirmed_by_admin';
  order.printStatus = 'ready_for_print_agent';
  res.json({ ok: true, orderId: order.id, printStatus: order.printStatus, note: 'मैनुअल पुष्टि दर्ज हुई; प्रिंट एजेंट/सुरक्षित ऑटो-प्रिंट एकीकरण अलग से आवश्यक है।' });
});

app.get('/api/admin/orders', (req, res) => {
  const supplied = req.get('x-admin-password');
  if (!process.env.ADMIN_PASSWORD || supplied !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Admin authentication failed' });
  res.json([...orders.values()].map(({ privateFile, ...safe }) => safe));
});
app.use((err, _req, res, _next) => res.status(400).json({ error: err.message || 'Request error' }));
app.listen(PORT, () => console.log(`Shatakshi QR Auto Print listening on http://localhost:${PORT}`));
