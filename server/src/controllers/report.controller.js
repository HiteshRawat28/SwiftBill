const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    // Total Receivables (Customers with positive balance)
    const receivablesObj = await prisma.party.aggregate({
      where: { type: 'Customer', balance: { gt: 0 } },
      _sum: { balance: true }
    });
    const totalReceivables = receivablesObj._sum.balance || 0;

    // Total Payables (Suppliers with negative balance)
    const payablesObj = await prisma.party.aggregate({
      where: { type: 'Supplier', balance: { lt: 0 } },
      _sum: { balance: true }
    });
    // Convert to positive number for display
    const totalPayables = Math.abs(payablesObj._sum.balance || 0);

    // Low Stock Items (stock <= lowStockThreshold)
    const lowStockCount = await prisma.product.count({
      where: { stockQuantity: { lte: prisma.product.fields.lowStockThreshold } } // prisma doesn't support comparing two fields directly in count yet, we need a raw query or fetch and filter.
    });
    // Wait, Prisma filtering where stockQuantity <= lowStockThreshold:
    // This requires a slightly different query or fetching and filtering. Let's do a raw query or simple fetch since data is small.
    // Actually Prisma doesn't support comparing columns in standard `where` without raw or typed sql, let's just fetch:
    const products = await prisma.product.findMany({ select: { stockQuantity: true, lowStockThreshold: true } });
    const actualLowStockCount = products.filter(p => p.stockQuantity <= p.lowStockThreshold).length;

    // This Month's Sales
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const salesObj = await prisma.transaction.aggregate({
      where: {
        type: 'Sale',
        date: { gte: startOfMonth }
      },
      _sum: { totalAmount: true }
    });
    const thisMonthSales = salesObj._sum.totalAmount || 0;

    res.json({
      totalReceivables,
      totalPayables,
      lowStockCount: actualLowStockCount,
      thisMonthSales
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch dashboard stats' } });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch sales for the last 30 days
    const sales = await prisma.transaction.findMany({
      where: {
        type: 'Sale',
        date: { gte: thirtyDaysAgo }
      },
      select: { date: true, totalAmount: true },
      orderBy: { date: 'asc' }
    });

    // Group by date (YYYY-MM-DD)
    const grouped = {};
    sales.forEach(s => {
      const dateKey = s.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = 0;
      grouped[dateKey] += s.totalAmount;
    });

    // Convert to array for Recharts
    const data = Object.keys(grouped).map(date => ({
      date,
      amount: Math.round(grouped[date] / 100) // Convert paise to rupees
    }));

    res.json(data);
  } catch (error) {
    console.error('getSalesSummary error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch sales summary' } });
  }
};

const getGstLiability = async (req, res) => {
  try {
    // Optional: filter by date range. For now, all time.
    const allTransactions = await prisma.transaction.findMany({
      include: { lineItems: true }
    });

    let taxCollected = 0; // from Sales
    let taxPaid = 0; // from Purchases

    allTransactions.forEach(tx => {
      const txTax = tx.lineItems.reduce((sum, item) => sum + item.cgst + item.sgst + item.igst, 0);
      if (tx.type === 'Sale') {
        taxCollected += txTax;
      } else {
        taxPaid += txTax;
      }
    });

    res.json({
      taxCollected,
      taxPaid,
      netLiability: taxCollected - taxPaid
    });
  } catch (error) {
    console.error('getGstLiability error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch GST liability' } });
  }
};

const getStockValuation = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });

    const valuationByCategory = {};
    let grandTotalValue = 0;

    products.forEach(p => {
      const catName = p.category.name;
      const val = p.stockQuantity * p.price;
      
      if (!valuationByCategory[catName]) {
        valuationByCategory[catName] = 0;
      }
      valuationByCategory[catName] += val;
      grandTotalValue += val;
    });

    const data = Object.keys(valuationByCategory).map(cat => ({
      category: cat,
      value: valuationByCategory[cat]
    }));

    res.json({
      byCategory: data,
      grandTotalValue
    });
  } catch (error) {
    console.error('getStockValuation error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch stock valuation' } });
  }
};

module.exports = {
  getDashboardStats,
  getSalesSummary,
  getGstLiability,
  getStockValuation
};
