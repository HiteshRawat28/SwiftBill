/**
 * Calculates GST based on intra-state vs inter-state rules.
 * 
 * @param {string} businessState - The state where the business is registered.
 * @param {string} partyState - The state where the customer/supplier is registered.
 * @param {number} taxableAmount - The base amount before tax (in paise).
 * @param {number} gstRate - The GST percentage (e.g., 18).
 * @returns {object} { cgst, sgst, igst, totalTax } in paise.
 */
function calculateGST(businessState, partyState, taxableAmount, gstRate) {
  // Defensive checks
  if (!businessState || !partyState || typeof taxableAmount !== 'number' || typeof gstRate !== 'number') {
    throw new Error('Invalid arguments to calculateGST');
  }

  // Normalize states for comparison
  const isInterState = businessState.trim().toLowerCase() !== partyState.trim().toLowerCase();

  const totalTax = Math.round(taxableAmount * (gstRate / 100));

  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      totalTax
    };
  } else {
    // Split total tax into two equal halves (handling odd numbers safely)
    const halfTax = Math.round(totalTax / 2);
    return {
      cgst: halfTax,
      sgst: totalTax - halfTax, // ensures cgst + sgst always equals totalTax exactly
      igst: 0,
      totalTax
    };
  }
}

module.exports = { calculateGST };
