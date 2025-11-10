import { chromium } from 'playwright';

interface ProductInput {
  name: string;
  url: string;
}

interface ScrapedPrice {
  itemName: string;
  price: number | null;
  unit: string;
  inStock: boolean;
  url: string;
}

export async function scrapeTargetPrices(products: ProductInput[]): Promise<ScrapedPrice[]> {
  console.log('🎯 Starting Target scraper...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const results: ScrapedPrice[] = [];
  
  for (const product of products) {
    console.log(`\n🔍 Scraping: ${product.name}`);
    console.log(`   URL: ${product.url}`);
    
    try {
        // Set zip code to get Sunnyvale pricing
      await page.goto('https://www.target.com', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Try to set location (Target uses cookies/local storage)
      await page.evaluate(() => {
        localStorage.setItem('OmniZipCode', '94087');
      });
      
      console.log('   📍 Set location to Sunnyvale (94087)');
      await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // Debug: Save HTML
      const html = await page.content();
      const fs = require('fs');
      fs.writeFileSync('debug-target.html', html);
      console.log('   📄 Saved page HTML to debug-target.html');
      
      // Target price selectors
      const priceSelectors = [
        '[data-test="product-price"]',
        'span[data-test="product-price"]',
        'div[data-test="product-price"]',
        '[class*="Price"]'
      ];
      
      let price: number | null = null;
      
      for (const selector of priceSelectors) {
        try {
          const priceElement = await page.$(selector);
          if (priceElement) {
            const priceText = await priceElement.textContent();
            console.log(`   Found price text: "${priceText}"`);
            
            const priceMatch = priceText?.match(/\$?(\d+\.\d{2})/);
            if (priceMatch) {
              price = parseFloat(priceMatch[1]);
              console.log(`   ✅ Parsed price: $${price}`);
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      if (price) {
        results.push({
          itemName: product.name,
          price: price,
          unit: 'ea',
          inStock: true,
          url: product.url
        });
      } else {
        console.log(`   ❌ No price found`);
        results.push({
          itemName: product.name,
          price: null,
          unit: 'ea',
          inStock: false,
          url: product.url
        });
      }
      
      await page.waitForTimeout(2000);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error}`);
      results.push({
        itemName: product.name,
        price: null,
        unit: 'ea',
        inStock: false,
        url: product.url
      });
    }
  }
  
  await browser.close();
  console.log('\n✅ Scraping complete!');
  
  return results;
}