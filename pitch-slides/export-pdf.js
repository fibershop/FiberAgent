const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  
  const filePath = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  // Hide navigation buttons
  await page.evaluate(() => {
    document.querySelector('.nav').style.display = 'none';
    document.querySelector('.slide-counter').style.display = 'none';
  });
  
  // Screenshot each slide as PNG
  const totalSlides = 13;
  
  for (let i = 1; i <= totalSlides; i++) {
    await page.evaluate((n) => {
      document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
      document.getElementById('slide' + n).classList.add('active');
    }, i);
    
    await new Promise(r => setTimeout(r, 300));
    
    const screenshotPath = path.resolve(__dirname, `slide-${String(i).padStart(2, '0')}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`✅ Slide ${i}/${totalSlides}`);
  }
  
  // Generate PDF with all slides
  await page.evaluate(() => {
    const slides = document.querySelectorAll('.slide');
    slides.forEach(s => {
      s.style.display = 'flex';
      s.style.pageBreakAfter = 'always';
    });
  });
  
  const pdfPath = path.resolve(__dirname, 'Fiber-Pitch-Deck.pdf');
  await page.pdf({
    path: pdfPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: false,
  });
  
  console.log(`\n📄 PDF: ${pdfPath}`);
  console.log(`🖼️  PNGs: slide-01.png through slide-13.png`);
  
  await browser.close();
})();
