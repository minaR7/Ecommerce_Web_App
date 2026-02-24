// controllers/wishlistController.js
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Simulate DB logic
    // Example: await WishlistModel.create(...)
    console.log(`Adding to wishlist for user ${userId}:`, req.body);

    return res.status(200).json({ message: 'Item added to wishlist successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error adding to wishlist' });
  }
};
