import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface SampleDocMeta {
  id: string;
  title: string;
  description: string;
  category: 'Contract' | 'Financial' | 'Invoice';
  pages: number;
}

export const SAMPLE_DOCUMENTS: SampleDocMeta[] = [
  {
    id: 'consulting-agreement',
    title: 'Master Consulting Agreement.pdf',
    description: 'B2B Services contract with terms, milestone deliverables, and signature blocks.',
    category: 'Contract',
    pages: 2,
  },
  {
    id: 'financial-report',
    title: 'Q3 Financial & Risk Brief.pdf',
    description: 'Executive briefing with quarterly earnings, budget breakdown, and confidential metrics.',
    category: 'Financial',
    pages: 2,
  },
  {
    id: 'project-invoice',
    title: 'Creative Proposal & Invoice.pdf',
    description: 'Design agency statement of work, milestone schedule, and billing details.',
    category: 'Invoice',
    pages: 1,
  },
];

export async function generateSamplePDF(id: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const primary = rgb(0.08, 0.12, 0.2); // Dark slate
  const secondary = rgb(0.35, 0.4, 0.48); // Muted gray
  const accent = rgb(0.85, 0.4, 0.15); // Warm copper
  const border = rgb(0.88, 0.9, 0.93); // Divider

  if (id === 'financial-report') {
    // PAGE 1: Financial Brief
    const page1 = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page1.getSize();

    // Top Header band
    page1.drawRectangle({
      x: 0,
      y: height - 80,
      width: width,
      height: 80,
      color: rgb(0.97, 0.98, 0.99),
    });

    page1.drawText('VALENCE CORP // CAPITAL MARKETS DIVISION', {
      x: 40,
      y: height - 42,
      size: 9,
      font: fontMono,
      color: secondary,
    });

    page1.drawText('Q3 Financial & Strategic Performance Brief', {
      x: 40,
      y: height - 66,
      size: 18,
      font: fontBold,
      color: primary,
    });

    page1.drawLine({
      start: { x: 40, y: height - 80 },
      end: { x: width - 40, y: height - 80 },
      thickness: 1,
      color: border,
    });

    // Executive Summary
    page1.drawText('1. Executive Overview & Macro Operating Conditions', {
      x: 40,
      y: height - 110,
      size: 12,
      font: fontBold,
      color: primary,
    });

    const summaryText = [
      'During the third fiscal quarter, consolidated revenue reached $42.8M, representing an 18.4% year-over-year',
      'expansion across enterprise software licenses and recurring managed services. Net operating margin held',
      'firm at 28.6% despite sector-wide inflationary pressures on computing infrastructure and compute clusters.',
      'Cash flow from operations totaled $14.2M, providing ample liquidity for debt-service and R&D allocation.',
    ];
    let currY = height - 130;
    for (const line of summaryText) {
      page1.drawText(line, { x: 40, y: currY, size: 9.5, font: fontRegular, color: primary });
      currY -= 15;
    }

    // Metric Summary Table Header
    currY -= 20;
    page1.drawText('2. Key Financial Indicators (in USD Millions)', {
      x: 40,
      y: currY,
      size: 12,
      font: fontBold,
      color: primary,
    });

    currY -= 25;
    page1.drawRectangle({
      x: 40,
      y: currY - 6,
      width: width - 80,
      height: 24,
      color: rgb(0.95, 0.96, 0.98),
    });

    page1.drawText('METRIC / SEGMENT', { x: 50, y: currY, size: 8.5, font: fontBold, color: primary });
    page1.drawText('Q3 ACTUAL', { x: 230, y: currY, size: 8.5, font: fontBold, color: primary });
    page1.drawText('Q3 TARGET', { x: 340, y: currY, size: 8.5, font: fontBold, color: primary });
    page1.drawText('VARIANCE', { x: 450, y: currY, size: 8.5, font: fontBold, color: primary });

    const rows = [
      ['Enterprise Software Revenue', '$28.4M', '$26.5M', '+7.1%'],
      ['Platform Subscriptions (ARR)', '$11.8M', '$11.0M', '+7.2%'],
      ['Professional Services', '$2.6M', '$3.0M', '-13.3%'],
      ['Gross Profit Margin', '74.2%', '72.0%', '+2.2% pts'],
      ['Operating Income (EBITDA)', '$12.2M', '$10.8M', '+12.9%'],
      ['R&D Expenditure (Proprietary Engine)', '$7.4M', '$7.1M', '+4.2%'],
    ];

    for (const row of rows) {
      currY -= 22;
      page1.drawLine({
        start: { x: 40, y: currY + 16 },
        end: { x: width - 40, y: currY + 16 },
        thickness: 0.5,
        color: border,
      });
      page1.drawText(row[0], { x: 50, y: currY, size: 9, font: fontRegular, color: primary });
      page1.drawText(row[1], { x: 230, y: currY, size: 9, font: fontMono, color: primary });
      page1.drawText(row[2], { x: 340, y: currY, size: 9, font: fontMono, color: secondary });
      page1.drawText(row[3], { x: 450, y: currY, size: 9, font: fontBold, color: row[3].startsWith('+') ? rgb(0.1, 0.6, 0.3) : accent });
    }

    // Confidential Risk Notes (Great target for Redaction feature!)
    currY -= 35;
    page1.drawText('3. Confidential Risk Exposure & Sovereign Exposure Notes', {
      x: 40,
      y: currY,
      size: 12,
      font: fontBold,
      color: primary,
    });

    currY -= 20;
    const sensitiveNotes = [
      '[CONFIDENTIAL / NOT FOR PUBLIC DISTRIBUTION]',
      '1. Pending litigation in Delaware Chancery Court (Civil Action No. 2026-0418): Settlement reserve set at $3,500,000.',
      '2. Primary treasury account hold: SVB Liquidity Pool #4492-9184 containing $18,400,000 cash equivalent balance.',
      '3. Key Personnel Retention Bonus liability: Chief Architect stock incentive tranche valued at $850,000 vesting Nov 2026.',
      '4. Sovereign regulatory audit regarding cross-border cloud telemetry under EU-US Data Bridge framework.',
    ];

    for (const note of sensitiveNotes) {
      const isHeader = note.startsWith('[CONFIDENTIAL');
      page1.drawText(note, {
        x: 40,
        y: currY,
        size: 8.5,
        font: isHeader ? fontBold : fontRegular,
        color: isHeader ? rgb(0.8, 0.2, 0.2) : primary,
      });
      currY -= 16;
    }

    // Footer
    page1.drawText('Confidential — For Board of Directors Review Only', {
      x: 40,
      y: 35,
      size: 8,
      font: fontRegular,
      color: secondary,
    });
    page1.drawText('Page 1 of 2', {
      x: width - 85,
      y: 35,
      size: 8,
      font: fontMono,
      color: secondary,
    });

    // PAGE 2: Strategic Outlook & Signoff
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    page2.drawText('4. Fiscal Year 2027 Capital Allocation Strategy', {
      x: 40,
      y: height - 60,
      size: 14,
      font: fontBold,
      color: primary,
    });

    const page2Text = [
      'The executive committee recommends an aggregate capital deployment of $24.0M towards infrastructure modernization,',
      'specifically transitioning on-premises inference pipelines to elastic sovereign cloud clusters.',
      'Targeted ARR milestone for year-end 2027 is established at $65.0M with minimum free cash flow yield of 22%.',
    ];
    let p2Y = height - 90;
    for (const line of page2Text) {
      page2.drawText(line, { x: 40, y: p2Y, size: 9.5, font: fontRegular, color: primary });
      p2Y -= 16;
    }

    // Audit and Approval Signatures
    p2Y -= 40;
    page2.drawText('5. Executive Certification and Audit Committee Approval', {
      x: 40,
      y: p2Y,
      size: 12,
      font: fontBold,
      color: primary,
    });

    p2Y -= 60;
    page2.drawLine({ start: { x: 40, y: p2Y }, end: { x: 250, y: p2Y }, thickness: 1, color: primary });
    page2.drawLine({ start: { x: 300, y: p2Y }, end: { x: 510, y: p2Y }, thickness: 1, color: primary });

    page2.drawText('Marcus Vance, Chief Financial Officer', { x: 40, y: p2Y - 15, size: 9, font: fontBold, color: primary });
    page2.drawText('Date: October 24, 2026', { x: 40, y: p2Y - 28, size: 8.5, font: fontRegular, color: secondary });

    page2.drawText('Elena Rostova, Chair of Audit Committee', { x: 300, y: p2Y - 15, size: 9, font: fontBold, color: primary });
    page2.drawText('Date: October 25, 2026', { x: 300, y: p2Y - 28, size: 8.5, font: fontRegular, color: secondary });

    page2.drawText('Confidential — For Board of Directors Review Only', { x: 40, y: 35, size: 8, font: fontRegular, color: secondary });
    page2.drawText('Page 2 of 2', { x: width - 85, y: 35, size: 8, font: fontMono, color: secondary });

    return await pdfDoc.save();
  }

  if (id === 'project-invoice') {
    // PAGE 1: Commercial Invoice & Proposal
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    // Top branding
    page.drawText('STUDIO MONOLITH // DIGITAL DESIGN & ARCHITECTURE', {
      x: 40,
      y: height - 50,
      size: 9,
      font: fontMono,
      color: secondary,
    });

    page.drawText('INVOICE & WORK ORDER', {
      x: 40,
      y: height - 76,
      size: 20,
      font: fontBold,
      color: primary,
    });

    page.drawText('Invoice No: INV-2026-8841', { x: width - 180, y: height - 50, size: 9, font: fontMono, color: primary });
    page.drawText('Date: October 26, 2026', { x: width - 180, y: height - 64, size: 9, font: fontRegular, color: secondary });
    page.drawText('Due Date: Upon Receipt', { x: width - 180, y: height - 78, size: 9, font: fontBold, color: accent });

    page.drawLine({ start: { x: 40, y: height - 95 }, end: { x: width - 40, y: height - 95 }, thickness: 1, color: border });

    // Client and Vendor details
    let y = height - 120;
    page.drawText('PREPARED FOR:', { x: 40, y: y, size: 8.5, font: fontBold, color: secondary });
    page.drawText('ISSUED BY:', { x: 300, y: y, size: 8.5, font: fontBold, color: secondary });

    y -= 15;
    page.drawText('Acme Global Technologies Inc.', { x: 40, y: y, size: 10, font: fontBold, color: primary });
    page.drawText('Studio Monolith Partners LLC', { x: 300, y: y, size: 10, font: fontBold, color: primary });

    y -= 14;
    page.drawText('Attn: Accounts Payable & Operations', { x: 40, y: y, size: 9, font: fontRegular, color: primary });
    page.drawText('500 Howard Street, Suite 400', { x: 300, y: y, size: 9, font: fontRegular, color: primary });

    y -= 14;
    page.drawText('555 Mission Street, Floor 22, San Francisco, CA', { x: 40, y: y, size: 9, font: fontRegular, color: secondary });
    page.drawText('San Francisco, CA 94105 · tax@monolith.studio', { x: 300, y: y, size: 9, font: fontRegular, color: secondary });

    // Line items table
    y -= 35;
    page.drawRectangle({
      x: 40,
      y: y - 5,
      width: width - 80,
      height: 22,
      color: rgb(0.95, 0.96, 0.98),
    });

    page.drawText('ITEM / DELIVERABLE DESCRIPTION', { x: 50, y: y, size: 8, font: fontBold, color: primary });
    page.drawText('HOURS', { x: 330, y: y, size: 8, font: fontBold, color: primary });
    page.drawText('RATE', { x: 400, y: y, size: 8, font: fontBold, color: primary });
    page.drawText('AMOUNT (USD)', { x: 470, y: y, size: 8, font: fontBold, color: primary });

    const items = [
      ['Design System & Component Library (Figma Token Spec)', '40.0', '$195.00', '$7,800.00'],
      ['Next.js & Tailwind Core Application Scaffolding', '56.0', '$210.00', '$11,760.00'],
      ['High-Performance PDF Vector Rendering Engine Integration', '32.0', '$220.00', '$7,040.00'],
      ['Security Hardening & Digital Signature Cryptography Module', '24.0', '$240.00', '$5,760.00'],
      ['End-to-End Responsive QA & Browser Conformance Suite', '18.0', '$180.00', '$3,240.00'],
    ];

    for (const item of items) {
      y -= 24;
      page.drawLine({ start: { x: 40, y: y + 18 }, end: { x: width - 40, y: y + 18 }, thickness: 0.5, color: border });
      page.drawText(item[0], { x: 50, y: y, size: 8.5, font: fontRegular, color: primary });
      page.drawText(item[1], { x: 335, y: y, size: 8.5, font: fontMono, color: secondary });
      page.drawText(item[2], { x: 405, y: y, size: 8.5, font: fontMono, color: secondary });
      page.drawText(item[3], { x: 475, y: y, size: 8.5, font: fontMono, color: primary });
    }

    // Subtotal & Total
    y -= 35;
    page.drawLine({ start: { x: 320, y: y + 25 }, end: { x: width - 40, y: y + 25 }, thickness: 1, color: primary });
    page.drawText('SUBTOTAL:', { x: 340, y: y + 10, size: 9, font: fontBold, color: secondary });
    page.drawText('$35,600.00', { x: 465, y: y + 10, size: 9.5, font: fontMono, color: primary });

    page.drawText('SALES TAX (0.00% B2B):', { x: 340, y: y - 8, size: 9, font: fontRegular, color: secondary });
    page.drawText('$0.00', { x: 465, y: y - 8, size: 9.5, font: fontMono, color: secondary });

    page.drawRectangle({
      x: 320,
      y: y - 36,
      width: width - 40 - 320,
      height: 24,
      color: rgb(0.94, 0.96, 1.0),
    });
    page.drawText('TOTAL DUE:', { x: 340, y: y - 28, size: 10, font: fontBold, color: primary });
    page.drawText('$35,600.00', { x: 460, y: y - 28, size: 11, font: fontBold, color: primary });

    // Wire instructions & acceptance
    y -= 70;
    page.drawText('Payment Instructions (Direct ACH / Wire Transfer)', { x: 40, y: y, size: 10, font: fontBold, color: primary });
    y -= 16;
    page.drawText('Bank: Silicon Valley Bank, N.A. · Routing (ABA): 121000358 · Account: 9820-4109-22', { x: 40, y: y, size: 8.5, font: fontMono, color: secondary });
    y -= 14;
    page.drawText('Reference: INV-2026-8841 / Acme Global Technologies', { x: 40, y: y, size: 8.5, font: fontMono, color: secondary });

    // Signature line
    y -= 45;
    page.drawText('CLIENT ACCEPTANCE & AUTHORIZATION TO COMMENCE WORK:', { x: 40, y: y, size: 8.5, font: fontBold, color: primary });
    y -= 35;
    page.drawLine({ start: { x: 40, y: y }, end: { x: 260, y: y }, thickness: 1, color: primary });
    page.drawLine({ start: { x: 300, y: y }, end: { x: 420, y: y }, thickness: 1, color: primary });

    page.drawText('Authorized Client Signature', { x: 40, y: y - 14, size: 8, font: fontRegular, color: secondary });
    page.drawText('Execution Date', { x: 300, y: y - 14, size: 8, font: fontRegular, color: secondary });

    return await pdfDoc.save();
  }

  // Default: Master Consulting Agreement (2 pages)
  const page1 = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page1.getSize();

  // Title
  page1.drawText('MASTER CONSULTING & PROFESSIONAL SERVICES AGREEMENT', {
    x: 40,
    y: height - 50,
    size: 13,
    font: fontBold,
    color: primary,
  });

  page1.drawLine({ start: { x: 40, y: height - 62 }, end: { x: width - 40, y: height - 62 }, thickness: 1, color: border });

  let textY = height - 85;
  const preamble = [
    'This Master Consulting Services Agreement ("Agreement") is entered into and made effective as of the 26th',
    'day of October, 2026 ("Effective Date"), by and between AURA ARCHITECTURE GROUP LLC, a Delaware',
    'corporation ("Provider"), and the undersigned institutional counterparty ("Client").',
  ];
  for (const line of preamble) {
    page1.drawText(line, { x: 40, y: textY, size: 9, font: fontRegular, color: primary });
    textY -= 15;
  }

  // Section 1
  textY -= 15;
  page1.drawText('1. Scope of Services & Technical Milestones', { x: 40, y: textY, size: 11, font: fontBold, color: primary });
  textY -= 16;
  const s1Lines = [
    '1.1 Statement of Work. Provider agrees to perform the architectural advisory, full-stack systems engineering,',
    'and cloud optimization services specified in mutually executed Statements of Work (each, an "SOW").',
    '1.2 Performance Standards. Provider shall conduct all services in a diligent, workmanlike manner adhering to',
    'customary engineering standards and highest industry benchmarks for high-reliability systems.',
    '1.3 Client Cooperation. Client will provide reasonable access to personnel, specifications, and testing environments',
    'necessary to facilitate timely completion of project deliverables.',
  ];
  for (const line of s1Lines) {
    page1.drawText(line, { x: 40, y: textY, size: 9, font: fontRegular, color: primary });
    textY -= 15;
  }

  // Section 2
  textY -= 15;
  page1.drawText('2. Compensation, Invoicing & Payment Terms', { x: 40, y: textY, size: 11, font: fontBold, color: primary });
  textY -= 16;
  const s2Lines = [
    '2.1 Fees. Client shall pay Provider the fees set forth in each respective SOW on a Net-30 basis from invoice date.',
    '2.2 Late Payments. Uncontested amounts unpaid past 30 days shall accrue interest at 1.5% per month or statutory max.',
    '2.3 Taxes. Fees exclude value-added, sales, use, or withholding taxes which remain the sole obligation of Client.',
  ];
  for (const line of s2Lines) {
    page1.drawText(line, { x: 40, y: textY, size: 9, font: fontRegular, color: primary });
    textY -= 15;
  }

  // Section 3
  textY -= 15;
  page1.drawText('3. Confidentiality & Non-Disclosure of Proprietary Data', { x: 40, y: textY, size: 11, font: fontBold, color: primary });
  textY -= 16;
  const s3Lines = [
    '3.1 Definition. "Confidential Information" means all non-public technical, product, or financial information disclosed',
    'by either party to the other, whether marked proprietary or reasonably understood to be confidential.',
    '3.2 Standard of Care. The receiving party shall safeguard disclosing party information with at least the same degree',
    'of care it exercises regarding its own confidential assets of similar character, in no event less than reasonable care.',
  ];
  for (const line of s3Lines) {
    page1.drawText(line, { x: 40, y: textY, size: 9, font: fontRegular, color: primary });
    textY -= 15;
  }

  page1.drawText('Page 1 of 2', { x: width - 85, y: 35, size: 8, font: fontMono, color: secondary });

  // PAGE 2: IP, Warranties & Signature Blocks
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  let p2Y = height - 50;

  page2.drawText('4. Intellectual Property Rights & Work Product Ownership', { x: 40, y: p2Y, size: 11, font: fontBold, color: primary });
  p2Y -= 18;
  const s4Lines = [
    '4.1 Assigned Deliverables. Upon receipt of full payment, Provider conveys and assigns to Client all right, title,',
    'and interest in and to custom code and documentation created specifically for Client under an active SOW.',
    '4.2 Pre-existing IP. Provider retains exclusive ownership of its pre-existing libraries, toolkits, and frameworks.',
  ];
  for (const line of s4Lines) {
    page2.drawText(line, { x: 40, y: p2Y, size: 9, font: fontRegular, color: primary });
    p2Y -= 15;
  }

  p2Y -= 20;
  page2.drawText('5. Execution and Signatures', { x: 40, y: p2Y, size: 11, font: fontBold, color: primary });
  p2Y -= 15;
  page2.drawText('IN WITNESS WHEREOF, the parties hereto have caused this Agreement to be duly signed as of the Effective Date.', {
    x: 40,
    y: p2Y,
    size: 8.5,
    font: fontRegular,
    color: primary,
  });

  // Signature Blocks
  p2Y -= 70;
  page2.drawText('PROVIDER: AURA ARCHITECTURE GROUP LLC', { x: 40, y: p2Y, size: 9, font: fontBold, color: primary });
  page2.drawText('CLIENT: GLOBAL ENTERPRISE CORP', { x: 300, y: p2Y, size: 9, font: fontBold, color: primary });

  p2Y -= 50;
  page2.drawLine({ start: { x: 40, y: p2Y }, end: { x: 250, y: p2Y }, thickness: 1, color: primary });
  page2.drawLine({ start: { x: 300, y: p2Y }, end: { x: 510, y: p2Y }, thickness: 1, color: primary });

  page2.drawText('Authorized Signature: [Place Signature Here]', { x: 40, y: p2Y - 14, size: 8, font: fontRegular, color: secondary });
  page2.drawText('Authorized Signature: [Place Signature Here]', { x: 300, y: p2Y - 14, size: 8, font: fontRegular, color: secondary });

  p2Y -= 35;
  page2.drawText('Name: Sarah Jenkins', { x: 40, y: p2Y, size: 8.5, font: fontRegular, color: primary });
  page2.drawText('Name: Alexander Hayes', { x: 300, y: p2Y, size: 8.5, font: fontRegular, color: primary });

  p2Y -= 15;
  page2.drawText('Title: Managing Principal', { x: 40, y: p2Y, size: 8.5, font: fontRegular, color: secondary });
  page2.drawText('Title: VP Engineering', { x: 300, y: p2Y, size: 8.5, font: fontRegular, color: secondary });

  page2.drawText('Page 2 of 2', { x: width - 85, y: 35, size: 8, font: fontMono, color: secondary });

  return await pdfDoc.save();
}
