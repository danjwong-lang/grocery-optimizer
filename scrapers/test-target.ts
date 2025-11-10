import { scrapeTargetPrices } from './target-scraper';

async function testScraper() {
  console.log('🧪 Testing Target scraper...\n');
  
  const testProducts = [
    {
      name: 'Fairlife Lactose-Free Milk',
      url: 'https://www.target.com/p/fairlife-lactose-free-milk/-/A-94756488'
    },
    {
      name: 'FAGE Total 2% Greek Yogurt',
      url: 'https://www.target.com/p/fage-total-2-milkfat-greek-yogurt/-/A-94723644'
    }
  ];
  
  const results = await scrapeTargetPrices(testProducts);
  
  console.log('\n📊 RESULTS:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(`\nItem: ${result.itemName}`);
    console.log(`Price: ${result.price ? `$${result.price}` : 'Not found'}`);
    console.log(`In Stock: ${result.inStock ? 'Yes' : 'No'}`);
  });
}

testScraper();