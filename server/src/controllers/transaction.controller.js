const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

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

    // Calculate total amount
    const totalAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Execute everything in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          partyId,
          type,
          date: date || new Date(),
          totalAmount,
          lineItems: {
            create: lineItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice
            }))
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
          // Check stock first (optional, but good practice to prevent negative stock)
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error(`Product ${item.productId} not found`);
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
      const balanceChange = type === 'Sale' ? totalAmount : -totalAmount;
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
