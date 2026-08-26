const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  categoryId: z.number().int().positive(),
  unitId: z.number().int().positive(),
  price: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
});

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, unit: true },
    });
    res.json(products);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch products', code: 'INTERNAL_ERROR' } });
  }
};

const createProduct = async (req, res) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: 'Invalid input', details: parsed.error.issues } });
    }

    const exists = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
    if (exists) {
      return res.status(400).json({ error: { message: 'Product with this SKU already exists', code: 'DUPLICATE_SKU' } });
    }

    const product = await prisma.product.create({ data: parsed.data });
    res.status(201).json(product);
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(500).json({ error: { message: 'Failed to create product', code: 'INTERNAL_ERROR' } });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: 'Invalid input', details: parsed.error.issues } });
    }

    // Check if SKU is changing and conflicts
    const existing = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
    if (existing && existing.id !== parseInt(id)) {
      return res.status(400).json({ error: { message: 'Another product with this SKU already exists', code: 'DUPLICATE_SKU' } });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: parsed.data,
    });
    res.json(product);
  } catch (error) {
    console.error('updateProduct error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });
    }
    res.status(500).json({ error: { message: 'Failed to update product', code: 'INTERNAL_ERROR' } });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    console.error('deleteProduct error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });
    }
    res.status(500).json({ error: { message: 'Failed to delete product', code: 'INTERNAL_ERROR' } });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
