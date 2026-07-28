/**
 * Dynamic DROOBNA Delivery Financial Calculation Engine
 * @param {number} itemsTotalWithVat - The sum of all item prices (already VAT-inclusive)
 * @returns {Object} Complete financial breakdown matrix
 */
const calculateOrderFinance = (itemsTotalWithVat) => {
  // 1. Determine Base Delivery Bracket Fee dynamically based on product value
  let baseDeliveryFee = 0;
  if (itemsTotalWithVat < 40) {
    baseDeliveryFee = 8;
  } else if (itemsTotalWithVat >= 40 && itemsTotalWithVat <= 59) {
    baseDeliveryFee = 7;
  } else {
    baseDeliveryFee = 6;
  }

  // 2. Apply 15% VAT on delivery and enforce the Ceil Rounding Rule
  const rawDeliveryWithVat = baseDeliveryFee * 1.15;
  const finalRoundedDeliveryFee = Math.ceil(rawDeliveryWithVat);

  // 3. Final Grand Total presented to the customer
  const finalBillAmount = itemsTotalWithVat + finalRoundedDeliveryFee;

  // 4. Reverse calculate 15% VAT to extract the items' net value before tax
  const netValueBeforeVat = itemsTotalWithVat / 1.15;
  
  // 5. Determine the Sliding Commission scale based on order value
  let commissionRate = 0.15; // Default bracket for >= 60 SAR
  if (itemsTotalWithVat < 40) {
    commissionRate = 0.20;
  } else if (itemsTotalWithVat >= 40 && itemsTotalWithVat <= 59) {
    commissionRate = 0.18;
  }

  // 6. Calculate platform operational deductions
  const calculatedCommission = netValueBeforeVat * commissionRate;
  const fixedFee = 3.00;
  const vatOnDeductions = (calculatedCommission + fixedFee) * 0.15;
  const totalDeductionAmount = calculatedCommission + fixedFee + vatOnDeductions;

  // 7. Calculate net payout for the Restaurant Merchant
  const restaurantEarnings = Math.max(0, itemsTotalWithVat - totalDeductionAmount);
  
  // Calculate total systemic VAT breakdown for documentation/reporting
  const totalVatCollected = (itemsTotalWithVat - netValueBeforeVat) + vatOnDeductions;

  return {
    itemsTotalWithVat,
    deliveryFeeWithVat: finalRoundedDeliveryFee,
    finalBillAmount,
    totalDeductionAmount,
    restaurantEarnings,
    totalVatCollected
  };
};

module.exports = { calculateOrderFinance };