/**
 * ORB Intelligence Company Verification Service
 * Verifies employer information and legitimacy
 *
 * SETUP:
 * 1. Register at https://www.orb-intelligence.com/
 * 2. Get API key from dashboard
 * 3. Add to .env:
 *    ORB_INTELLIGENCE_API_KEY=your_api_key
 *    ORB_INTELLIGENCE_API_BASE=https://api.orb-intelligence.com
 */

const axios = require('axios');

const ORB_API_BASE = process.env.ORB_INTELLIGENCE_API_BASE || 'https://api.orb-intelligence.com';
const ORB_API_KEY = process.env.ORB_INTELLIGENCE_API_KEY;

// ─── Verify API Key Configuration ─────────────────────────────────────────────

function validateConfiguration() {
  if (!ORB_API_KEY) {
    console.warn('⚠ ORB_INTELLIGENCE_API_KEY not configured. Company verification will be disabled.');
    return false;
  }
  return true;
}

// ─── Search Company by Name ──────────────────────────────────────────────────

/**
 * Search for company information by name
 * @param {string} companyName
 * @returns {object} Company details or null if not found
 */
async function searchCompany(companyName) {
  try {
    if (!validateConfiguration()) {
      return {
        found: false,
        message: 'ORB Intelligence API not configured',
        code: 'CONFIGURATION_ERROR',
      };
    }

    const response = await axios.get(`${ORB_API_BASE}/company/search`, {
      params: {
        query: companyName,
        limit: 5,
      },
      headers: {
        'Authorization': `Bearer ${ORB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (!response.data.results || response.data.results.length === 0) {
      return {
        found: false,
        query: companyName,
        message: 'No companies found matching the search query',
      };
    }

    return {
      found: true,
      results: response.data.results.map((company) => ({
        id: company.id,
        name: company.name,
        website: company.website,
        industry: company.industry,
        employeeCount: company.employee_count,
        founded: company.founded_year,
        location: company.location,
        type: company.company_type,
        verified: company.verified,
      })),
    };
  } catch (error) {
    console.error('Company search failed:', error.message);
    return {
      found: false,
      error: error.message,
      message: 'Failed to search company information',
    };
  }
}

// ─── Get Company Details by ID ───────────────────────────────────────────────

/**
 * Fetch detailed information about a company by ID
 * @param {string} companyId
 * @returns {object} Detailed company information
 */
async function getCompanyDetails(companyId) {
  try {
    if (!validateConfiguration()) {
      return {
        found: false,
        message: 'ORB Intelligence API not configured',
        code: 'CONFIGURATION_ERROR',
      };
    }

    const response = await axios.get(`${ORB_API_BASE}/company/${companyId}`, {
      headers: {
        'Authorization': `Bearer ${ORB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const company = response.data;

    return {
      found: true,
      id: company.id,
      name: company.name,
      website: company.website,
      industry: company.industry,
      sector: company.sector,
      subindustry: company.subindustry,
      description: company.description,
      employeeCount: company.employee_count,
      founded: company.founded_year,
      headquarters: {
        city: company.headquarters_city,
        state: company.headquarters_state,
        country: company.headquarters_country,
        address: company.headquarters_address,
      },
      revenue: company.revenue,
      type: company.company_type,
      verified: company.verified,
      linkedinUrl: company.linkedin_url,
      createdAt: company.created_at,
    };
  } catch (error) {
    console.error('Company details fetch failed:', error.message);
    return {
      found: false,
      error: error.message,
      message: 'Failed to fetch company details',
    };
  }
}

// ─── Verify Employer Against ORB Intelligence Database ──────────────────────

/**
 * Verify that employer exists and is legitimate
 * @param {string} employerName
 * @returns {object} Employer verification result
 */
async function verifyEmployer(employerName) {
  try {
    if (!validateConfiguration()) {
      return {
        verified: false,
        message: 'ORB Intelligence API not configured',
        code: 'CONFIGURATION_ERROR',
      };
    }

    const searchResult = await searchCompany(employerName);

    if (!searchResult.found) {
      return {
        verified: false,
        employer: employerName,
        message: `Employer "${employerName}" not found in ORB Intelligence database`,
        suggestion: 'This could be a small/new company, startup, or subsidiary. Manual verification may be needed.',
      };
    }

    const topMatch = searchResult.results[0];
    const companyDetails = await getCompanyDetails(topMatch.id);

    if (!companyDetails.found) {
      return {
        verified: false,
        employer: employerName,
        message: 'Could not fetch employer details',
      };
    }

    return {
      verified: true,
      employer: employerName,
      match: {
        id: companyDetails.id,
        name: companyDetails.name,
        website: companyDetails.website,
        industry: companyDetails.industry,
        employeeCount: companyDetails.employeeCount,
        founded: companyDetails.founded,
        type: companyDetails.type,
        verified: companyDetails.verified,
      },
      legitimacyScore: calculateLegitimacyScore(companyDetails),
      message: '✓ Employer verified in ORB Intelligence database',
    };
  } catch (error) {
    console.error('Employer verification failed:', error.message);
    return {
      verified: false,
      employer: employerName,
      error: error.message,
      message: '✗ Failed to verify employer',
    };
  }
}

// ─── Calculate Legitimacy Score ────────────────────────────────────────────

/**
 * Calculate a legitimacy score based on company attributes
 * @param {object} companyDetails
 * @returns {number} Score 0-100
 */
function calculateLegitimacyScore(companyDetails) {
  let score = 50; // Base score

  // Has website
  if (companyDetails.website) score += 10;

  // Has verifiable founding year
  if (companyDetails.founded && companyDetails.founded > 1800) score += 10;

  // Has employee count
  if (companyDetails.employeeCount && companyDetails.employeeCount > 0) score += 15;

  // Has revenue information
  if (companyDetails.revenue) score += 10;

  // Is verified by ORB Intelligence
  if (companyDetails.verified) score += 25;

  // Large company (more than 100 employees)
  if (companyDetails.employeeCount && companyDetails.employeeCount > 100) score += 10;

  return Math.min(score, 100);
}

// ─── Batch Verify Multiple Employers ──────────────────────────────────────────

/**
 * Verify multiple employers at once
 * @param {array} employerNames Array of employer names
 * @returns {object} Verification results for each employer
 */
async function verifyMultipleEmployers(employerNames) {
  if (!Array.isArray(employerNames) || employerNames.length === 0) {
    return {
      error: 'employerNames must be a non-empty array',
      results: [],
    };
  }

  try {
    const verificationPromises = employerNames.map((name) => verifyEmployer(name));
    const results = await Promise.all(verificationPromises);

    const summary = {
      total: employerNames.length,
      verified: results.filter((r) => r.verified).length,
      unverified: results.filter((r) => !r.verified).length,
      results,
    };

    return summary;
  } catch (error) {
    console.error('Batch employer verification failed:', error.message);
    return {
      error: error.message,
      results: [],
    };
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

module.exports = {
  searchCompany,
  getCompanyDetails,
  verifyEmployer,
  verifyMultipleEmployers,
  validateConfiguration,
};
