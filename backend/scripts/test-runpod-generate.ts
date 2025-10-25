import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testRunPodGenerate() {
  console.log('\n=== TESTING RUNPOD GENERATE ENDPOINT ===\n');

  const apiUrl = process.env.RUNPOD_API_URL;
  const apiKey = process.env.RUNPOD_API_KEY;

  console.log(`API URL: ${apiUrl}`);
  console.log(`API Key: ${apiKey?.substring(0, 20)}...\n`);

  const testPrompt = 'Say hello in one sentence.';

  try {
    console.log('Testing /api/generate-with-system endpoint...');
    console.log(`Prompt: "${testPrompt}"\n`);

    const response = await fetch(`${apiUrl}/api/generate-with-system`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey!,
      },
      body: JSON.stringify({
        system_prompt_key: 'shift_scheduler',
        prompt: testPrompt,
        model: 'llama3.1:8b-instruct-q6_K',
        stream: false,
        validate: false,
        options: {
          temperature: 0.5,
          num_ctx: 2048,
          num_predict: 100,
        },
      }),
    });

    console.log(`Status: ${response.status}`);

    const responseText = await response.text();
    console.log('Raw Response (first 500 chars):', responseText.substring(0, 500));

    if (!response.ok) {
      console.log('\n❌ RunPod API call failed!');
      console.log('This likely means:');
      console.log('  1. The RunPod pod is paused/stopped (check RunPod dashboard)');
      console.log('  2. The API key is invalid');
      console.log('  3. The endpoint URL has changed');
    } else {
      console.log('\n✅ RunPod API is working!');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\nPossible causes:');
    console.log('  - Network timeout (pod might be starting up)');
    console.log('  - Pod is completely offline');
    console.log('  - DNS/connection issue');
  }

  console.log('\n');
}

testRunPodGenerate().catch(console.error);
