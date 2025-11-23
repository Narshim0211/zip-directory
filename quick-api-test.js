const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  log('\n🚀 QUICK API TEST - Backend Verification', 'cyan');
  log('='.repeat(70), 'blue');

  try {
    const health = await makeRequest('GET', '/api/health');
    if (health.status === 200) {
      log('✅ Backend is healthy', 'green');
    }

    const feed = await makeRequest('GET', '/api/feed/global?limit=5');
    if (feed.status === 200) {
      log('✅ Feed endpoint working', 'green');
      const items = feed.data.data || [];
      const surveys = items.filter(item => item.type === 'survey');
      const loveSurveys = surveys.filter(s => s.surveyType === 'love-only');
      
      log(`   Found ${surveys.length} surveys (${loveSurveys.length} love-only)`, 'yellow');
      
      if (surveys[0]) {
        const hasReactions = surveys.some(s => s.reactions);
        if (hasReactions) {
          log('✅ Reaction enrichment working', 'green');
        }
      }
    }

    log('\n🎯 Backend is ready! Open http://localhost:3000 to test UI', 'cyan');

  } catch (error) {
    log('❌ ERROR: ' + error.message, 'red');
  }
}

runTests();
