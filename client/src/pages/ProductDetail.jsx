// pages/ProductDetail.jsx
import {React, useState, useEffect} from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/slices/productSlice';
import { Rate, Button, Select, Breadcrumb, Tag, Row, Col, InputNumber,Tooltip, Radio, notification } from 'antd';
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaGooglePay } from 'react-icons/fa';
import { MinusOutlined, PlusOutlined, HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { CheckOutlined } from '@ant-design/icons';
import { GoArrowRight } from "react-icons/go";
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/wishlistSlice';


const ProductDetail = () => {

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { product, loading, error } = useSelector((state) => state.products || {});
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    useEffect(() => {
        dispatch(fetchProductById(id)); // Fetch product details based on ID from the URL
    }, []);

    
    const productSizes = [...new Set(product?.variants?.map((v) => v.size))];
    const productColors = [...new Set(product?.variants?.map((v) => v.color))];

    useEffect(() => {
      if (product) {
        setSelectedImage(product.cover_img); // Default to the first image
        setSelectedSize(productSizes[0])
        setSelectedColor(productColors[0])
      }
    }, [product]);

    useEffect(() => {
        if (selectedColor && selectedSize) {
            setSelectedVariant(product?.variants?.find((v) => v.size === selectedSize && v.color === selectedColor ))
            console.log(selectedColor, selectedSize, selectedVariant)
            setSelectedQuantity(1);
        }
      }, [selectedColor, selectedSize]);
  
    const handleSizeSelect = (size) => {
      setSelectedSize(size);
    };
  
    const handleColorSelect = (color) => {
      setSelectedColor(color);
    };

    const handleAddToCart = async () => {
        const payload = {
            productId: product.product_id,
            variant: selectedVariant.variant_id,
            quantity: selectedQuantity,
            coverImg: product.cover_img,
            name: product.name,
            basePrice: product.price,
            size: selectedVariant.size,
            color: selectedVariant.color,
        }
        console.log(payload)
        try {
            const resultAction = await dispatch(addToCart(payload));
            console.log('Thunk result:', resultAction);
         
          } catch (err) {
            console.error('Thunk error:', err);
          }
      };
  
    // const cvariant = product?.variants?.find((v) => v.size === selectedSize && v.color === selectedColor )

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!product) return <div>Product not found.</div>;

    return (
        <div style={{ backgroundColor: 'white' }}>
            <div style={{ width: '100%', padding: '2rem 6rem 1rem', backgroundColor: 'rgba(132, 152, 176, 0.5)', margin: '16px 0px' }}>
                <Breadcrumb style={{ marginBottom: '16px', font: '32px', color: 'black' }}>
                    <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/store/${product.category}`}>{product.category}</Link> </Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/store/${product.category}/${product.subcategory}`}>{product.subcategory}</Link> </Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/product/${product.product_id}`}>{product.name}</Link></Breadcrumb.Item>
                </Breadcrumb>
                {/* <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>{product.productName}</h1> */}
            </div>

            <div className="flex md:flex-row mx-2 px-3" style={{minHeight: "70vh",}}>
                {/* h-[50vh] First Column */}
                {/* <div className="flex flex-col */}
                <Col className=" w-full md:w-1/2 mt-2" style={{height: "70vh",}}>
                    {/* First Child Container */}
                    <div className="flex items-center justify-center h-[70%]">
                        <img src={selectedImage} alt={product.name} className="object-contain w-full h-full" />
                    </div>

                    {/* Second Child Container */}
                    <div className="flex items-center justify-center h-[26%] overflow-x-auto">
                        {product?.slide_images.map((img, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-24 h-24 mx-2 cursor-pointer"
                                onClick={() => setSelectedImage(img)}
                            >
                                <img src={img} alt={`Thumbnail ${index}`} className="object-cover w-full h-full" />
                            </div>
                        ))}
                    </div>
                </Col>

                {/* Second Column */}
                <Col className="w-full md:w-1/2 p-8 bg-[#f5f5f5] overflow-hidden" style={{ height: "65vh", borderRadius: "1rem", overflowY: "auto" }}>
                    <h1 className="text-2xl font-semibold ">{product.name}</h1>
                    <h2 className="text-xl font-semibold mt-3" style={{ color: "rgb(71, 89, 122)" }}>{`€${product.price}`}</h2>
                    <div className="mt-3">
                    <Rate disabled value={parseFloat(product.avg_rating)} />
                    </div>

                    <div className="mt-4">
                        <h2 className="text-xl font-medium text-gray-800">{product.description}</h2>
                    </div>

                    {/* Sizes Label + Tags + Size Chart Button */}
                    <div className="flex items-center justify-between mt-4 flex-wrap">
                       <div className="flex">
                            <h3 className="text-xl font-semibold mr-2">Sizes:</h3>
                            <div className="flex gap-2 flex-wrap">
                                {productSizes.map(size => (
                                <Tag
                                    key={size}
                                    value={selectedSize}
                                    style={{
                                    textAlign: 'center',
                                    backgroundColor: size === selectedSize ? 'lightblue' : '',
                                    cursor: 'pointer',
                                    padding: '2px 16px',
                                    fontSize: '16px',
                                    fontWeight: '400',
                                    }}
                                    onClick={() => handleSizeSelect(size)}
                                >
                                    {size}
                                </Tag>
                                ))}
                            </div>
                       </div>
                        <div className="flex">
                            <Button type="primary" style={{ backgroundColor: "rgb(71, 89, 122)" }}>Size Chart</Button>
                        </div>
                    </div>

                    {/* Colors */}
                    <h3 className="text-xl font-semibold mt-4">Colors:</h3>
                    <Radio.Group
                    value={selectedColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px',  }}
                    >
                    {productColors.map((color, index) => (
                        <Tooltip title={color} key={index}>
                        <Radio.Button
                             className="circle-radio"
                            value={color}
                            style={{
                                border: '2px solid black',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: selectedColor === color ? "14px" : "1px",
                                cursor: 'pointer',
                            }}
                        >
                            <div
                                style={{
                                backgroundColor: color,
                                border: '2px solid black',
                                borderRadius: '50%',
                                width: selectedColor === color ? "24px" : '30px',
                                height: selectedColor === color ? "24px" : '30px',
                                }}
                            >
                            </div> 
                        </Radio.Button>
                        </Tooltip>
                    ))}
                    </Radio.Group>

                    {/* Stock Status */}
                    {selectedSize && selectedColor && (
                        <p className={`mt-3  font-semibold ${selectedVariant?.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedVariant?.stock_quantity > 0 ? 'In stock' : 'Out of stock'}
                        </p>
                    )}

                    {/* Quantity + Wishlist + Cart Buttons */}
                    <div className="flex items-center gap-3 mt-3">
                        {/* Quantity with +/- buttons */}
                        <div className="flex items-center gap-1">
                            {/* <h3 className="text-xl font-semibold mr-2">Quantity:</h3> */}

                            <Button
                                icon={<MinusOutlined />}
                                onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                                disabled={selectedQuantity <= 1}
                                style={{ backgroundColor: "black", color: 'white', fontWeight: '500' }}
                            />

                            <InputNumber
                                min={1}
                                max={10}
                                value={selectedQuantity}
                                onChange={(value) => setSelectedQuantity(value)}
                                controls={false}
                                style={{ width: 60, textAlign: 'center' }}
                            />

                            <Button
                                icon={<PlusOutlined />}
                                onClick={() => setSelectedQuantity(prev => Math.min(10, prev + 1))}
                                disabled={selectedQuantity >= 10 || selectedVariant?.stock_quantity <= 0}
                                style={{ backgroundColor: "black", color: 'white', fontWeight: '500' }}
                            />
                        </div>

                        {/* Wishlist button */}
                        {/* <Tooltip title="Add to Wishlist">
                            <Button
                            shape="circle"
                            icon={<HeartOutlined />}
                            style={{ backgroundColor: 'black', color: 'white', fontWeight: '500' }}
                            disabled={selectedVariant?.stock_quantity <= 0}
                            onClick={() => dispatch(addToWishlist({ product, selectedVariant, navigate }))}
                            />
                        </Tooltip> */}

                        {/* Add to Cart button */}
                        <Button
                            type="primary"
                            style={{ backgroundColor: 'black', borderColor: 'black', color: 'white', fontWeight: '500' }}
                            disabled={selectedVariant?.stock_quantity <= 0}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCartOutlined /> Add to Cart
                        </Button>
                        {/* <Button
                        type="primary"
                        style={{ backgroundColor: 'black', borderColor: 'black', color: "white", fontWeight: "500" }}
                        disabled={!product.isStock}
                        >
                        <GoArrowRight /> Proceed to Checkout
                        </Button> */}
                    </div>

                    <div className="mt-5 space-y-2">
                        {/* Row 1: Collection */}
                        <div className="flex items-baseline gap-2 mt-1 align-center">
                            <h3 className="c-1 text-lg font-semibold min-w-[100px]">Collection:</h3>
                            <p className="c-1 text-gray-700">Click & Collect - Select store at checkout.</p>
                        </div>

                        {/* Row 2: Postage */}
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="c-2 text-lg font-semibold min-w-[100px]">Postage:</h3>
                            <div className="c-2">
                            <p className="text-green-600">Free delivery in 2-3 days</p>
                            {/* <p className="text-gray-700">Estimated between Tue, 29 Apr and Wed, 30 Apr to T45. See details</p> */}
                            </div>
                        </div>

                        {/* Row 3: Returns */}
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="c-4 text-lg font-semibold min-w-[100px]">Returns:</h3>
                            <p className="c-4 text-gray-700">30 days return. Seller pays for return postage. See details</p>
                        </div>

                        {/* Row 4: Payments */}
                        <div className="flex items-center gap-2 mt-1">
                            <h3 className="text-lg font-semibold min-w-[100px]">Payments:</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                            {/* <img src="/assets/icons/paypal-3-svgrepo-com.svg" alt="PayPal" className="w-10" />
                            <img src="/assets/icons/google-pay-svgrepo-com.svg" alt="Google Pay" className="w-10" />
                            <img src="/assets/icons/klarna-svgrepo-com.svg" alt="Klarna" className="w-10" /> */}
                            <img src="/assets/icons/visa-svgrepo-com (1).svg" alt="VISA" className="w-10" />
                            <img src="/assets/icons/mastercard-svgrepo-com.svg" alt="MasterCard" className="w-10" />
                            </div>
                        </div>

                        {/* Row 5: Klarna Info */}
                        {/* <div className="flex items-baseline gap-2">
                            <h3 className="c-6 min-w-[100px]"></h3>
                            <p className="c-6 text-gray-700">3 payments of £15.00 with Klarna. Learn more</p>
                        </div> */}
                    </div>
                </Col>

            </div>
        </div>
    );
};

export default ProductDetail;