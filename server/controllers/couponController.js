// Example static coupon list (you can later move this to DB)
const coupons = [
  { code: 'COUPON10', discountPercentage: 10, expiry: '2025-12-31' },
  { code: 'FREESHIP', discountPercentage: 5, expiry: '2026-01-30' },
  { code: 'VIP20', discountPercentage: 20, expiry: '2025-12-31' },
];

exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, message: 'Coupon code required' });
    }

    const coupon = coupons.find(
      (c) => c.code.toLowerCase() === code.toLowerCase()
    );

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    }

    // Check expiry
    const today = new Date();
    const expiryDate = new Date(coupon.expiry);
    if (today > expiryDate) {
      return res.status(400).json({ valid: false, message: 'Coupon expired' });
    }

    return res.status(200).json({
      valid: true,
      discountPercentage: coupon.discountPercentage,
      message: 'Coupon applied successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
};