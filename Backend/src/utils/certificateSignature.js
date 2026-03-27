const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── Key Generation & Storage ─────────────────────────────────────────────────

const KEYS_DIR = path.join(__dirname, '../../keys');

/**
 * Ensure keys directory exists and initialize keys if missing
 */
function ensureKeysDirectory() {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }
}

const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');

/**
 * Generate RSA key pair for certificate signing
 * Creates private.pem and public.pem in Backend/keys/
 * Call this ONCE to initialize keys
 */
function generateKeyPair() {
  ensureKeysDirectory();

  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
  console.log('✓ RSA key pair generated at', KEYS_DIR);
}

/**
 * Get or create private key for signing
 */
function getPrivateKey() {
  ensureKeysDirectory();

  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    generateKeyPair();
  }

  return fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

/**
 * Get public key for verification
 */
function getPublicKey() {
  ensureKeysDirectory();

  if (!fs.existsSync(PUBLIC_KEY_PATH)) {
    generateKeyPair();
  }

  return fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
}

// ─── Certificate Signing ───────────────────────────────────────────────────────

/**
 * Create a digital signature for certificate data
 * @param {object} certificateData  { certificateId, studentName, domain, startDate, endDate }
 * @returns {string} Base64-encoded signature
 */
function signCertificate(certificateData) {
  const dataString = JSON.stringify(certificateData);
  const privateKey = getPrivateKey();

  const signature = crypto.sign(
    'sha256',
    Buffer.from(dataString),
    {
      key: privateKey,
      format: 'pem',
    }
  );

  return signature.toString('base64');
}

/**
 * Verify certificate signature
 * @param {object} certificateData  Original certificate data
 * @param {string} signature  Base64-encoded signature
 * @returns {boolean} True if signature is valid
 */
function verifyCertificate(certificateData, signature) {
  const dataString = JSON.stringify(certificateData);
  const publicKey = getPublicKey();

  try {
    return crypto.verify(
      'sha256',
      Buffer.from(dataString),
      {
        key: publicKey,
        format: 'pem',
      },
      Buffer.from(signature, 'base64')
    );
  } catch (error) {
    console.error('Certificate signature verification failed:', error.message);
    return false;
  }
}

/**
 * Create a hash of certificate data (for blockchain storage)
 * @param {object} certificateData
 * @returns {string} SHA256 hash in hex format
 */
function hashCertificate(certificateData) {
  const dataString = JSON.stringify(certificateData);
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

// ─── Public API ────────────────────────────────────────────────────────────────

module.exports = {
  generateKeyPair,
  getPrivateKey,
  getPublicKey,
  signCertificate,
  verifyCertificate,
  hashCertificate,
};
