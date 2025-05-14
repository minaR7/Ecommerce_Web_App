import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, List, Avatar, Button, InputNumber } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { GoArrowRight } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart } from '../redux/slices/cartSlice';

const CartDrawer = ({ cartOpen, setCartOpen }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state.cart.items);

    const [user, setUser] = useState(null);
    const [guestCart, setGuestCart] = useState([]);
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
    
        if (storedUser) {
            dispatch(fetchCart(storedUser.id));
        } else {
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
    
    // const handleQuantityChange = (item, newQuantity) => {
    //     if (user) {
    //         dispatch(updateCartItem({ productId: item.productId, quantity: newQuantity }));
    //     } else {
    //         const updatedCart = guestCart.map(ci =>
    //             ci.productId === item.productId ? { ...ci, quantity: newQuantity } : ci
    //         );
    //         sessionStorage.setItem('guestCart', JSON.stringify(updatedCart));
    //         setGuestCart(updatedCart);
    //     }
    //     setQuantities(prev => ({ ...prev, [item.productId]: newQuantity }));
    // };
    const handleQuantityChange = (item, newQuantity) => {
        const itemKey = `${item.productId}-${item.size}-${item.color}`;
    
        if (user) {
            dispatch(updateCartItem({ 
                productId: item.productId, 
                size: item.size,
                color: item.color,
                quantity: newQuantity 
            }));
        } else {
            const updatedCart = guestCart.map(ci => ci.productId === item.productId && ci.size === item.size 
                && ci.color === item.color  ? { ...ci, quantity: newQuantity } : ci);
    
            sessionStorage.setItem('guestCart', JSON.stringify(updatedCart));
            setGuestCart(updatedCart);
        }
    
        // Update quantity for this specific variant only
        setQuantities(prev => ({ ...prev, [itemKey]: newQuantity }));
    };
    

    const handleDelete = (productId) => {
        if (user) {
            dispatch(removeFromCart(productId));
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
        }
    };

    const displayCart = user ? cartItems : guestCart;
    const isCartEmpty = !displayCart || displayCart.length === 0;

    return (
        <Drawer title="Cart Items" placement="right" closable onClose={() => setCartOpen(false)} open={cartOpen}>
            <List
                itemLayout="horizontal"
                dataSource={displayCart}
                renderItem={(item) => {
                    const key = `${item.productId}-${item.size}-${item.color}`;
                    // const qty = quantities[item.productId] || item.quantity || 1;
                    const qty = quantities[key] || item.quantity || 1;
                    const totalPrice = (item.basePrice || 0) * qty;
                    return (
                        <List.Item>
                            <div className="flex items-center justify-between w-full">
                                <Button icon={<DeleteOutlined />} onClick={() => handleDelete(item.productId)} danger />
                                <Avatar src={item.image || "/fallback.jpg"} className="mx-2" />
                                <div style={{ flex: 1 }}>{item.name || "Unnamed Product"}</div>
                                <div className="flex items-center space-x-1">
                                    <Button
                                        icon={<MinusOutlined />}
                                        onClick={() => handleQuantityChange(item, Math.max(1, qty - 1))}
                                        disabled={qty <= 1}
                                        style={{ backgroundColor: "black", color: 'white', fontWeight: '500' }}
                                    />
                                    <InputNumber
                                        min={1}
                                        max={10}
                                        value={qty}
                                        onChange={(value) => handleQuantityChange(item, value)}
                                        controls={false}
                                        style={{ width: 60, textAlign: 'center' }}
                                    />
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={() => handleQuantityChange(item, Math.min(10, qty + 1))}
                                        disabled={qty >= 10}
                                        style={{ backgroundColor: "black", color: 'white', fontWeight: '500' }}
                                    />
                                </div>
                                <div style={{ width: 80, textAlign: 'right', fontWeight: 'bold' }}>
                                    ${totalPrice.toFixed(2)}
                                </div>
                            </div>
                        </List.Item>
                    );
                }}
            />
            <div className="flex mt-4">
                <Button
                    type="primary"
                    icon={<GoArrowRight />}
                    onClick={() => navigate('/checkout')}
                    disabled={isCartEmpty}
                    style={{ backgroundColor: 'black', borderColor: 'black', color: "white", fontWeight: "500", bottom: "0", width: "100%" }}
                >
                    Proceed to Checkout
                </Button>
            </div>
        </Drawer>
    );
};

export default CartDrawer;
