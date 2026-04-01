const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// ─── Load & compile template once at module load ──────────────────────────────
const TEMPLATE_PATH = path.join(__dirname, '../templates/certificate.hbs');
const templateSource = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const compiledTemplate = handlebars.compile(templateSource);

// ─── Duration Calculator ──────────────────────────────────────────────────────

/**
 * Calculate a human-readable duration between two dates.
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {string}  e.g. "3 months", "2 weeks", "1 month 2 weeks"
 */
function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calendar-aware month difference
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  // If the end day-of-month is before the start day-of-month,
  // the last month isn't complete yet — subtract it and count leftover days
  const dayStart = start.getDate();
  const dayEnd = end.getDate();

  let remainingDays = 0;
  if (dayEnd < dayStart) {
    months -= 1;
    // Days remaining = days left in that partial month
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); // last day of prev month
    remainingDays = prevMonth.getDate() - dayStart + dayEnd;
  } else {
    remainingDays = dayEnd - dayStart;
  }

  const weeks = Math.floor(remainingDays / 7);
  const days  = remainingDays % 7;

  const parts = [];
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (weeks  > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
  if (days   > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

  // Fallback: total days if nothing else matched
  if (parts.length === 0) {
    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
  }

  return parts.join(' ');
}

// ─── Date Formatter ───────────────────────────────────────────────────────────

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ─── PDF Generator ────────────────────────────────────────────────────────────

/**
 * Generate a PDF certificate buffer for the given student data.
 * Uses @sparticuz/chromium which works in cloud environments (Render, Lambda, etc.)
 * @param {object} student  Mongoose Student document or plain object
 * @returns {Promise<Buffer>}  Raw PDF binary buffer
 */
async function generateCertificatePDF(student) {
  const organizationName = process.env.ORGANIZATION_NAME || 'Amdox Technologies';

  const templateData = {
    certificateId:    student.certificateId,
    studentName:      student.studentName,
    internshipDomain: student.internshipDomain,
    startDate:        formatDate(student.startDate),
    endDate:          formatDate(student.endDate),
    duration:         calculateDuration(student.startDate, student.endDate),
    issueDate:        formatDate(new Date()),
    organizationName,
  };

  const html = compiledTemplate(templateData);

  // ── Resolve browser executable based on OS + environment ─────────────────────
  // Render/Lambda = Linux  → use @sparticuz/chromium (bundled binary)
  // Local Windows dev      → use locally installed Google Chrome
  // Guard by BOTH platform AND NODE_ENV so it works even if NODE_ENV is misconfigured.
  let executablePath;
  let launchArgs;

  const isWindowsDev =
    process.platform === 'win32' && process.env.NODE_ENV !== 'production';

  if (isWindowsDev) {
    // Windows local dev: find the system Chrome
    const candidates = [
      process.env.CHROME_PATH,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ].filter(Boolean);

    executablePath = candidates.find(p => fs.existsSync(p));

    if (!executablePath) {
      throw new Error(
        '[PDF] Could not find Google Chrome on this machine.\n' +
        'Install Chrome, or add CHROME_PATH=<path to chrome.exe> to your Backend .env file.'
      );
    }

    launchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];
  } else {
    // Linux (Render, AWS Lambda, etc.): use @sparticuz/chromium
    executablePath = await chromium.executablePath();
    launchArgs     = chromium.args;
  }

  const browser = await puppeteer.launch({
    executablePath,
    args:            launchArgs,
    defaultViewport: { width: 1200, height: 900 },
    headless:        true,
  });

  try {
    const page = await browser.newPage();
    // Use 'load' instead of 'networkidle0' to avoid hanging on Google Fonts timeout
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { calculateDuration, formatDate, generateCertificatePDF };
