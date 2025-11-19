require('dotenv').config();
const db = require('./config/db');

// COUNTRIES mapping from api.js - code to full name
const COUNTRIES = {
    "AF": "Afghanistan",
    "AL": "Albania",
    "DZ": "Algeria",
    "AD": "Andorra",
    "AO": "Angola",
    "AG": "Antigua and Barbuda",
    "AR": "Argentina",
    "AM": "Armenia",
    "AU": "Australia",
    "AT": "Austria",
    "AZ": "Azerbaijan",
    "BS": "Bahamas",
    "BH": "Bahrain",
    "BD": "Bangladesh",
    "BB": "Barbados",
    "BY": "Belarus",
    "BE": "Belgium",
    "BZ": "Belize",
    "BJ": "Benin",
    "BT": "Bhutan",
    "BO": "Bolivia",
    "BA": "Bosnia and Herzegovina",
    "BW": "Botswana",
    "BR": "Brazil",
    "BN": "Brunei",
    "BG": "Bulgaria",
    "BF": "Burkina Faso",
    "BI": "Burundi",
    "KH": "Cambodia",
    "CM": "Cameroon",
    "CA": "Canada",
    "CV": "Cape Verde",
    "CF": "Central African Republic",
    "TD": "Chad",
    "CL": "Chile",
    "CN": "China",
    "CO": "Colombia",
    "KM": "Comoros",
    "CG": "Congo",
    "CD": "Congo (DRC)",
    "CR": "Costa Rica",
    "HR": "Croatia",
    "CU": "Cuba",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "DJ": "Djibouti",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    "EC": "Ecuador",
    "EG": "Egypt",
    "SV": "El Salvador",
    "GQ": "Equatorial Guinea",
    "ER": "Eritrea",
    "EE": "Estonia",
    "SZ": "Eswatini",
    "ET": "Ethiopia",
    "FJ": "Fiji",
    "FI": "Finland",
    "FR": "France",
    "GA": "Gabon",
    "GM": "Gambia",
    "GE": "Georgia",
    "DE": "Germany",
    "GH": "Ghana",
    "GR": "Greece",
    "GD": "Grenada",
    "GT": "Guatemala",
    "GN": "Guinea",
    "GW": "Guinea-Bissau",
    "GY": "Guyana",
    "HT": "Haiti",
    "HN": "Honduras",
    "HU": "Hungary",
    "IS": "Iceland",
    "IN": "India",
    "ID": "Indonesia",
    "IR": "Iran",
    "IQ": "Iraq",
    "IE": "Ireland",
    "IL": "Israel",
    "IT": "Italy",
    "JM": "Jamaica",
    "JP": "Japan",
    "JO": "Jordan",
    "KZ": "Kazakhstan",
    "KE": "Kenya",
    "KI": "Kiribati",
    "KP": "North Korea",
    "KR": "South Korea",
    "KW": "Kuwait",
    "KG": "Kyrgyzstan",
    "LA": "Laos",
    "LV": "Latvia",
    "LB": "Lebanon",
    "LS": "Lesotho",
    "LR": "Liberia",
    "LY": "Libya",
    "LI": "Liechtenstein",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "MG": "Madagascar",
    "MW": "Malawi",
    "MY": "Malaysia",
    "MV": "Maldives",
    "ML": "Mali",
    "MT": "Malta",
    "MH": "Marshall Islands",
    "MR": "Mauritania",
    "MU": "Mauritius",
    "MX": "Mexico",
    "FM": "Micronesia",
    "MD": "Moldova",
    "MC": "Monaco",
    "MN": "Mongolia",
    "ME": "Montenegro",
    "MA": "Morocco",
    "MZ": "Mozambique",
    "MM": "Myanmar",
    "NA": "Namibia",
    "NR": "Nauru",
    "NP": "Nepal",
    "NL": "Netherlands",
    "NZ": "New Zealand",
    "NI": "Nicaragua",
    "NE": "Niger",
    "NG": "Nigeria",
    "MK": "North Macedonia",
    "NO": "Norway",
    "OM": "Oman",
    "PK": "Pakistan",
    "PW": "Palau",
    "PS": "Palestine",
    "PA": "Panama",
    "PG": "Papua New Guinea",
    "PY": "Paraguay",
    "PE": "Peru",
    "PH": "Philippines",
    "PL": "Poland",
    "PT": "Portugal",
    "QA": "Qatar",
    "RO": "Romania",
    "RU": "Russia",
    "RW": "Rwanda",
    "KN": "Saint Kitts and Nevis",
    "LC": "Saint Lucia",
    "VC": "Saint Vincent and the Grenadines",
    "WS": "Samoa",
    "SM": "San Marino",
    "ST": "Sao Tome and Principe",
    "SA": "Saudi Arabia",
    "SN": "Senegal",
    "RS": "Serbia",
    "SC": "Seychelles",
    "SL": "Sierra Leone",
    "SG": "Singapore",
    "SK": "Slovakia",
    "SI": "Slovenia",
    "SB": "Solomon Islands",
    "SO": "Somalia",
    "ZA": "South Africa",
    "SS": "South Sudan",
    "ES": "Spain",
    "LK": "Sri Lanka",
    "SD": "Sudan",
    "SR": "Suriname",
    "SE": "Sweden",
    "CH": "Switzerland",
    "SY": "Syria",
    "TW": "Taiwan",
    "TJ": "Tajikistan",
    "TZ": "Tanzania",
    "TH": "Thailand",
    "TL": "Timor-Leste",
    "TG": "Togo",
    "TO": "Tonga",
    "TT": "Trinidad and Tobago",
    "TN": "Tunisia",
    "TR": "Turkey",
    "TM": "Turkmenistan",
    "TV": "Tuvalu",
    "UG": "Uganda",
    "UA": "Ukraine",
    "AE": "United Arab Emirates",
    "GB": "United Kingdom",
    "US": "United States",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    "VU": "Vanuatu",
    "VA": "Vatican City",
    "VE": "Venezuela",
    "VN": "Vietnam",
    "YE": "Yemen",
    "ZM": "Zambia",
    "ZW": "Zimbabwe",
};

/**
 * Create reverse mapping from country full name to code
 * Handles case-insensitive matching
 */
function createCountryNameToCodeMap() {
    const nameToCode = {};
    for (const [code, name] of Object.entries(COUNTRIES)) {
        // Store both exact and lowercase versions for matching
        nameToCode[name] = code;
        nameToCode[name.toLowerCase()] = code;
    }
    return nameToCode;
}

// Create the reverse map once for efficiency
const COUNTRY_NAME_TO_CODE = createCountryNameToCodeMap();

/**
 * Find country code from country name
 * @param {string} countryName - Full country name or code
 * @returns {string|null} Country code or null if not found
 */
function getCountryCode(countryName) {
    if (!countryName) return null;
    
    const normalizedName = countryName.trim();
    
    // If it's already a 2-letter code, return it
    if (normalizedName.length === 2 && /^[A-Z]{2}$/i.test(normalizedName)) {
        // Check if it's a valid code
        if (COUNTRIES[normalizedName.toUpperCase()]) {
            return normalizedName.toUpperCase();
        }
    }
    
    // Try exact match first
    if (COUNTRY_NAME_TO_CODE[normalizedName]) {
        return COUNTRY_NAME_TO_CODE[normalizedName];
    }
    
    // Try case-insensitive match
    if (COUNTRY_NAME_TO_CODE[normalizedName.toLowerCase()]) {
        return COUNTRY_NAME_TO_CODE[normalizedName.toLowerCase()];
    }
    
    return null;
}

/**
 * Update country codes in the users table
 */
async function updateCountryCodes() {
    try {
        console.log('🔄 Starting country code update...\n');
        
        // Ensure database connection
        const result = await db.initialize();
        if (!result.connected) {
            console.error('❌ Database not connected. Cannot update country codes.');
            process.exit(1);
        }

        const pool = db.getPool();
        
        // Get all users with their country values
        const result_query = await pool.query(`
            SELECT id, name, email, country
            FROM users
            ORDER BY created_at DESC
        `);
        
        const users = result_query.rows;
        console.log(`👥 Found ${users.length} users\n`);
        
        if (users.length === 0) {
            console.log('✅ No users to update');
            return;
        }
        
        let updated = 0;
        let skipped = 0;
        let errors = 0;
        let notFound = 0;
        
        // Update each user
        for (const user of users) {
            try {
                const currentCountry = user.country;
                
                // Skip if country is null or empty
                if (!currentCountry || currentCountry.trim() === '') {
                    console.log(`⏭️  Skipping "${user.name}" (${user.email}): Country is empty`);
                    skipped++;
                    continue;
                }
                
                // Check if already a valid code
                const countryCode = getCountryCode(currentCountry);
                
                if (!countryCode) {
                    console.log(`⚠️  Could not find code for "${user.name}" (${user.email}): "${currentCountry}"`);
                    notFound++;
                    continue;
                }
                
                // Skip if already the correct code
                if (currentCountry.toUpperCase() === countryCode) {
                    console.log(`⏭️  Skipping "${user.name}" (${user.email}): Already has code "${countryCode}"`);
                    skipped++;
                    continue;
                }
                
                // Update user country to code
                await pool.query(`
                    UPDATE users
                    SET country = $1, updated_at = NOW()
                    WHERE id = $2
                `, [countryCode, user.id]);
                
                updated++;
                console.log(`✅ Updated: ${user.name} (${user.email})`);
                console.log(`   From: "${currentCountry}"`);
                console.log(`   To: "${countryCode}"`);
                console.log('');
                
                // Show progress every 10 users
                if (updated % 10 === 0) {
                    console.log(`📊 Progress: ${updated} updated, ${skipped} skipped, ${notFound} not found, ${errors} errors\n`);
                }
                
            } catch (error) {
                errors++;
                console.error(`❌ Error updating "${user.name}" (${user.email}):`, error.message);
            }
        }
        
        console.log('\n📊 Final Summary:');
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ⚠️  Not Found: ${notFound}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log('\n✅ Country code update completed!');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        const pool = db.getPool();
        if (pool) {
            await pool.end();
        }
        process.exit(0);
    }
}

// Run the update
if (require.main === module) {
    updateCountryCodes();
}

module.exports = { updateCountryCodes, getCountryCode };

