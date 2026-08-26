const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { calculateGST } = require('../services/gst.service');

const prisma = new PrismaClient();
const BUSINESS_STATE = process.env.BUSINESS_STATE || 'Maharashtra';

const lineItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(),
});

const transactionSchema = z.object({
  partyId: z.number().int().positive(),
  type: z.enum(['Sale', 'Purchase']),
  date: z.string().datetime().optional(),
  lineItems: z.array(lineItemSchema).min(1),
});

// Helper to generate invoice number (e.g., INV-0001)
const generateInvoiceNumber = async () => {
  const lastTx = await prisma.transaction.findFirst({
    where: { type: 'Sale' },
    orderBy: { id: 'desc' },
  });
  
  if (!lastTx || !lastTx.invoiceNumber) {
    return 'INV-0001';
  }
  
  const lastNum = parseInt(lastTx.invoiceNumber.split('-')[1]);
  const nextNum = (lastNum + 1).toString().padStart(4, '0');
  return `INV-${nextNum}`;
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        party: true,
        lineItems: {
          include: { product: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch transactions' } });
  }
};

const createTransaction = async (req, res) => {
  try {
    const parsed = transactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: 'Invalid input', details: parsed.error.issues } });
    }

    const { partyId, type, date, lineItems } = parsed.data;

    // Fetch the party to get their state for GST calc
    const party = await prisma.party.findUnique({ where: { id: partyId } });
    if (!party) {
      return res.status(404).json({ error: { message: 'Party not found' } });
    }

    // Process line items and calculate taxes
    let grandTotalAmount = 0;
    const processedLineItems = [];

    for (const item of lineItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: { message: `Product ${item.productId} not found` } });
      }

      const baseLineTotal = item.quantity * item.unitPrice;
      const gst = calculateGST(BUSINESS_STATE, party.state, baseLineTotal, product.gstRate || 18);
      
      const itemGrandTotal = baseLineTotal + gst.totalTax;
      grandTotalAmount += itemGrandTotal;

      processedLineItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: baseLineTotal, // store base price without tax in totalPrice for clarity (or store with tax? Let's keep it base)
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst
      });
    }

    // Auto-generate invoice number if Sale
    let invoiceNumber = null;
    if (type === 'Sale') {
      invoiceNumber = await generateInvoiceNumber();
    }

    // Execute everything in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          partyId,
          type,
          invoiceNumber,
          date: date ? new Date(date) : new Date(),
          totalAmount: grandTotalAmount,
          lineItems: {
            create: processedLineItems
          }
        },
        include: {
          party: true,
          lineItems: { include: { product: true } }
        }
      });

      // 2. Update stock for each product
      for (const item of lineItems) {
        if (type === 'Sale') {
          // Check stock first
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}`);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } }
          });
        } else if (type === 'Purchase') {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } }
          });
        }
      }

      // 3. Update Party Balance
      // Sales increase receivable (positive). Purchases increase payable (negative)
      const balanceChange = type === 'Sale' ? grandTotalAmount : -grandTotalAmount;
      await tx.party.update({
        where: { id: partyId },
        data: { balance: { increment: balanceChange } }
      });

      return transaction;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('createTransaction error:', error);
    res.status(400).json({ error: { message: error.message || 'Failed to process transaction' } });
  }
};

module.exports = { getTransactions, createTransaction };
