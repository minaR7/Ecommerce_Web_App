import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, List, Avatar, Button, InputNumber } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { GoArrowRight } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart, closeDrawer } from '../redux/slices/cartSlice';

const Items = ({ noDrawerBtn, cartOpen, setCartOpen }) => {
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

    const displayCart = user ? cartItems : guestCart;
    const isCartEmpty = !displayCart || displayCart.length === 0;

    return (
      <>
        {user ? (
            <List
            itemLayout="horizontal"
            dataSource={cartItems}
            renderItem={(item) => {
                const key = `${item.cart_item_id}`;
                // const qty = quantities[item.productId] || item.quantity || 1;
                const qty = quantities[key] || item.quantity || 1;
                const totalPrice = (item.basePrice || 0) * qty;
                // console.log(item)
                return (
                    <List.Item>
                        <div className="flex items-center justify-between w-full">
                            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(item)} danger size="small" 
                                style={{  backgroundColor: "#ff4d4f", color: 'white', fontSize: '12px', fontWeight: '700' , padding: '2px 6px',}}/>
                            <Avatar src={item?.coverImg || "/fallback.jpg"} alt={item.name}  size={48} className="mx-2" />
                            <div >{item.name || "Unnamed Product"}</div>
                            <div className="flex items-center">
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
                                    style={{ width: 40, textAlign: 'center' }}
                                />
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => handleQuantityChange(item, Math.min(10, qty + 1))}
                                    disabled={qty >= 40}
                                    style={{ backgroundColor: "black", color: 'white', fontWeight: '500' }}
                                />
                            </div>
                            <div style={{ width: 50, textAlign: 'right', fontWeight: 'bold' }}>
                                €{totalPrice.toFixed(2)}
                            </div>
                        </div>
                    </List.Item>
                );
            }}
        />
        ) : (
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
                            
                            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(item)} danger size="small" 
                                style={{ backgroundColor: "#ff4d4f", color: 'white', fontSize: '12px', fontWeight: '700' , padding: '2px 6px',}}/>
                            <Avatar src={item.coverImg || "/fallback.jpg"} size={48} className="mx-2" />
                            <div >{item.name || "Unnamed Product"}</div>
                                {/*style={{ flex: 1 }}} */}
                            <div className="flex items-center">
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
                                    style={{ width: 40, textAlign: 'center' }}
                                />
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => handleQuantityChange(item, Math.min(10, qty + 1))}
                                    disabled={qty >= 10}
                                    style={{ backgroundColor: "black", color: 'white', fontWeight: '500' }}
                                />
                            </div>
                            <div style={{ width: 50, textAlign: 'right', fontWeight: 'bold' }}>
                                €{totalPrice.toFixed(2)}
                            </div>
                        </div>
                    </List.Item>
                );
            }}
        />
        )}
      </>  
    );
};

export default Items;
