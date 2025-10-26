/**
 * Test Sales API Endpoints
 * 
 * Tests the /api/sales/daily and /api/sales/weekly endpoints
 */

const BASE_URL = 'http://localhost:3000';

// You'll need a valid manager token - get it from generate-manager-token.ts
const MANAGER_TOKEN = 'your-manager-token-here';

async function testDailySales() {
  console.log('\n📊 Testing Daily Sales API...');
  
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`Fetching sales for: ${today}`);
    
    const response = await fetch(`${BASE_URL}/api/sales/daily/${today}`, {
      headers: {
        'Authorization': `Bearer ${MANAGER_TOKEN}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch daily sales');
    }
    
    console.log('✅ Success!');
    console.log('Daily Sales Data:', JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

async function testWeeklySales() {
  console.log('\n📈 Testing Weekly Sales API...');
  
  try {
    // Get Monday of current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday (0)
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    const weekStart = monday.toISOString().split('T')[0];
    
    console.log(`Fetching weekly sales starting: ${weekStart}`);
    
    const response = await fetch(`${BASE_URL}/api/sales/weekly/${weekStart}`, {
      headers: {
        'Authorization': `Bearer ${MANAGER_TOKEN}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weekly sales');
    }
    
    console.log('✅ Success!');
    console.log('Weekly Sales Report:');
    console.log('- Total Revenue:', data.total_revenue);
    console.log('- Total Transactions:', data.total_transactions);
    console.log('- Average Daily Revenue:', data.average_daily_revenue);
    console.log('- Total Customers:', data.total_customers);
    console.log('- Days:', data.daily_breakdown.length);
    
    // Show first day details
    if (data.daily_breakdown.length > 0) {
      const firstDay = data.daily_breakdown[0];
      console.log('\nFirst Day Details:');
      console.log('- Date:', firstDay.date);
      console.log('- Revenue:', firstDay.total_revenue);
      console.log('- Transactions:', firstDay.total_transactions);
      console.log('- Cash:', firstDay.cash_sales);
      console.log('- Card:', firstDay.card_sales);
      console.log('- Top Customers:', firstDay.top_customers?.length || 0);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('🧪 Sales API Test Suite');
  console.log('=======================');
  
  if (MANAGER_TOKEN === 'your-manager-token-here') {
    console.error('\n⚠️  Please set MANAGER_TOKEN first!');
    console.log('Run: npm run generate-manager-token');
    return;
  }
  
  await testDailySales();
  await testWeeklySales();
  
  console.log('\n✨ Tests complete!\n');
}

main();
