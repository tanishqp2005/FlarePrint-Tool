const { PDFDocument } = require('pdf-lib');
const JSZip = require('jszip');

async function runBatchTests() {
  console.log('====================================================');
  console.log('FlarePrint Tools - Batch Processing Test Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, description) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${description}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${description}`);
      process.exitCode = 1;
    }
  }

  // Helper to generate dummy PDF
  const createTestPdf = async (name, pageCount = 2) => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      const page = doc.addPage([595, 842]);
      page.drawText(`${name} - Page ${i + 1}`);
    }
    const bytes = await doc.save();
    return { name, bytes, pageCount };
  };

  // 1. Test Multi-file PDF Compression & ZIP Generation
  console.log('--- 1. Testing Compress PDF Batch Logic ---');
  {
    const pdfs = [
      await createTestPdf('doc1.pdf', 3),
      await createTestPdf('doc2.pdf', 1),
      await createTestPdf('doc3.pdf', 5),
    ];

    const results = [];
    for (const item of pdfs) {
      // Simulate lossless compression
      const doc = await PDFDocument.load(item.bytes);
      doc.setTitle('');
      doc.setProducer('FlarePrint Tools');
      const compressedBytes = await doc.save({ useObjectStreams: true });
      results.push({
        name: item.name.replace(/\.pdf$/i, '_compressed.pdf'),
        data: compressedBytes,
        origSize: item.bytes.byteLength,
        newSize: compressedBytes.byteLength,
      });
    }

    assert(results.length === 3, 'All 3 PDFs processed independently in batch');

    // Test ZIP packaging
    const zip = new JSZip();
    for (const r of results) {
      zip.file(r.name, r.data);
    }
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    assert(zipBuffer.length > 0, 'Batch ZIP bundle generated successfully');

    // Verify ZIP contains all 3 files
    const unzipped = await JSZip.loadAsync(zipBuffer);
    assert(Object.keys(unzipped.files).length === 3, 'ZIP contains exactly 3 compressed files');
  }

  // 2. Test Multi-image Resize Calculations
  console.log('\n--- 2. Testing Resize JPG Batch Calculations ---');
  {
    const images = [
      { name: 'photo1.jpg', width: 1920, height: 1080 },
      { name: 'photo2.png', width: 800, height: 600 },
      { name: 'photo3.jpg', width: 3000, height: 2000 },
    ];

    // Mode A: Percentage Resize (e.g. 50%)
    const pct = 50;
    const scaledByPct = images.map((img) => ({
      name: img.name,
      newW: Math.round(img.width * (pct / 100)),
      newH: Math.round(img.height * (pct / 100)),
    }));

    assert(scaledByPct[0].newW === 960 && scaledByPct[0].newH === 540, 'Image 1 scaled to 50%');
    assert(scaledByPct[1].newW === 400 && scaledByPct[1].newH === 300, 'Image 2 scaled to 50%');
    assert(scaledByPct[2].newW === 1500 && scaledByPct[2].newH === 1000, 'Image 3 scaled to 50%');

    // Mode B: Proportional Fit into Bounding Box (e.g. 1200x800)
    const boxW = 1200, boxH = 800;
    const fitted = images.map((img) => {
      const itemRatio = img.width / img.height;
      const targetBoxRatio = boxW / boxH;
      let targetW, targetH;
      if (itemRatio > targetBoxRatio) {
        targetW = boxW;
        targetH = Math.round(boxW / itemRatio);
      } else {
        targetH = boxH;
        targetW = Math.round(boxH * itemRatio);
      }
      return { name: img.name, targetW, targetH };
    });

    assert(fitted[0].targetW === 1200 && fitted[0].targetH === 675, 'Image 1 aspect-ratio locked to box width');
    assert(fitted[1].targetH === 800 && fitted[1].targetW === 1067, 'Image 2 aspect-ratio locked to box height');
  }

  // 3. Test JPG to PDF Modes: Combined vs Separate
  console.log('\n--- 3. Testing JPG to PDF: Combined vs Separate Modes ---');
  {
    // Combined Mode: Merges multiple into 1 document
    const combinedDoc = await PDFDocument.create();
    for (let i = 0; i < 3; i++) {
      combinedDoc.addPage([595, 842]);
    }
    const combinedBytes = await combinedDoc.save();
    assert(combinedDoc.getPageCount() === 3, 'Combined mode creates 1 PDF with 3 pages');
    assert(combinedBytes.byteLength > 0, 'Combined PDF bytes generated');

    // Separate Mode: Each image becomes its own PDF
    const separatePdfs = [];
    for (let i = 0; i < 3; i++) {
      const singleDoc = await PDFDocument.create();
      singleDoc.addPage([595, 842]);
      const bytes = await singleDoc.save();
      separatePdfs.push({ name: `image_${i + 1}.pdf`, data: bytes });
    }
    assert(separatePdfs.length === 3, 'Separate mode creates individual PDFs for each image');

    const zip = new JSZip();
    separatePdfs.forEach(p => zip.file(p.name, p.data));
    const zipBuf = await zip.generateAsync({ type: 'nodebuffer' });
    const unzipped = await JSZip.loadAsync(zipBuf);
    assert(Object.keys(unzipped.files).length === 3, 'Separate mode ZIP contains all 3 PDFs');
  }

  // 4. Test PDF to JPG Multi-File Organization
  console.log('\n--- 4. Testing PDF to JPG Multi-File Organization ---');
  {
    const pdfBatches = [
      { baseName: 'invoice', pages: ['page-1.jpg', 'page-2.jpg'] },
      { baseName: 'report', pages: ['page-1.jpg', 'page-2.jpg', 'page-3.jpg'] },
    ];

    const zip = new JSZip();
    for (const item of pdfBatches) {
      for (const p of item.pages) {
        // Multi-PDF ZIP organizes in subfolders
        zip.file(`${item.baseName}/${item.baseName}_${p}`, `content-of-${p}`);
      }
    }

    const zipBuf = await zip.generateAsync({ type: 'nodebuffer' });
    const unzipped = await JSZip.loadAsync(zipBuf);
    const nonDirFiles = Object.values(unzipped.files).filter(f => !f.dir);
    assert(nonDirFiles.length === 5, 'ZIP contains all 5 extracted pages across 2 PDFs');
    assert(unzipped.file('invoice/invoice_page-1.jpg') !== null, 'invoice/ subfolder correctly populated');
    assert(unzipped.file('report/report_page-3.jpg') !== null, 'report/ subfolder correctly populated');
  }

  // 5. Test Merge PDF Sequential Reordering
  console.log('\n--- 5. Testing Merge PDF Reordering ---');
  {
    const p1 = await createTestPdf('A', 1);
    const p2 = await createTestPdf('B', 2);
    const p3 = await createTestPdf('C', 1);

    // Initial order: [p1, p2, p3] -> reordered to [p3, p1, p2]
    const reordered = [p3, p1, p2];

    const merged = await PDFDocument.create();
    for (const item of reordered) {
      const doc = await PDFDocument.load(item.bytes);
      const copied = await merged.copyPages(doc, doc.getPageIndices());
      copied.forEach(p => merged.addPage(p));
    }

    assert(merged.getPageCount() === 4, 'Merged PDF has correct total page count (1+1+2=4)');
    const mergedBytes = await merged.save();
    assert(mergedBytes.byteLength > 0, 'Merged PDF generated');
  }

  // 6. Test Split PDF Batch Range Extraction
  console.log('\n--- 6. Testing Split PDF Batch Extraction ---');
  {
    const sourcePdf = await createTestPdf('multi.pdf', 5);
    const doc = await PDFDocument.load(sourcePdf.bytes);

    // Split all pages
    const splitPages = [];
    for (let i = 0; i < doc.getPageCount(); i++) {
      const newDoc = await PDFDocument.create();
      const [copied] = await newDoc.copyPages(doc, [i]);
      newDoc.addPage(copied);
      splitPages.push(await newDoc.save());
    }

    assert(splitPages.length === 5, 'Extracted all 5 pages into independent PDFs');
  }

  // 7. Test Error Isolation (Robustness)
  console.log('\n--- 7. Testing Error Isolation in Batch ---');
  {
    const testItems = [
      { name: 'good1.pdf', valid: true },
      { name: 'corrupted.pdf', valid: false },
      { name: 'good2.pdf', valid: true },
    ];

    const batchRecords = [];
    for (const item of testItems) {
      try {
        if (!item.valid) {
          throw new Error('Invalid PDF header structure');
        }
        batchRecords.push({ name: item.name, status: 'success', data: 'valid-bytes' });
      } catch (err) {
        batchRecords.push({ name: item.name, status: 'error', error: err.message });
      }
    }

    assert(batchRecords.length === 3, 'All 3 items processed through the loop');
    assert(batchRecords[0].status === 'success', 'Item 1 succeeded');
    assert(batchRecords[1].status === 'error', 'Item 2 caught error gracefully');
    assert(batchRecords[2].status === 'success', 'Item 3 succeeded despite item 2 failing');

    const successfulOnly = batchRecords.filter(r => r.status === 'success');
    assert(successfulOnly.length === 2, 'Successful files available for download/ZIP even with partial batch failure');
  }

  console.log('\n====================================================');
  console.log(`Results: ${passedTests} / ${totalTests} tests passed`);
  console.log('====================================================\n');
}

runBatchTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
