const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const content = `DATABASE_URL="postgresql://..."
AUTH_SECRET="your_auth_secret"
AUTH_GOOGLE_ID="your_google_id"
AUTH_GOOGLE_SECRET="your_google_secret"
`;

fs.writeFileSync(envPath, content, { encoding: 'utf8' });
console.log('.env file repaired.');
