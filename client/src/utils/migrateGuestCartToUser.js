// utils/migrateGuestCartToUser.ts
import axios from './axios';
import { getLoggedInUser } from './getLoggedInUser';

export const migrateGuestCartToUser = async () => {
  const guestCart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');
  const user = getLoggedInUser();

  if (!user || guestCart.length === 0) return;

  try {
    const payload = guestCart.map(item => ({
      productId: item.productId,
      variantId: item.variant,
      quantity: item.quantity,
      userId: user.user_id,
    }));

    await axios.post('/api/cart/bulk', payload); // You need this endpoint on backend
    sessionStorage.removeItem('guestCart'); // clear guest cart after successful sync
  } catch (err) {
    console.error('Error migrating guest cart:', err);
  }
};
