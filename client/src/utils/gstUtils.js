export function calculateGST(businessState, partyState, taxableAmount, gstRate) {
  if (!businessState || !partyState) return { cgst: 0, sgst: 0, igst: 0, totalTax: 0 };

  const isInterState = businessState.trim().toLowerCase() !== partyState.trim().toLowerCase();
  const totalTax = Math.round(taxableAmount * (gstRate / 100));

  if (isInterState) {
    return { cgst: 0, sgst: 0, igst: totalTax, totalTax };
  } else {
    const halfTax = Math.round(totalTax / 2);
    return { cgst: halfTax, sgst: totalTax - halfTax, igst: 0, totalTax };
  }
}
