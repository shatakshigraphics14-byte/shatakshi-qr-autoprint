# Shatakshi Graphics & Online QR Print

पहले `START_HERE_HI.md` पढ़ें। Windows पर `START_LOCAL.bat` से लोकल सर्वर चालू किया जा सकता है।

यह अभी परीक्षण संस्करण है: सार्वजनिक होस्टिंग, वास्तविक UPI सत्यापन, सुरक्षित प्रिंट कतार, स्वचालित प्रिंट और ID auto-crop पूरी तरह लागू नहीं हैं।

# Shatakshi Graphics & Online — QR Auto Print Starter

यह **starter project** है, production-ready payment/printing system नहीं। यह आपके तय किए गए workflow के लिए शुरुआती फाइलें और setup guide देता है।

## तय workflow
- ग्राहक QR स्कैन करके वेबसाइट खोले
- PDF upload करे
- ID Size या A4 चुने
- Black & White ₹10/page या Colour ₹15/page चुने
- कुल रकम देखे
- UPI payment verified होने पर ही print queue में job जाए
- Cash order दुकानदार के admin approval के बाद ही print queue में जाए
- Black & White → `HP LaserJet M1005`
- Colour → `EPSON L3210`
- दोनों printer एक ही Windows PC पर USB से जुड़े

## जरूरी सुरक्षा नियम
1. Browser से payment-success message पर भरोसा न करें। Payment gateway के **server-side webhook/signature verification** के बाद ही UPI order paid माना जाए।
2. Public website को सीधे printer से न जोड़ें। Windows PC पर local print agent सुरक्षित backend से authenticated jobs ले।
3. Admin panel पर password, rate limiting, upload size/type checks और private file storage जरूरी हैं।
4. Customer documents को public URLs में न रखें। तय retention अवधि के बाद delete करें।
5. शुरुआत में ID Size को स्पष्ट layout/fit policy के साथ लागू करें। PDF के हर page को ID card के आकार में बदलना अलग print-layout logic है।

## Project contents
- `public/index.html` — मोबाइल-फ्रेंडली ग्राहक अपलोड पेज।
- `server.js` — PDF अपलोड validation, `pdf-lib` से पेज काउंट, शुरुआती कुल रकम और ऑर्डर API। यह **development scaffold** है; वास्तविक UPI verification/auto-print/cloud database नहीं है।
- `print-agent.js` — Windows print-agent scaffold using SumatraPDF CLI. It expects authenticated jobs from a trusted backend; API integration is intentionally left as a clearly marked TODO.
- `.env.example` — configuration placeholders.
- `package.json` — Node.js dependencies.
- `WINDOWS_SETUP_HI.md` — setup notes in Hindi.

## Before real launch
आपको इनमें से एक सुरक्षित backend चुनना होगा (उदाहरण: Firebase/Cloud Functions + private Storage, या hosted Node.js backend), और payment gateway (जैसे Razorpay) का merchant account व webhook secrets सेट करना होगा। किसी भी secret को public HTML/JavaScript में न डालें। Real payment credentials मिलने से पहले UPI auto-print को production में चालू न करें।


## इस अपडेट में
- ग्राहक फॉर्म और मोबाइल-फ्रेंडली पेज जोड़ा गया।
- PDF पेज गिनने और ₹10/₹15 के हिसाब से शुरुआती कुल रकम की गणना जोड़ी गई।
- ID विकल्प अभी केवल समीक्षा/मैनुअल लेआउट के लिए है; auto-crop अभी लागू नहीं है।
- `npm install` चलाना आवश्यक है ताकि `pdf-lib` इंस्टॉल हो।
- `npm run dev` के बाद ब्राउज़र में `http://localhost:3030` खोलें।
- ऑनलाइन होस्टिंग से पहले database/private storage, admin authentication, payment gateway webhook और authenticated print-agent integration अनिवार्य हैं।
