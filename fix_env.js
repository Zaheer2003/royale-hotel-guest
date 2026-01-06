const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const content = `DATABASE_URL="file:./dev.db"
AUTH_SECRET="generate_a_random_secret_here"
AUTH_GOOGLE_ID="578779152986-5qsavegh6drhnnk2854o9d7eqlpsmi7j.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="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"
`;

fs.writeFileSync(envPath, content, { encoding: 'utf8' });
console.log('.env file repaired.');
