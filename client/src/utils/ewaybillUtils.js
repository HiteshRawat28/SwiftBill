// E-Way Bill threshold is ₹50,000 (India specific)
export const EWAY_BILL_THRESHOLD = 50000;

/**
 * Checks if a transaction amount requires an E-Way Bill.
 * @param {number} totalAmountInRupees The grand total in rupees.
 * @returns {boolean} True if E-Way bill is required.
 */
export function requiresEwayBill(totalAmountInRupees) {
  return totalAmountInRupees >= EWAY_BILL_THRESHOLD;
}
