const PDFDocument = require('pdfkit');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateInvoicePDF = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
      include: {
        party: true,
        lineItems: { include: { product: true } }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: { message: 'Transaction not found' } });
    }
    if (transaction.type !== 'Sale' || !transaction.invoiceNumber) {
      return res.status(400).json({ error: { message: 'Only Sales transactions have invoices' } });
    }

    // Set Response Headers for PDF download
    res.setHeader('Content-disposition', `attachment; filename="${transaction.invoiceNumber}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res); // pipe to HTTP response

    // Build the PDF
    generateHeader(doc);
    generateCustomerInformation(doc, transaction);
    generateInvoiceTable(doc, transaction);
    generateFooter(doc, transaction);

    doc.end();
  } catch (error) {
    console.error('generateInvoicePDF error:', error);
    res.status(500).json({ error: { message: 'Failed to generate PDF' } });
  }
};

function generateHeader(doc) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('SwiftBill', 50, 57)
    .fontSize(10)
    .text('123 SwiftBill Street', 200, 50, { align: 'right' })
    .text('Mumbai, Maharashtra, India', 200, 65, { align: 'right' })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('Tax Invoice', 50, 120);

  const customerInformationTop = 150;

  doc
    .fontSize(10)
    .text('Invoice Number:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.invoiceNumber, 150, customerInformationTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInformationTop + 15)
    .text(new Date(invoice.date).toLocaleDateString(), 150, customerInformationTop + 15)
    .text('Total Amount:', 50, customerInformationTop + 30)
    .text(`Rs. ${(invoice.totalAmount / 100).toFixed(2)}`, 150, customerInformationTop + 30)

    .font('Helvetica-Bold')
    .text(invoice.party.name, 300, customerInformationTop)
    .font('Helvetica')
    .text(invoice.party.address || '', 300, customerInformationTop + 15)
    .text(`${invoice.party.state}`, 300, customerInformationTop + 30)
    .text(`GSTIN: ${invoice.party.gstin || 'N/A'}`, 300, customerInformationTop + 45)
    .moveDown();
}

function generateInvoiceTable(doc, invoice) {
  const invoiceTableTop = 250;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item',
    'Unit Cost',
    'Quantity',
    'Tax',
    'Total'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  let position = invoiceTableTop + 30;
  
  invoice.lineItems.forEach(item => {
    const unitPrice = (item.unitPrice / 100).toFixed(2);
    const itemTax = ((item.cgst + item.sgst + item.igst) / 100).toFixed(2);
    const lineTotal = ((item.totalPrice + item.cgst + item.sgst + item.igst) / 100).toFixed(2);

    generateTableRow(
      doc,
      position,
      item.product.name,
      unitPrice,
      item.quantity,
      itemTax,
      lineTotal
    );
    generateHr(doc, position + 20);
    position += 30;
  });

  const grandTotal = (invoice.totalAmount / 100).toFixed(2);
  
  // Calculate total taxes
  const totalCgst = invoice.lineItems.reduce((sum, item) => sum + item.cgst, 0);
  const totalSgst = invoice.lineItems.reduce((sum, item) => sum + item.sgst, 0);
  const totalIgst = invoice.lineItems.reduce((sum, item) => sum + item.igst, 0);

  position += 15;

  if (totalIgst > 0) {
    generateTableRow(doc, position, '', '', 'IGST', '', (totalIgst / 100).toFixed(2));
    position += 20;
  } else {
    generateTableRow(doc, position, '', '', 'CGST', '', (totalCgst / 100).toFixed(2));
    position += 20;
    generateTableRow(doc, position, '', '', 'SGST', '', (totalSgst / 100).toFixed(2));
    position += 20;
  }

  doc.font('Helvetica-Bold');
  generateTableRow(doc, position, '', '', 'Grand Total', '', `Rs. ${grandTotal}`);
  doc.font('Helvetica');
}

function generateFooter(doc, invoice) {
  const isEwayBillRequired = invoice.totalAmount >= 5000000; // 50,000 INR in paise

  if (isEwayBillRequired) {
    doc
      .fillColor('red')
      .fontSize(10)
      .text(
        'E-Way Bill Required: Consignment value exceeds Rs. 50,000.',
        50,
        680,
        { align: 'center', width: 500 }
      );
  }

  doc
    .fillColor('#444444')
    .fontSize(10)
    .text(
      'Payment is due within 15 days. Thank you for your business.',
      50,
      700,
      { align: 'center', width: 500 }
    );
}

function generateTableRow(doc, y, item, unitCost, quantity, tax, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(unitCost, 280, y, { width: 90, align: 'right' })
    .text(quantity, 370, y, { width: 40, align: 'right' })
    .text(tax, 410, y, { width: 50, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

module.exports = { generateInvoicePDF };
