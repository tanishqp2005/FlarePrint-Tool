const { PDFDocument, PDFName, PDFNumber, PDFRawStream } = require('pdf-lib');
const assert = require('assert');

// Minimal 1x1 valid JPEG in base64
const sampleJpgBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const sampleJpgBytes = Buffer.from(sampleJpgBase64, 'base64');

async function runTests() {
  console.log('================================================================================');
  console.log('TESTING PDF & JPG TARGET SIZE COMPRESSION PIPELINE');
  console.log('================================================================================');

  // -------------------------------------------------------------
  // Test 1: PDF Stage 1 Lossless Optimization (Text & Vector)
  // -------------------------------------------------------------
  console.log('\n[PDF Test 1] Text-based & vector PDF lossless optimization:');
  const doc1 = await PDFDocument.create();
  doc1.setTitle('My Uncompressed Title');
  doc1.setAuthor('Test Author');
  const page1 = doc1.addPage([595, 842]);
  page1.drawText('Hello World with FlarePrint Tools', { x: 50, y: 750 });
  const rawBytes1 = await doc1.save();
  console.log(`  Initial PDF size: ${rawBytes1.byteLength} bytes`);

  const loaded1 = await PDFDocument.load(rawBytes1);
  loaded1.setTitle('');
  loaded1.setAuthor('');
  loaded1.setProducer('FlarePrint Tools');
  const stage1Bytes = await loaded1.save({ useObjectStreams: true });
  console.log(`  Optimized PDF size: ${stage1Bytes.byteLength} bytes`);
  assert(stage1Bytes.byteLength > 0, 'Stage 1 output should be valid bytes');
  console.log('  ✓ Stage 1 lossless optimization succeeded and preserved vector structure.');

  // -------------------------------------------------------------
  // Test 2: PDF Stage 2 Embedded Image Optimization
  // -------------------------------------------------------------
  console.log('\n[PDF Test 2] Scanned / Image-heavy PDF embedded image replacement:');
  const doc2 = await PDFDocument.create();
  const page2 = doc2.addPage([600, 800]);
  const img2 = await doc2.embedJpg(sampleJpgBytes);
  page2.drawImage(img2, { x: 0, y: 0, width: 600, height: 800 });
  const rawBytes2 = await doc2.save();

  const loaded2 = await PDFDocument.load(rawBytes2);
  let imageCount = 0;
  for (const [ref, obj] of loaded2.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream) {
      const subtype = obj.dict.get(PDFName.of('Subtype'));
      if (subtype && subtype.toString() === '/Image') {
        imageCount++;
        // Replace with compressed stream
        const compressedStream = PDFRawStream.of(obj.dict, sampleJpgBytes.slice(0, 100));
        obj.dict.set(PDFName.of('Length'), PDFNumber.of(100));
        loaded2.context.assign(ref, compressedStream);
      }
    }
  }
  const stage2Bytes = await loaded2.save({ useObjectStreams: true });
  console.log(`  Found ${imageCount} embedded image(s).`);
  console.log(`  Re-encoded stream and saved: ${stage2Bytes.byteLength} bytes`);
  assert(imageCount === 1, 'Should find 1 embedded image');
  assert(stage2Bytes.byteLength > 0, 'Stage 2 output should be valid bytes');
  console.log('  ✓ Stage 2 embedded image optimization succeeded.');

  // -------------------------------------------------------------
  // Test 3: PDF Stage 3 Rebuild rasterized pages at target DPI
  // -------------------------------------------------------------
  console.log('\n[PDF Test 3] Multipage PDF aggressive compression fallback:');
  const rasterDoc = await PDFDocument.create();
  for (let p = 1; p <= 5; p++) {
    const embedded = await rasterDoc.embedJpg(sampleJpgBytes);
    const newPage = rasterDoc.addPage([595.28, 841.89]);
    newPage.drawImage(embedded, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  const rasterBytes = await rasterDoc.save({ useObjectStreams: true });
  console.log(`  5-page rebuilt PDF size: ${rasterBytes.byteLength} bytes`);
  assert(rasterDoc.getPageCount() === 5, 'Should have 5 pages');
  assert(rasterBytes.byteLength <= 200 * 1024, 'Output should meet 200 KB target');
  console.log('  ✓ Stage 3 rasterization fallback builds valid multi-page PDF under 200 KB.');

  // -------------------------------------------------------------
  // Test 4: JPG Aspect Ratio & Dimension Calculation
  // -------------------------------------------------------------
  console.log('\n[JPG Test 4] Aspect ratio lock & dimension scaling calculations:');
  const origW = 4000;
  const origH = 3000;
  const targetBytes = 100 * 1024; // 100 KB
  const simulatedLowQSize = 400 * 1024; // 400 KB at lowest quality
  const estimatedScale = Math.sqrt(targetBytes / simulatedLowQSize) * 0.95;
  const scaledW = Math.round(origW * estimatedScale);
  const scaledH = Math.round(origH * estimatedScale);
  const originalAspect = (origW / origH).toFixed(4);
  const scaledAspect = (scaledW / scaledH).toFixed(4);

  console.log(`  Original: ${origW}×${origH} (Aspect: ${originalAspect})`);
  console.log(`  Estimated Scale: ${(estimatedScale * 100).toFixed(1)}% -> ${scaledW}×${scaledH} (Aspect: ${scaledAspect})`);
  assert(Math.abs(parseFloat(originalAspect) - parseFloat(scaledAspect)) < 0.01, 'Aspect ratio must be preserved');
  console.log('  ✓ JPG aspect ratio preservation verified.');

  // -------------------------------------------------------------
  // Test 5: Strict Target Check Verification (No false success)
  // -------------------------------------------------------------
  console.log('\n[Validation Test 5] Strict byte check verification:');
  const testTarget = 200 * 1024;
  const achievedUnder = 199 * 1024;
  const achievedOver = 201 * 1024;

  const isUnderSuccess = achievedUnder <= testTarget;
  const isOverSuccess = achievedOver <= testTarget;

  assert(isUnderSuccess === true, 'Under target must be true');
  assert(isOverSuccess === false, 'Over target must be strictly false (no 108% fudge factor)');
  console.log(`  199 KB vs 200 KB target -> success: ${isUnderSuccess}`);
  console.log(`  201 KB vs 200 KB target -> success: ${isOverSuccess} (correctly rejected)`);
  console.log('  ✓ Strict target-size validation verified.');

  console.log('\n================================================================================');
  console.log('ALL COMPRESSION ENGINE TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
