import { useState, useEffect } from 'react';
import { Form, Input, Select, Col, Row, Image, Button, InputNumber } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateCartItem, fetchCart, removeFromCart } from '../redux/slices/cartSlice';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

const Checkout = () => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [guestCart, setGuestCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const reduxCart = useSelector(state => state.cart?.items || []);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = () => {
      const guestCart = JSON.parse(sessionStorage.getItem('guestCart')) || [];
      setCartItems(reduxCart.length ? reduxCart : guestCart);
    };
  
    loadCart(); // Initial load
  
    // Listen for guest cart updates
    window.addEventListener('guestCartUpdated', loadCart);
  
    return () => {
      window.removeEventListener('guestCartUpdated', loadCart);
    };
  }, [reduxCart]);

  useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setUser(storedUser);
  
      if (storedUser) {
          const loadCart = () => {
              dispatch(fetchCart(storedUser.user_id));
              console.log(cartItems)
          }
          loadCart()
          window.addEventListener('cartUpdated', loadCart);
  
          // Cleanup
          return () => {
              window.removeEventListener('cartUpdated', loadCart);
          };
      } 
      else {
          const loadGuestCart = () => {
              const storedGuestCart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');
              setGuestCart(storedGuestCart);
              const qtyMap = {};
              storedGuestCart.forEach(item => {
                  const key = `${item.productId}-${item.size}-${item.color}`;
                  // qtyMap[item.productId] = item.quantity;
                  qtyMap[key] = item.quantity;
              });
              setQuantities(qtyMap);
          };

          loadGuestCart(); // load once
  
          // Listen for guest cart updates
          window.addEventListener('guestCartUpdated', loadGuestCart);
  
          // Cleanup
          return () => {
              window.removeEventListener('guestCartUpdated', loadGuestCart);
          };
      }
  }, [dispatch]);

    // const displayCart = cartItems || reduxCat;
    const isCartEmpty = !cartItems || cartItems.length === 0;
    const handleQuantityChange = (item, newQuantity) => {
    
      if (user) {
            
        const itemKey = `${item.cart_item_id}`;
            dispatch(updateCartItem({ 
                cartItemId: item.cart_item_id,
                productId: item.productId, 
                size: item.size,
                color: item.color,
                quantity: newQuantity 
            }));
            // Update quantity for this specific variant only
            setQuantities(prev => ({ ...prev, [itemKey]: newQuantity }));
        } else {
            
        const itemKey = `${item.productId}-${item.size}-${item.color}`;
            const updatedCart = guestCart.map(ci => ci.productId === item.productId && ci.size === item.size 
                && ci.color === item.color  ? { ...ci, quantity: newQuantity } : ci);
    
            sessionStorage.setItem('guestCart', JSON.stringify(updatedCart));
            setGuestCart(updatedCart);
            window.dispatchEvent(new Event('guestCartUpdated'));
            // Update quantity for this specific variant only
            setQuantities(prev => ({ ...prev, [itemKey]: newQuantity }));
        }
    
    };
    

    const handleDelete = (itemToDelete) => {
        if (user) {
            // dispatch(removeFromCart(itemToDelete.productId, itemToDelete.size, itemToDelete.color));
            dispatch(removeFromCart(itemToDelete.cart_item_id));
            window.dispatchEvent(new Event('cartUpdated'));
        } else {
            // const updatedCart = guestCart.filter(item => item.productId !== productId);
            const updatedCart = guestCart.filter(item =>
                !( item.productId === itemToDelete.productId && item.size === itemToDelete.size && item.color === itemToDelete.color ));
            sessionStorage.setItem('guestCart', JSON.stringify(updatedCart));
            setGuestCart(updatedCart);
            // set a custom item key for each cart item
            const itemKey = `${itemToDelete.productId}-${itemToDelete.size}-${itemToDelete.color}`;
            setQuantities(prev => {
                const updated = { ...prev };
                // delete updated[productId];
                delete updated[itemKey];
                return updated;
            });
            window.dispatchEvent(new Event('guestCartUpdated'));
        }
    };

  return (
    <Col className="flex flex-col lg:flex-row gap-6 px-8 pt-10">
      <Col className="w-full lg:w-2/3 space-y-8">
          {cartItems.map((item, index) => (
            // let qty = quantities[key] || item.quantity || 1,
            //         let totalPrice = (item.basePrice || 0) * qty;
            <div key={index} className="grid grid-cols-3 gap-4 mb-4 border-b pb-2">
              {/* Image */}
              <div>
                <Image width={64} src={item?.coverImg} alt={item?.name} />
              </div>
              {/* Name, Size, Color */}
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Size: {item.size}</p>
                <p className="text-sm text-gray-500">Color: {item.color}</p>
              </div>
              {/* Quantity & Price */}
              <div className="text-right">
                <p>Quantity: {item.quantity}</p>
                <p className="font-semibold">€{item.basePrice * item.quantity}</p>
              </div>
              <div className="flex items-center">
                  <Button
                      icon={<MinusOutlined />}
                      onClick={() => handleQuantityChange(item, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      style={{ backgroundColor: "black", color: 'white', fontWeight: '500' }}
                  />
                  <InputNumber
                      min={1}
                      max={10}
                      value={item.quantity}
                      onChange={(value) => handleQuantityChange(item, value)}
                      controls={false}
                      style={{ width: 40, textAlign: 'center' }}
                  />
                  <Button
                      icon={<PlusOutlined />}
                      onClick={() => handleQuantityChange(item, Math.min(10, item.quantity + 1))}
                      disabled={item.quantity >= 40}
                      style={{ backgroundColor: "black", color: 'white', fontWeight: '500' }}
                  />
              </div>
              <Button icon={<DeleteOutlined />} onClick={() => handleDelete(item)} danger size="small"/> 
                                               
            </div>
          ))}
      </Col>
      {/* Right Side - Order Summary */}
      <div className="w-full lg:w-1/3 bg-white p-4 shadow rounded-xl flex flex-col justify-between h-full">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        
        </div>

      {/* Summary Footer */}
        <div className="mt-1 space-y-3 pt-1">
          <div className="flex justify-between text-base">
            <span>Subtotal</span>
            <span className="font-semibold">
              €{cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-base">
            <span>Shipping Charges</span>
            <span className="font-semibold">€35.00</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>
              €{(
                cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0) + 35
              ).toFixed(2)}
            </span>
          </div>

          {/* Confirm Order Button onClick={handleCheckout}*/}
          {/* <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-all" >
            Confirm Order
          </button> */}
          <Button
            // type="primary"
            // icon={<GoArrowRight />}
            onClick={() => navigate('/checkout')}
            // disabled={isCartEmpty}
            style={{ backgroundColor: 'black', borderColor: 'black', color: "white", fontWeight: "700", width: "100%", padding: "1rem 2rem" }}
            className="w-full hover:bg-blue-700 transition-all"
          >
            Proceed to Checkout
          </Button>
          <Button
            onClick={() => navigate('/')}
            // disabled={isCartEmpty}
            style={{ borderColor: 'black', color: "black", fontWeight: "700", padding: "1rem 2rem" }}
            className="w-full bg-white hover:bg-blue-700 transition-all"
          >
            Continue Shopping
          </Button>
        </div>

      </div>
    </Col>
  );
};

export default Checkout;
