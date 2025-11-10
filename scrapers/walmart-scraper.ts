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

export async function scrapeWalmartPrices(products: ProductInput[]): Promise<ScrapedPrice[]> {
  console.log('🚀 Starting Walmart scraper...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const results: ScrapedPrice[] = [];
  
  for (const product of products) {
    console.log(`\n🔍 Scraping: ${product.name}`);
    console.log(`   URL: ${product.url}`);
    
    try {
      // Go directly to product page
      await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait a bit for dynamic content
      await page.waitForTimeout(3000);

      // Debug: Save the page HTML
      const html = await page.content();
      const fs = require('fs');
      fs.writeFileSync('debug-walmart.html', html);
      console.log('   📄 Saved page HTML to debug-walmart.html');
      
      // Try multiple price selectors (Walmart uses different ones)
      const priceSelectors = [
        '[itemprop="price"]',
        '[data-testid="price-wrap"]',
        '.price-characteristic',
        'span[class*="price"]'
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
          // Try next selector
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
      
      // Be polite - wait between requests
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