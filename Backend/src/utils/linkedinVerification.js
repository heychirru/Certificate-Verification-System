/**
 * LinkedIn Verification Service
 * Verifies internship work history using LinkedIn API
 *
 * SETUP:
 * 1. Register app at https://www.linkedin.com/developers/apps
 * 2. Get OAuth credentials (Client ID, Client Secret)
 * 3. Add to .env:
 *    LINKEDIN_CLIENT_ID=your_client_id
 *    LINKEDIN_CLIENT_SECRET=your_client_secret
 *    LINKEDIN_REDIRECT_URI=http://localhost:5000/auth/linkedin/callback
 */

const axios = require('axios');

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

// ─── Get Authorization Code ──────────────────────────────────────────────────

/**
 * Generate LinkedIn OAuth authorization URL
 * User visits this URL to grant permission
 */
function getAuthorizationUrl(state = '') {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
    scope: 'profile email openid',
    state,
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

// ─── Exchange Authorization Code for Access Token ──────────────────────────────

/**
 * Exchange authorization code for access token
 * Called after user grants permission
 */
async function getAccessToken(authCode) {
  try {
    const response = await axios.post(LINKEDIN_TOKEN_URL, null, {
      params: {
        grant_type: 'authorization_code',
        code: authCode,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      },
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type,
    };
  } catch (error) {
    console.error('LinkedIn token exchange failed:', error.response?.data || error.message);
    throw new Error('Failed to get LinkedIn access token');
  }
}

// ─── Get User Profile ───────────────────────────────────────────────────────

/**
 * Fetch LinkedIn user profile information
 * Requires valid access token
 */
async function getUserProfile(accessToken) {
  try {
    const response = await axios.get(`${LINKEDIN_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    return {
      id: response.data.id,
      firstName: response.data.localizedFirstName,
      lastName: response.data.localizedLastName,
      profileUrl: response.data.profilePicture?.displayImage,
    };
  } catch (error) {
    console.error('LinkedIn profile fetch failed:', error.response?.data || error.message);
    throw new Error('Failed to fetch LinkedIn profile');
  }
}

// ─── Get Work Experience ────────────────────────────────────────────────────

/**
 * Fetch LinkedIn work experience history
 * Check if student's internship dates/company match
 */
async function getWorkExperience(accessToken) {
  try {
    const response = await axios.get(`${LINKEDIN_API_BASE}/me?projection=(id,localizedFirstName)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Note: Full work experience requires more advanced API access
    // This is a simplified version - full implementation would need LinkedIn's "Sign In with LinkedIn" v2 or enterprise access

    return {
      success: true,
      message: 'Work experience data requires LinkedIn API v1 enterprise access or user granted permission',
      note: 'LinkedIn deprecated public profile access - consider using LinkedIn Sign In with LinkedIn v2',
    };
  } catch (error) {
    console.error('LinkedIn work experience fetch failed:', error.response?.data || error.message);
    throw new Error('Failed to fetch work experience from LinkedIn');
  }
}

// ─── Verify Internship Against LinkedIn Profile ─────────────────────────────

/**
 * Simplified verification: Match LinkedIn user profile with certificate data
 * For full work history verification, user needs to authenticate
 *
 * @param {object} certificateData { certificateId, studentName, internshipDomain, startDate, endDate }
 * @param {string} accessToken LinkedIn OAuth access token
 * @returns {object} Verification result
 */
async function verifyInternshipHistory(certificateData, accessToken) {
  try {
    const profile = await getUserProfile(accessToken);

    // Match name similarity (basic check)
    const linkedInName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
    const certName = certificateData.studentName.toLowerCase();

    const nameMatch = linkedInName.includes(certName.split(' ')[0]) ||
                      certName.includes(linkedInName.split(' ')[0]);

    return {
      verified: nameMatch,
      linkedInProfile: {
        name: `${profile.firstName} ${profile.lastName}`,
        id: profile.id,
      },
      certificateData: {
        studentName: certificateData.studentName,
        internshipDomain: certificateData.internshipDomain,
        duration: `${certificateData.startDate} to ${certificateData.endDate}`,
      },
      nameMatch,
      message: nameMatch
        ? '✓ LinkedIn profile matches certificate holder'
        : '✗ LinkedIn profile name does not match certificate',
      note: 'For complete work history verification, implement LinkedIn OAuth flow with extended access',
    };
  } catch (error) {
    console.error('Internship verification failed:', error.message);
    return {
      verified: false,
      error: error.message,
      message: '✗ Failed to verify internship history',
    };
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

module.exports = {
  getAuthorizationUrl,
  getAccessToken,
  getUserProfile,
  getWorkExperience,
  verifyInternshipHistory,
};
