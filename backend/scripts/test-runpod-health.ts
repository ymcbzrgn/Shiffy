import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testRunPodHealth() {
  console.log('\n=== TESTING RUNPOD CONNECTION ===\n');

  const apiUrl = process.env.RUNPOD_API_URL;
  const apiKey = process.env.RUNPOD_API_KEY;

  console.log(`API URL: ${apiUrl}`);
  console.log(`API Key: ${apiKey?.substring(0, 20)}...\n`);

  try {
    console.log('Testing health endpoint...');
    const response = await fetch(`${apiUrl}/api/health`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey!,
      },
    });

    console.log(`Status: ${response.status}`);

    const responseText = await response.text();
    console.log('Raw Response:', responseText);

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed JSON:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Not valid JSON');
    }

    if (response.ok) {
      console.log('\n✅ RunPod connection working!');
    } else {
      console.log('\n❌ RunPod connection failed!');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n');
}

testRunPodHealth().catch(console.error);
