// pages/ProductDetail.jsx
import {React, useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/slices/productSlice';
import { Rate, Button, Select, Breadcrumb, Tag, Row, Col, InputNumber,Tooltip } from 'antd';
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaGooglePay } from 'react-icons/fa';
import { HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { CheckOutlined } from '@ant-design/icons';
import { GoArrowRight } from "react-icons/go";

const ProductDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { product, loading, error } = useSelector((state) => state.products || {});
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
  
    useEffect(() => {
          dispatch(fetchProductById(id)); // Fetch product details based on ID from the URL
    }, []);
  
    useEffect(() => {
      if (product) {
        setSelectedImage(product.cover_img); // Default to the first image
      }
    }, [product]);
  
    const handleSizeSelect = (size) => {
      setSelectedSize(size);
    };
  
    const handleColorSelect = (size) => {
      setSelectedColor(size);
    };
  
    const productSizes = [...new Set(product?.variants?.map((v) => v.size))];
    const productColors = [...new Set(product?.variants?.map((v) => v.color))];
  
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!product) return <div>Product not found.</div>;

    return (
        <div style={{ backgroundColor: 'white' }}>
            <div style={{ width: '100%', padding: '2rem 6rem 1rem', backgroundColor: 'rgba(132, 152, 176, 0.5)', margin: '16px 0px' }}>
                <Breadcrumb style={{ marginBottom: '16px', font: '32px', color: 'black' }}>
                    <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/men/${product.category}`}>{product.category}</Link> </Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/men/${product.subcategory}`}>{product.subcategory}</Link> </Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/product/${product.productId}`}>{product.name}</Link></Breadcrumb.Item>
                </Breadcrumb>
                {/* <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>{product.productName}</h1> */}
            </div>

            <div className="flex md:flex-row mx-2 px-3" style={{minHeight: "75vh",}}>
                {/* h-[50vh] First Column */}
                {/* <div className="flex flex-col */}
                <Col className=" w-full md:w-1/2 mt-2" style={{height: "80vh",}}>
                    {/* First Child Container */}
                    <div className="flex items-center justify-center h-[70%]">
                        <img src={selectedImage} alt={product.name} className="object-contain w-full h-full" />
                    </div>

                    {/* Second Child Container */}
                    <div className="flex items-center justify-center h-[26%] overflow-x-auto">
                        {/* {product.images.map((img, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-24 h-24 mx-2 cursor-pointer"
                                onClick={() => setSelectedImage(img)}
                            >
                                <img src={img} alt={`Thumbnail ${index}`} className="object-cover w-full h-full" />
                            </div>
                        ))} */}
                    </div>
                </Col>

                {/* Second Column */}
                <Col className="w-full md:w-1/2 p-8 bg-[#f5f5f5]" style={{height: "80vh", borderRadius: "1rem"}} >
                    <h1 className="text-2xl font-semibold ">{product.name}</h1>
                    <h2 className="text-xl font-semibold mt-3" style={{color: "rgb(71, 89, 122)"}}>{`$${product.price}`}</h2>
                    <div className="mt-3">
                        <Rate disabled value={product.avg_rating} />
                    </div>

                    <div className="mt-4">
                        <h2 className="text-xl font-semibold" >{`${product.description}`}</h2>
                    </div>
                    <h3 className="text-xl font-semibold mt-3">Sizes:</h3>
                    {/* <div style={{ display: 'flex', gap: '8px', marginTop: '4px', width: "inherit", }}>
                        {product.productSizes.map(size => (
                            <Tag key={size} style={{ flex: '1 1 4%', textAlign: 'center' }}>{size}</Tag>
                        ))}
                    </div> */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '8px', width: "50%" }}>
                            {productSizes.map(size => (
                                <Tag key={size} style={{ textAlign: 'center', backgroundColor: size === selectedSize ? 'lightblue' : '',
                                cursor: 'pointer', padding: "2px 50px", fontSize: "16px", fontWeight: "400",
                              }}
                              onClick={() => handleSizeSelect(size)}>{size}</Tag>
                            ))}
                            {/* flex: '1 1 50%',  */}
                        </div>
                        <Button type="primary" style={{ marginLeft: '8px', backgroundColor: "rgb(71, 89, 122)", cursor: 'pointer', }}>Size Chart</Button>
                    </div>

                    <h3 className="text-xl font-semibold mt-2">Colors:</h3>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {productColors.map((color, index) => (
                             <div style={{
                                 backgroundColor: 'inherit',
                                 border: '1px solid black',
                                 borderRadius: '50%',
                                 padding: 'none',
                                 width: '30px',
                                 height: '30px',
                                 cursor: 'pointer',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                             }}
                         > <Button
                                key={index}
                                style={{
                                    backgroundColor: color,
                                    border: 'none',
                                    borderRadius: '50%',
                                    padding: '10px',
                                    width: '24px',
                                    height: '24px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onClick={() => handleColorSelect(size)}  // Handle color selection
                            >
                                {/* Optional: You can add an icon or text inside the button if needed */}
                            </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex mt-2">
                        <Col style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: "100%" }}>
                            <div style={{ display: 'flex', }}>
                                <h3 className="text-xl font-semibold mr-2">Quantity:</h3>
                                <InputNumber min={1} max={10} defaultValue={1} onChange={(value) => console.log('changed', value)}  />
                            </div>

                        {/* addtocart wishlist  */}
                            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center',  width: "100%", marginLeft: "1rem" }}>
                                <Tooltip title="Add to Wishlist">
                                    <Button
                                        shape="circle"
                                        icon={<HeartOutlined />}
                                        style={{ backgroundColor: 'black', color: 'white', fontWeight: "500", marginRight: '8px', }}
                                        disabled={!product.isStock}
                                    />
                                </Tooltip>
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: 'black', borderColor: 'black', marginRight: '8px', color: "white", fontWeight: "500"}}
                                    disabled={!product.isStock}
                                >
                                    <ShoppingCartOutlined></ShoppingCartOutlined>Add to Cart
                                </Button>
                                
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: 'black', borderColor: 'black', marginRight: '8px', color: "white", fontWeight: "500"}}
                                    disabled={!product.isStock}
                                >
                                    <GoArrowRight></GoArrowRight>Proceed to Checkout
                                </Button>
                            </div>
                        </Col>
                    </div>

                    { /* Details */}
                    <div className="mt-3">
                        <h3 className="text-lg font-semibold">Collection:</h3>
                        <p>Click & Collect - Select store at checkout.</p>
                        <h3 className="text-lg font-semibold">Postage:</h3>
                        <p className="text-green-600">Free delivery in 2-3 days</p>
                        <p>Estimated between Tue, 29 Apr and Wed, 30 Apr to T45. See details</p>
                        <h3 className="text-lg font-semibold">Returns:</h3>
                        <p>30 days return. Seller pays for return postage. See details</p>
                        <h3 className="text-lg font-semibold">Payments:</h3>
                        <div className="flex space-x-2">
                        <img src="/assets/icons/paypal-3-svgrepo-com.svg" alt="PayPal" className="w-10"/>
                        <img src="/assets/icons/google-pay-svgrepo-com.svg" alt="Google Pay" className="w-10"/>
                        <img src="/assets/icons/klarna-svgrepo-com.svg" alt="Klarna" className="w-10"/>
                        <img src="/assets/icons/visa-svgrepo-com (1).svg" alt="VISA" className="w-10"/>
                        <img src="/assets/icons/mastercard-svgrepo-com.svg" alt="MasterCard" className="w-10"/>
                        </div>
                        <p className="mt-2">3 payments of £15.00 with Klarna. Learn more</p>
                    </div>
                </Col>
            </div>
        </div>
    );
};

export default ProductDetail;