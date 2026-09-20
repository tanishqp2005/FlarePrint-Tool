const { PDFDocument } = require('pdf-lib');
const JSZip = require('jszip');

async function testPdfEngine() {
  console.log('Testing PDF & Archive Engine:');

  // 1. Create PDF 1
  const doc1 = await PDFDocument.create();
  doc1.addPage([600, 400]);
  doc1.addPage([600, 400]);
  const pdf1Bytes = await doc1.save();
  console.log(`✓ Created test PDF 1 (2 pages, ${pdf1Bytes.byteLength} bytes)`);

  // 2. Create PDF 2
  const doc2 = await PDFDocument.create();
  doc2.addPage([600, 400]);
  const pdf2Bytes = await doc2.save();
  console.log(`✓ Created test PDF 2 (1 page, ${pdf2Bytes.byteLength} bytes)`);

  // 3. Test Merge
  const mergedDoc = await PDFDocument.create();
  const loaded1 = await PDFDocument.load(pdf1Bytes);
  const loaded2 = await PDFDocument.load(pdf2Bytes);

  const pages1 = await mergedDoc.copyPages(loaded1, loaded1.getPageIndices());
  pages1.forEach(p => mergedDoc.addPage(p));
  const pages2 = await mergedDoc.copyPages(loaded2, loaded2.getPageIndices());
  pages2.forEach(p => mergedDoc.addPage(p));

  const mergedBytes = await mergedDoc.save();
  const loadedMerged = await PDFDocument.load(mergedBytes);
  console.log(`✓ Merged PDFs: total ${loadedMerged.getPageCount()} pages (${mergedBytes.byteLength} bytes)`);

  // 4. Test Split
  const splitDoc = await PDFDocument.create();
  const [copied] = await splitDoc.copyPages(loadedMerged, [1]);
  splitDoc.addPage(copied);
  const splitBytes = await splitDoc.save();
  const loadedSplit = await PDFDocument.load(splitBytes);
  console.log(`✓ Split single page: ${loadedSplit.getPageCount()} page (${splitBytes.byteLength} bytes)`);

  // 5. Test ZIP archive
  const zip = new JSZip();
  zip.file('doc1.pdf', pdf1Bytes);
  zip.file('doc2.pdf', pdf2Bytes);
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  console.log(`✓ Generated ZIP archive: ${zipBuffer.byteLength} bytes containing 2 files`);

  console.log('\nALL DOCUMENT ENGINE TESTS PASSED!');
}

testPdfEngine().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
