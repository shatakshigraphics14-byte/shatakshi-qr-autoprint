/**
 * Windows local print-agent scaffold.
 *
 * Production requirements:
 * - Fetch jobs only from your trusted backend over HTTPS.
 * - Authenticate this device with a revocable device token.
 * - Verify order is paid (verified UPI webhook) OR cash-approved by admin.
 * - Download PDFs using short-lived signed URLs.
 * - Never accept arbitrary local file paths or print commands from public clients.
 *
 * This starter deliberately does not poll a cloud API or print anything by itself.
 * It contains a safe, local-only helper to test a known PDF manually.
 */
require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const sumatra = process.env.SUMATRA_PATH || 'C:\\\\Program Files\\\\SumatraPDF\\\\SumatraPDF.exe';
const bwPrinter = process.env.BW_PRINTER || 'HP LaserJet M1005';
const colourPrinter = process.env.COLOR_PRINTER || 'EPSON L3210';

function printKnownPdf(pdfPath, kind, paperSize = 'A4') {
  if (!['bw', 'colour'].includes(kind)) throw new Error('kind must be bw or colour');
  const resolved = path.resolve(pdfPath);
  if (!fs.existsSync(resolved) || path.extname(resolved).toLowerCase() !== '.pdf') {
    throw new Error('Choose an existing PDF file');
  }
  if (!fs.existsSync(sumatra)) throw new Error('SumatraPDF not found. Set SUMATRA_PATH in .env');
  const printer = kind === 'colour' ? colourPrinter : bwPrinter;
  // Printer names must match Windows Settings > Printers & scanners exactly.
  const args = ['-silent', '-print-to', printer, '-print-settings', `paper=${paperSize},simplex`, resolved];
  const child = spawn(sumatra, args, { windowsHide: true, stdio: 'inherit' });
  child.on('error', e => console.error('Print launch failed:', e.message));
  child.on('close', code => console.log('SumatraPDF exit code:', code));
}

// Intentionally no auto-print loop until backend authentication/payment verification is implemented.
console.log('Shatakshi local print-agent scaffold started.');
console.log('BW printer:', bwPrinter);
console.log('Colour printer:', colourPrinter);
console.log('Auto-print is DISABLED until secure backend integration is completed.');
console.log('To test manually, import printKnownPdf in a controlled local test script.');
module.exports = { printKnownPdf };
