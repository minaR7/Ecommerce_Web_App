import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, List, Avatar, Button, InputNumber } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { GoArrowRight } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart, closeDrawer } from '../redux/slices/cartSlice';

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
        else{
            //   dispatch(fetchCart());
            const loadGuestCart = () => {
                const cart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');
                setGuestCart(cart);
                dispatch(fetchCart());
            };
            loadGuestCart();
            window.addEventListener('guestCartUpdated', loadGuestCart);

            return () => {
            window.removeEventListener('guestCartUpdated', loadGuestCart);
            };
        }
        // else {
        //     const loadGuestCart = () => {
        //         const storedGuestCart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');
        //         setGuestCart(storedGuestCart);
        //         const qtyMap = {};
        //         storedGuestCart.forEach(item => {
        //             const key = `${item.productId}-${item.size}-${item.color}`;
        //             // qtyMap[item.productId] = item.quantity;
        //             qtyMap[key] = item.quantity;
        //         });
        //         setQuantities(qtyMap);
        //     };

        //     loadGuestCart(); // load once
    
        //     // Listen for guest cart updates
        //     window.addEventListener('guestCartUpdated', loadGuestCart);
    
        //     // Cleanup
        //     return () => {
        //         window.removeEventListener('guestCartUpdated', loadGuestCart);
        //     };
        // }
    }, [dispatch]);
    
    // useEffect(() => {
    //     const loadCart = () => {
    //         const guestCart = JSON.parse(sessionStorage.getItem('guestCart')) || [];
    //         setGuestCart(reduxCart.length ? reduxCart : guestCart);
    //     };
    
    //     loadCart(); // Initial load
    
    //     // Listen for guest cart updates
    //     window.addEventListener('guestCartUpdated', loadCart);
    
    //     return () => {
    //     window.removeEventListener('guestCartUpdated', loadCart);
    //     };
    // }, [cartItems]);

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
        } 
        else {
            
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

    // const displayCart = user ? cartItems : guestCart;
    const displayCart = cartItems
    const isCartEmpty = !displayCart || displayCart.length === 0;

    const handleViewCart = () => {
      if (isCartEmpty) return;
      navigate('/cart');
      setTimeout(() => {
        dispatch(closeDrawer());
      }, 300);
    };

    const handleCheckout = () => {
      if (isCartEmpty) return;
      navigate('/checkout');
      setTimeout(() => {
        dispatch(closeDrawer());
      }, 300);
    };

    return (
        <Drawer title="Cart Items" placement="right" closable onClose={() => setCartOpen(false)} open={cartOpen}>
            {console.log(displayCart)}
            {isCartEmpty ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4">
                    <div className="text-6xl mb-4 opacity-50">🛒</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                    <p className="text-sm text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                    <Button
                        type="primary"
                        onClick={() => {
                            navigate('/');
                            dispatch(closeDrawer());
                        }}
                        style={{ backgroundColor: 'black', borderColor: 'black', color: "white", fontWeight: "700", padding: "0.75rem 1.5rem"  }}
                    >
                        Start Shopping
                    </Button>
                </div>
            ) : user ? (
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
            {!isCartEmpty && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        right: 0,
                        width: 360, // match your Drawer width
                        padding: '0 1em 1em 0',
                        backgroundColor: 'white',
                        // borderTop: '1px solid #eee',
                        zIndex: 1000,
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: "1em",
                    }}
                    //className="flex mt-4">
                >
                    <Button
                        type="primary"
                        // icon={<GoArrowRight />}
                        onClick={handleCheckout}
                        disabled={isCartEmpty}
                        style={{ backgroundColor: 'black', borderColor: 'black', color: "white", fontWeight: "700", width: "100%", padding: "1rem 2rem"  }}
                    >
                        Proceed to Checkout
                    </Button>
                     <Button
                        onClick={handleViewCart}
                        disabled={isCartEmpty}
                        style={{ borderColor: isCartEmpty ? '#d9d9d9' : 'black', color: isCartEmpty ? '#bfbfbf' : "black", fontWeight: "700", padding: "1rem 2rem", cursor: isCartEmpty ? 'not-allowed' : 'pointer' }}
                        className={`w-full bg-white hover:bg-blue-700 transition-all ${isCartEmpty ? 'pointer-events-none opacity-60' : ''}`}
                    >
                        View Cart
                    </Button>
                </div>
            )}
        </Drawer>
    );
};

export default CartDrawer;
