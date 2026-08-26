const assert = require('assert');
const { calculateGST } = require('./src/services/gst.service');

// Test 1: Intra-state (Same State)
const intra = calculateGST('Maharashtra', 'Maharashtra', 10000, 18); // 100 rupees in paise
assert.strictEqual(intra.cgst, 900);
assert.strictEqual(intra.sgst, 900);
assert.strictEqual(intra.igst, 0);
assert.strictEqual(intra.totalTax, 1800);

// Test 2: Inter-state (Different State)
const inter = calculateGST('Maharashtra', 'Delhi', 10000, 18);
assert.strictEqual(inter.cgst, 0);
assert.strictEqual(inter.sgst, 0);
assert.strictEqual(inter.igst, 1800);
assert.strictEqual(inter.totalTax, 1800);

// Test 3: Odd number rounding (intra-state)
const odd = calculateGST('MH', 'MH', 10000, 5); // 500 tax
assert.strictEqual(odd.cgst, 250);
assert.strictEqual(odd.sgst, 250);
assert.strictEqual(odd.totalTax, 500);

console.log('All GST service tests passed!');
