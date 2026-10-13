# Shatakshi Graphics & Online — QR Print Setup

## यह पैकेज अभी क्या करता है
- ग्राहक पेज: PDF अपलोड, A4/ID विकल्प, B&W ₹10/पेज, Colour ₹15/पेज, कॉपी संख्या, कुल अनुमानित रकम और Cash/UPI विकल्प।
- PDF सर्वर पर पहुँचती है और पेज गिने जाते हैं।
- Admin पेज से ऑर्डर सूची देखी जा सकती है और कैश/UPI भुगतान की **मैनुअल** पुष्टि दर्ज की जा सकती है।
- Admin URL: `http://localhost:3030/admin.html`

## 1. पहली बार सेटअप
1. ZIP को एक नए फोल्डर में Extract करें।
2. उस फोल्डर में File Explorer के address bar में `powershell` लिखकर Enter दबाएँ।
3. चलाएँ:
   ```powershell
   npm install
   Copy-Item .env.example .env
   notepad .env
   ```
4. `.env` में `ADMIN_PASSWORD` को अपना मजबूत पासवर्ड करें। प्रिंटर के नाम Windows में दिखने वाले नाम से मिलाएँ।
5. `START_LOCAL.bat` पर double-click करें, या `npm run dev` चलाएँ।
6. ग्राहक पेज: `http://localhost:3030` और Admin: `http://localhost:3030/admin.html`।

## 2. दुकान के कंप्यूटर पर दूसरे मोबाइल/डिवाइस से स्थानीय टेस्ट
कंप्यूटर और फोन एक ही Wi-Fi पर होने चाहिए। Windows में `ipconfig` चलाकर Wi-Fi IPv4 Address देखें, जैसे `192.168.1.20`; फोन में `http://192.168.1.20:3030` खोलें। यह केवल उसी Wi-Fi नेटवर्क पर काम करेगा। Firewall अनुमति माँगे तो केवल Private network पर अनुमति दें। यह सार्वजनिक इंटरनेट वेबसाइट नहीं है।

## 3. दुकान के पोस्टर वाला स्थायी QR
पोस्टर का QR **तभी बनाएं जब HTTPS वाली सार्वजनिक वेबसाइट होस्ट हो जाए**। QR में उस लाइव वेबसाइट का पूरा URL होना चाहिए। `localhost` या `192.168...` का QR ग्राहकों के मोबाइल नेटवर्क पर काम नहीं करेगा। Hosting account/domain और cloud backend deployment अभी इस ZIP में शामिल नहीं है।

## 4. भुगतान और प्रिंट के बारे में जरूरी स्थिति
- UPI ID: `paytmqr6ub505@ptys` को दुकान के QR/UPI ऐप में इस्तेमाल किया जा सकता है, लेकिन इस starter में UPI payment gateway या bank webhook नहीं है। Admin की UPI confirmation मैनुअल है; ग्राहक के screenshot को भुगतान का प्रमाण न मानें।
- Cash confirmation भी सिर्फ status बदलती है। अभी printer agent server से authenticated print jobs नहीं लेता, इसलिए यह पुष्टि अपने-आप प्रिंट नहीं निकालती।
- `print-agent.js` अभी जानबूझकर auto-print नहीं करता। वास्तविक auto-print के लिए authenticated cloud-to-PC queue, duplicate-print protection और verified payment webhook जरूरी हैं।
- ID Auto Crop अभी लागू नहीं है। ID विकल्प ऑर्डर में दर्ज होता है, लेकिन कार्ड पहचान/क्रॉपिंग और print preview जोड़ना बाकी है।
- अभी ऑर्डर memory में रहते हैं और सर्वर restart पर सूची मिट जाती है। सार्वजनिक इस्तेमाल से पहले database, private file storage, retention/deletion, HTTPS, abuse protection और privacy notice जोड़ें।

## 5. प्रिंटर नाम
Windows Settings → Bluetooth & devices → Printers & scanners में ठीक-ठीक नाम देखें और `.env` में भरें:
- B&W: HP LaserJet M1005
- Colour: EPSON L3210

**इस संस्करण को सार्वजनिक ग्राहकों के लिए पूर्ण ऑटो-प्रिंट सेवा न मानें।** यह स्थानीय परीक्षण और आगे के निर्माण के लिए है।
