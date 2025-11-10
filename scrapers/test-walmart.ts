import { scrapeWalmartPrices } from './walmart-scraper';

async function testScraper() {
  console.log('🧪 Testing Walmart scraper with direct product URL...\n');
  
  // Test with your actual product URL
  const testProducts = [
    {
      name: 'Fairlife Lactose-Free Milk 52oz',
      url: 'https://www.walmart.com/ip/fairlife-Lactose-Free-2-Reduced-Fat-Ultra-Filtered-Milk-52-fl-oz/43984343'
    }
  ];
  
  const results = await scrapeWalmartPrices(testProducts);
  
  console.log('\n📊 RESULTS:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(`\nItem: ${result.itemName}`);
    console.log(`Price: ${result.price ? `$${result.price}` : 'Not found'}`);
    console.log(`In Stock: ${result.inStock ? 'Yes' : 'No'}`);
  });
}

testScraper();