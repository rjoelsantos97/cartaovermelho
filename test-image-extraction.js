// Test image extraction using simple fetch and cheerio
const cheerio = require('cheerio');

async function testImageExtraction() {
  const testUrl = 'https://www.abola.pt/noticias/nao-tirei-o-joao-felix-ao-benfica-tirei-o-marcos-leonardo-por-euro40-milhoes-2025073018160085089';
  
  console.log('🔍 Testing image extraction for João Félix article...');
  console.log('URL:', testUrl);
  console.log('');
  
  try {
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    console.log('📄 Page loaded successfully');
    
    // Strategy 1: Look for source elements with sportal365images.com in srcset
    const sportalSources = $('source[srcset*="sportal365images.com"]');
    console.log(`🔍 Found ${sportalSources.length} source elements with sportal365images.com`);
    
    let imageUrl = '';
    
    if (sportalSources.length > 0) {
      let mainArticleImage = '';
      let largestImage = '';
      let firstImage = '';
      
      sportalSources.each((i, element) => {
        const $source = $(element);
        const srcset = $source.attr('srcset') || '';
        const type = $source.attr('type') || '';
        console.log(`   Source ${i + 1}: type="${type}", srcset="${srcset.substring(0, 100)}..."`);
        
        if (srcset) {
          const extractedUrl = srcset.split(' ')[0].replace(/&amp;/g, '&');
          if (extractedUrl.includes('sportal365images.com')) {
            
            // Store first image as fallback
            if (!firstImage) {
              firstImage = extractedUrl;
            }
            
            // Look for larger images (main article images are usually 770px wide)
            if (extractedUrl.includes('fit(770:)') || extractedUrl.includes('fit(:770)')) {
              if (!largestImage) {
                largestImage = extractedUrl;
                console.log(`   🎯 Found large image (770px): ${extractedUrl.substring(0, 100)}...`);
              }
            }
            
            // Look for images within main content area
            const parentElement = $source.closest('article, .article, main, [class*="content"]');
            if (parentElement.length > 0 && !mainArticleImage) {
              mainArticleImage = extractedUrl;
              console.log(`   📰 Found main article image: ${extractedUrl.substring(0, 100)}...`);
            }
          }
        }
      });
      
      // Priority: largest image > main article image > first image
      imageUrl = largestImage || mainArticleImage || firstImage;
      if (imageUrl) {
        console.log('   ✅ Selected URL strategy:', largestImage ? 'largest' : mainArticleImage ? 'main article' : 'first');
      }
    }
    
    // Strategy 2: Look for ANY source element with srcset
    if (!imageUrl) {
      const allSources = $('source[srcset]');
      console.log(`🔍 Found ${allSources.length} total source elements with srcset`);
      
      if (allSources.length > 0) {
        allSources.each((i, element) => {
          const $source = $(element);
          const srcset = $source.attr('srcset') || '';
          const type = $source.attr('type') || '';
          console.log(`   Source ${i + 1}: type="${type}", srcset="${srcset.substring(0, 100)}..."`);
          
          if (!imageUrl && srcset) {
            const extractedUrl = srcset.split(' ')[0].replace(/&amp;/g, '&');
            if (extractedUrl.match(/\.(jpeg|jpg|png|webp)/i) || extractedUrl.includes('sportal365images.com')) {
              imageUrl = extractedUrl;
              console.log('   ✅ Selected URL:', imageUrl);
            }
          }
        });
      }
    }
    
    console.log('');
    if (imageUrl) {
      console.log('✅ SUCCESS: Image extracted successfully!');
      console.log('🖼️  Final Image URL:');
      console.log(imageUrl);
    } else {
      console.log('❌ FAILED: No image found');
    }
    
  } catch (error) {
    console.error('💥 ERROR during extraction:', error.message);
  }
}

testImageExtraction();