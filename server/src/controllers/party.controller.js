const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const partySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['Customer', 'Supplier']),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  state: z.string().min(1, 'State is required for GST calculation'),
  gstin: z.string().optional().or(z.literal('')),
  balance: z.number().int().default(0) // paise
});

const getParties = async (req, res) => {
  try {
    const parties = await prisma.party.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(parties);
  } catch (error) {
    console.error('getParties error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch parties', code: 'INTERNAL_ERROR' } });
  }
};

const createParty = async (req, res) => {
  try {
    const parsed = partySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: 'Invalid input', details: parsed.error.issues } });
    }

    if (parsed.data.gstin && parsed.data.gstin.trim() !== '') {
      const exists = await prisma.party.findUnique({ where: { gstin: parsed.data.gstin } });
      if (exists) {
        return res.status(400).json({ error: { message: 'A party with this GSTIN already exists', code: 'DUPLICATE_GSTIN' } });
      }
    } else {
      parsed.data.gstin = null;
    }

    const party = await prisma.party.create({ data: parsed.data });
    res.status(201).json(party);
  } catch (error) {
    console.error('createParty error:', error);
    res.status(500).json({ error: { message: 'Failed to create party', code: 'INTERNAL_ERROR' } });
  }
};

const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = partySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: 'Invalid input', details: parsed.error.issues } });
    }

    if (parsed.data.gstin && parsed.data.gstin.trim() !== '') {
      const existing = await prisma.party.findUnique({ where: { gstin: parsed.data.gstin } });
      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({ error: { message: 'Another party with this GSTIN already exists', code: 'DUPLICATE_GSTIN' } });
      }
    } else {
      parsed.data.gstin = null;
    }

    const party = await prisma.party.update({
      where: { id: parseInt(id) },
      data: parsed.data,
    });
    res.json(party);
  } catch (error) {
    console.error('updateParty error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Party not found', code: 'NOT_FOUND' } });
    }
    res.status(500).json({ error: { message: 'Failed to update party', code: 'INTERNAL_ERROR' } });
  }
};

const deleteParty = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.party.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    console.error('deleteParty error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Party not found', code: 'NOT_FOUND' } });
    }
    res.status(500).json({ error: { message: 'Failed to delete party', code: 'INTERNAL_ERROR' } });
  }
};

module.exports = { getParties, createParty, updateParty, deleteParty };
