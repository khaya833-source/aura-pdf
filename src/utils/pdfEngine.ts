import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import type { Annotation, PageInfo, WatermarkConfig, PageNumberConfig } from '../types/pdf';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch (err) {
    console.warn('PDF.js worker setup warning:', err);
  }
}

/**
 * Load a PDF document with PDF.js for rendering
 */
export async function loadPDFForRendering(data: Uint8Array) {
  const bytes = new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Render a single PDF page to a canvas
 */
export async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.5,
  rotationOffset: number = 0
): Promise<{ width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const totalRotation = (page.rotate + rotationOffset) % 360;
  const viewport = page.getViewport({ scale, rotation: totalRotation });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Modern pdfjs-dist requires both canvasContext and canvas property
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await (page.render as any)(renderContext).promise;
  return { width: viewport.width, height: viewport.height };
}

/**
 * Extract all text from all pages of a PDF for search
 */
export async function extractDocumentText(pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<{ pageNumber: number; text: string }[]> {
  const pagesText: { pageNumber: number; text: string }[] = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageString = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pagesText.push({ pageNumber: i, text: pageString });
  }
  return pagesText;
}

/**
 * Helper to convert hex color (#ffffff or #fff) to pdf-lib rgb(r, g, b)
 */
export function hexToRgb(hex: string, defaultColor = rgb(0.1, 0.1, 0.1)) {
  if (!hex || !hex.startsWith('#')) return defaultColor;
  let cleanHex = hex.slice(1);
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return defaultColor;
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

/**
 * Export and burn all edits, drawings, signatures, stamps, watermarks,
 * page numbers, page rotations, and page reorganizations into a downloadable PDF binary.
 */
export async function exportEditedPDF({
  originalBytes,
  annotations,
  pagesInfo,
  watermark,
  pageNumbers,
}: {
  originalBytes: Uint8Array;
  annotations: Annotation[];
  pagesInfo: PageInfo[];
  watermark: WatermarkConfig;
  pageNumbers: PageNumberConfig;
}): Promise<Uint8Array> {
  const originalDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  const exportedDoc = await PDFDocument.create();

  const fontRegular = await exportedDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await exportedDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await exportedDoc.embedFont(StandardFonts.Courier);

  // Filter out deleted pages and sort by orderIndex
  const activePages = pagesInfo.filter((p) => !p.isDeleted);
  const totalActivePages = activePages.length;

  for (let outIndex = 0; outIndex < activePages.length; outIndex++) {
    const pageInfo = activePages[outIndex];
    // Copy the original page (0-indexed in pdf-lib)
    const [copiedPage] = await exportedDoc.copyPages(originalDoc, [pageInfo.pageNumber - 1]);
    
    // Set rotation
    if (pageInfo.currentRotation !== undefined) {
      copiedPage.setRotation(degrees((pageInfo.currentRotation) % 360));
    }

    const { width, height } = copiedPage.getSize();
    const pageAnnotations = annotations.filter((a) => a.pageNumber === pageInfo.pageNumber);

    // Render annotations for this page
    for (const ann of pageAnnotations) {
      // PDF coordinate system has (0,0) at bottom-left!
      // In our UI, x and y are given in percentage of page dimensions (0..100)
      const absX = (ann.x / 100) * width;
      const absY = height - (ann.y / 100) * height; // Invert Y
      const annWidth = ann.width ? (ann.width / 100) * width : 40;
      const annHeight = ann.height ? (ann.height / 100) * height : 20;

      if (ann.type === 'draw' || ann.type === 'highlight') {
        if (ann.points && ann.points.length > 1) {
          const strokeColor = hexToRgb(ann.strokeColor || '#ffbb00');
          const isHighlight = ann.type === 'highlight';
          const thickness = ann.strokeWidth || (isHighlight ? 12 : 2.5);
          const opacityVal = isHighlight ? 0.4 : (ann.opacity ?? 1);

          for (let p = 0; p < ann.points.length - 1; p++) {
            const p1 = ann.points[p];
            const p2 = ann.points[p + 1];
            copiedPage.drawLine({
              start: {
                x: (p1.x / 100) * width,
                y: height - (p1.y / 100) * height,
              },
              end: {
                x: (p2.x / 100) * width,
                y: height - (p2.y / 100) * height,
              },
              thickness,
              color: strokeColor,
              opacity: opacityVal,
            });
          }
        }
      } else if (ann.type === 'text') {
        if (ann.text) {
          const textColor = hexToRgb(ann.fontColor || '#1e293b');
          const fontSize = ann.fontSize || 13;
          copiedPage.drawText(ann.text, {
            x: absX,
            y: absY - fontSize,
            size: fontSize,
            font: ann.isBold ? fontBold : fontRegular,
            color: textColor,
          });
        }
      } else if (ann.type === 'shape') {
        const strokeColor = hexToRgb(ann.strokeColor || '#2563eb');
        const thickness = ann.strokeWidth || 2;
        const targetPdfY = height - ((ann.y + (ann.height || 0)) / 100) * height;

        if (ann.shapeType === 'rectangle') {
          copiedPage.drawRectangle({
            x: absX,
            y: targetPdfY,
            width: annWidth,
            height: annHeight,
            borderWidth: thickness,
            borderColor: strokeColor,
            color: ann.fillColor ? hexToRgb(ann.fillColor) : undefined,
            opacity: ann.opacity ?? 1,
          });
        } else if (ann.shapeType === 'circle') {
          const radius = Math.min(annWidth, annHeight) / 2;
          copiedPage.drawEllipse({
            x: absX + radius,
            y: targetPdfY + radius,
            xScale: radius,
            yScale: radius,
            borderWidth: thickness,
            borderColor: strokeColor,
            color: ann.fillColor ? hexToRgb(ann.fillColor) : undefined,
            opacity: ann.opacity ?? 1,
          });
        } else if (ann.shapeType === 'line' || ann.shapeType === 'arrow') {
          copiedPage.drawLine({
            start: { x: absX, y: absY },
            end: { x: absX + annWidth, y: targetPdfY },
            thickness,
            color: strokeColor,
          });
          if (ann.shapeType === 'arrow') {
            // Draw simple arrowhead
            copiedPage.drawCircle({
              x: absX + annWidth,
              y: targetPdfY,
              size: thickness * 2,
              color: strokeColor,
            });
          }
        }
      } else if (ann.type === 'redact') {
        // Redaction is a permanent solid black block
        const targetPdfY = height - ((ann.y + (ann.height || 0)) / 100) * height;
        copiedPage.drawRectangle({
          x: absX,
          y: targetPdfY,
          width: annWidth,
          height: annHeight,
          color: rgb(0, 0, 0),
          opacity: 1,
        });
        // Optional micro label inside redaction
        if (annWidth > 50 && annHeight > 14) {
          copiedPage.drawText('REDACTED', {
            x: absX + 4,
            y: targetPdfY + annHeight / 2 - 3,
            size: 7,
            font: fontMono,
            color: rgb(0.8, 0.8, 0.8),
          });
        }
      } else if (ann.type === 'stamp') {
        const stampText = ann.stampType || 'APPROVED';
        const stampColors: Record<string, { border: ReturnType<typeof rgb>; fill: ReturnType<typeof rgb> }> = {
          APPROVED: { border: rgb(0.1, 0.65, 0.3), fill: rgb(0.93, 0.98, 0.94) },
          CONFIDENTIAL: { border: rgb(0.85, 0.2, 0.2), fill: rgb(0.99, 0.94, 0.94) },
          DRAFT: { border: rgb(0.4, 0.45, 0.55), fill: rgb(0.96, 0.97, 0.98) },
          FINAL: { border: rgb(0.15, 0.4, 0.85), fill: rgb(0.94, 0.96, 1.0) },
          PAID: { border: rgb(0.05, 0.6, 0.4), fill: rgb(0.93, 0.98, 0.95) },
          URGENT: { border: rgb(0.9, 0.45, 0.1), fill: rgb(0.99, 0.96, 0.92) },
          VOID: { border: rgb(0.7, 0.1, 0.1), fill: rgb(0.98, 0.92, 0.92) },
        };
        const palette = stampColors[stampText] || stampColors.APPROVED;
        const stampW = Math.max(annWidth, 110);
        const stampH = Math.max(annHeight, 34);
        const targetPdfY = height - ((ann.y + (ann.height || 0)) / 100) * height;

        copiedPage.drawRectangle({
          x: absX,
          y: targetPdfY,
          width: stampW,
          height: stampH,
          borderWidth: 2,
          borderColor: palette.border,
          color: palette.fill,
          opacity: 0.92,
        });

        copiedPage.drawText(stampText, {
          x: absX + 10,
          y: targetPdfY + stampH / 2 - 5,
          size: 11,
          font: fontBold,
          color: palette.border,
        });
      } else if (ann.type === 'signature') {
        if (ann.signatureDataUrl) {
          try {
            const pngImage = await exportedDoc.embedPng(ann.signatureDataUrl);
            const targetPdfY = height - ((ann.y + (ann.height || 0)) / 100) * height;
            copiedPage.drawImage(pngImage, {
              x: absX,
              y: targetPdfY,
              width: annWidth,
              height: annHeight,
            });
          } catch (e) {
            console.error('Failed to embed signature PNG:', e);
          }
        }
      }
    }

    // Apply Watermark if enabled
    if (watermark && watermark.enabled && watermark.text.trim()) {
      const watermarkColor = hexToRgb(watermark.color || '#94a3b8');
      const textWidth = fontBold.widthOfTextAtSize(watermark.text, watermark.fontSize || 42);
      copiedPage.drawText(watermark.text, {
        x: width / 2 - textWidth / 2,
        y: height / 2,
        size: watermark.fontSize || 42,
        font: fontBold,
        color: watermarkColor,
        opacity: watermark.opacity ?? 0.15,
        rotate: degrees(watermark.rotation || 45),
      });
    }

    // Apply Page Numbers if enabled
    if (pageNumbers && pageNumbers.enabled) {
      const currentPageNum = outIndex + 1;
      let text = `Page ${currentPageNum} of ${totalActivePages}`;
      if (pageNumbers.format === 'X of Y') text = `${currentPageNum} of ${totalActivePages}`;
      if (pageNumbers.format === 'X') text = `${currentPageNum}`;
      if (pageNumbers.format === 'Page X') text = `Page ${currentPageNum}`;

      const numColor = hexToRgb(pageNumbers.color || '#64748b');
      const fontSize = pageNumbers.fontSize || 9;
      const textWidth = fontRegular.widthOfTextAtSize(text, fontSize);

      let numX = width / 2 - textWidth / 2;
      let numY = 24;

      if (pageNumbers.position === 'bottom-right') {
        numX = width - textWidth - 40;
      } else if (pageNumbers.position === 'bottom-left') {
        numX = 40;
      } else if (pageNumbers.position === 'top-right') {
        numX = width - textWidth - 40;
        numY = height - 30;
      } else if (pageNumbers.position === 'top-center') {
        numY = height - 30;
      }

      copiedPage.drawText(text, {
        x: numX,
        y: numY,
        size: fontSize,
        font: fontRegular,
        color: numColor,
      });
    }

    exportedDoc.addPage(copiedPage);
  }

  return await exportedDoc.save();
}

/**
 * Merge multiple PDF byte arrays into a single document
 */
export async function mergePDFs(pdfByteArrays: Uint8Array[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();
  for (const bytes of pdfByteArrays) {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }
  return await mergedDoc.save();
}

/**
 * Split or extract specific pages from a PDF into a new PDF
 */
export async function splitPDF(originalBytes: Uint8Array, pageNumbers: number[]): Promise<Uint8Array> {
  const originalDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  const splitDoc = await PDFDocument.create();
  const zeroBasedIndices = pageNumbers.map((p) => p - 1).filter((idx) => idx >= 0 && idx < originalDoc.getPageCount());
  const copiedPages = await splitDoc.copyPages(originalDoc, zeroBasedIndices);
  for (const page of copiedPages) {
    splitDoc.addPage(page);
  }
  return await splitDoc.save();
}

/**
 * Convert images (PNG/JPEG) into a unified PDF
 */
export async function convertImagesToPDF(
  images: { dataUrl: string; width?: number; height?: number }[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const img of images) {
    const isPng = img.dataUrl.startsWith('data:image/png');
    const imageBytes = Uint8Array.from(atob(img.dataUrl.split(',')[1]), (c) => c.charCodeAt(0));
    const embeddedImg = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);

    const dims = embeddedImg.scale(1);
    // Fit onto standard page or image dimensions
    const page = pdfDoc.addPage([dims.width, dims.height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: dims.width,
      height: dims.height,
    });
  }

  return await pdfDoc.save();
}
