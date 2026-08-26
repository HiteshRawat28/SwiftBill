const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();
const nameSchema = z.object({ name: z.string().min(1) });

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch categories', code: 'INTERNAL_ERROR' } });
  }
};

const createCategory = async (req, res) => {
  try {
    const parsed = nameSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { message: 'Invalid input' } });
    
    const category = await prisma.category.create({ data: parsed.data });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: { message: 'Category already exists' } });
    res.status(500).json({ error: { message: 'Failed to create category', code: 'INTERNAL_ERROR' } });
  }
};

const getUnits = async (req, res) => {
  try {
    const units = await prisma.unit.findMany();
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch units', code: 'INTERNAL_ERROR' } });
  }
};

const createUnit = async (req, res) => {
  try {
    const parsed = nameSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { message: 'Invalid input' } });
    
    const unit = await prisma.unit.create({ data: parsed.data });
    res.status(201).json(unit);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: { message: 'Unit already exists' } });
    res.status(500).json({ error: { message: 'Failed to create unit', code: 'INTERNAL_ERROR' } });
  }
};

module.exports = { getCategories, createCategory, getUnits, createUnit };
