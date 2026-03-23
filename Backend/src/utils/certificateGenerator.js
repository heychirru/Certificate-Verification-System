const puppeteer = require('puppeteer');
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
  const diffMs = end - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  const weeks = Math.floor(remainingDays / 7);

  const parts = [];
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (weeks > 0)  parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);

  return parts.length > 0 ? parts.join(' ') : `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
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

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
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
