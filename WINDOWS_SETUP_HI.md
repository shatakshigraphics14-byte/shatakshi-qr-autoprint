# Windows PC Setup — Hindi

## 1. पहले प्रिंटर नाम जाँचें
Windows में **Settings → Bluetooth & devices → Printers & scanners** खोलें।
- Black & White: HP LaserJet M1005
- Colour: Epson L3210
दोनों नाम ठीक उसी तरह `.env` में रखें जैसे Windows में दिखते हैं।

## 2. Node.js
Node.js LTS इंस्टॉल करें। फिर इस folder में Command Prompt खोलें:
```bat
npm install
copy .env.example .env
```
`.env` में `ADMIN_PASSWORD` को एक मजबूत, लंबा पासवर्ड बनाएं।

## 3. Starter API चलाएँ
```bat
npm run dev
```
फिर ब्राउज़र में `http://localhost:3030/api/health` खोलें।
यह सिर्फ local development test है, public upload website नहीं।

## 4. Print Agent
Production में SumatraPDF CLI का इस्तेमाल किया जा सकता है, लेकिन पहले एक test PDF से प्रत्येक printer पर परीक्षण करें। Paper-size/ID-size layout, orientation, scaling और page range का सही व्यवहार printer driver और PDF पर निर्भर करेगा।

## 5. Live करने से पहले जरूरी काम
- Secure hosted backend + private object storage
- PDF का server-side validation और वास्तविक page counting
- ID Size के लिए स्पष्ट layout (एक PDF page को ID-size में fit करना है या ID photo sheet बनानी है, यह तय करें)
- Payment gateway order creation और signed webhook verification
- UPI payment success के बाद idempotent print queue
- Cash approval वाला authenticated admin panel
- PC print agent का device authentication, retries और duplicate-print protection
- Private file download, retention/deletion policy, HTTPS और audit logs

**ध्यान दें:** QR में public website का HTTPS URL होना चाहिए। WhatsApp/PhonePe scanner आम तौर पर QR में मौजूद URL खोलते हैं; वे अपने आप किसी वेबसाइट पर फाइल अपलोड या प्रिंट नहीं कराते।


## अपडेटेड ग्राहक पेज
1. ZIP को Extract करें।
2. प्रोजेक्ट फोल्डर में PowerShell खोलें।
3. `npm install` चलाएँ।
4. `.env.example` की कॉपी `.env` नाम से बनाकर Admin password बदलें।
5. `npm run dev` चलाएँ और ब्राउज़र में `http://localhost:3030` खोलें।
6. `productionReady: false` रहने तक इसे सार्वजनिक ऑनलाइन सेवा या ऑटो प्रिंट के लिए इस्तेमाल न करें।
