// pages/ProductDetail.jsx
import {React, useState, useEffect} from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/slices/productSlice';
import { Rate, Button, Select, Breadcrumb, Tag, Row, Col, InputNumber, Tooltip, Radio, Modal, List, Image } from 'antd';
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaGooglePay, FaArrowLeft, FaArrowRight, FaTimes  } from 'react-icons/fa';
import { MinusOutlined, PlusOutlined, HeartOutlined, ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { CheckOutlined } from '@ant-design/icons';
import { GoArrowRight } from "react-icons/go";
import Items from '../components/ItemsList';
import { addToCart, openDrawer, closeDrawer, updateCartItem } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/wishlistSlice';
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useSiteSettings } from '../hooks/useSiteSettings';

const ProductDetail = () => {

    const { settings } = useSiteSettings();
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { product, loading, error } = useSelector((state) => state.products || {});
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImgModalOpen, setIsImgModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
    const [sizeChartUrl, setSizeChartUrl] = useState('');
    const userExist = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        dispatch(fetchProductById(id)); // Fetch product details based on ID from the URL
    }, []);

    
    const productSizes = [...new Set(product?.variants?.map((v) => v.size))];
    const productColors = [...new Set(product?.variants?.map((v) => v.color))];

    useEffect(() => {
      if (product) {
        // slide_images now includes the cover image as its first entry, so default
        // to it — this keeps the cover as a selectable thumbnail instead of losing it
        setSelectedImage(product.slide_images?.[0] || product.cover_img);
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

    const openSizeChart = () => {
      if (product?.size_chart) {
        setSizeChartUrl(product.size_chart);
      } else {
        setSizeChartUrl('');
      }
      setIsSizeChartOpen(true);
    };

     const handleImageClick = (index) => {
        setCurrentIndex(index);
        // setIsImgModalOpen(true);
    };

    // const nextImage = () => {
    //     setCurrentIndex((prevIndex) =>
    //     prevIndex === product?.slide_images.length - 1 ? 0 : prevIndex + 1
    //     );
    // };

    const nextImage = () => {
        setCurrentIndex((prevIndex) => {
          const newIndex = prevIndex === product?.slide_images.length - 1 ? 0 : prevIndex + 1;
          setSelectedImage(product?.slide_images[newIndex]);
          return newIndex;
        });
      };
      
      const prevImage = () => {
        setCurrentIndex((prevIndex) => {
          const newIndex = prevIndex === 0 ? product?.slide_images.length - 1 : prevIndex - 1;
          setSelectedImage(product?.slide_images[newIndex]);
          return newIndex;
        });
      };
      
    
    const originalPrice = product?.price;
    const discount = product?.discount_percentage || 0;
    const discountedPrice = discount > 0 ? (originalPrice - (originalPrice * discount) / 100).toFixed(2) : originalPrice;

    const handleAddToCart = async () => {
        const payload = {
            productId: product.product_id,
            variant_id: selectedVariant.variant_id,
            quantity: selectedQuantity,
            coverImg: product.cover_img,
            name: product.name,
            basePrice:  discount > 0 ?  (originalPrice - (originalPrice * discount) / 100).toFixed(2) : product.price,
            discountRate: product.discount_percentage,
            discountedPrice: discountedPrice,
            size: selectedVariant.size,
            color: selectedVariant.color,
        }
        console.log(payload)
        try {
            const resultAction = await dispatch(addToCart(payload));
            setIsModalOpen(true); 
            // Reset quantity back to 1 after successfully adding to cart
            setSelectedQuantity(1);
            // dispatch(openDrawer());
            // setTimeout(() => {
            // dispatch(closeDrawer());
            // }, 2000);
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
      <>
        <div style={{ backgroundColor: 'white' }}>
            <div className="w-full py-6 px-4 md:px-24 my-4" style={{ backgroundColor: 'rgba(132, 152, 176, 0.5)' }}>
                <Breadcrumb style={{ marginBottom: '16px', font: '32px', color: 'black' }}>
                    <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/store/${product.category}`}>{product.category}</Link> </Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/store/${product.category}/${product.subcategory}`}>{product.subcategory}</Link> </Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/product/${product.product_id}`}>{product.name}</Link></Breadcrumb.Item>
                </Breadcrumb>
                {/* <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>{product.productName}</h1> */}
            </div>

            <div className="flex flex-col md:flex-row gap-6  mx-2 px-3 md:min-h-[70vh]">
                {/* h-[50vh] First Column */}
                {/* <div className="flex flex-col */}
                <Col className=" w-full md:w-1/2 mt-2 flex flex-col gap-4 md:h-[70vh]">
                    {/* First Child Container — responsive height: a manageable square-ish
                        area on mobile instead of a 70vh empty box; 70% of the column on desktop */}
                    <div className="relative flex items-center justify-center h-[70vw] max-h-[420px] md:h-[70%] md:max-h-none">
                       
                                        <button
                    className="absolute left-4 text-white text-3xl"
                    onClick={prevImage}
                >
                    <FaArrowLeft />
                </button>
                 <Image src={selectedImage || product?.slide_images[0]} alt={product?.name} className="object-contain max-w-full max-h-full" / >
                 {/*         <img
                            src={selectedImage || product?.slide_images[0]}
                            alt={product?.name}
                            className="object-contain max-w-full max-h-full cursor-pointer"
                            onClick={() => handleImageClick(product?.slide_images.indexOf(selectedImage || product?.slide_images[0]))}
                        /> */} 
                <button
                    className="absolute right-4 text-white text-3xl"
                    onClick={nextImage}
                >
                    <FaArrowRight />
                </button>
                         {/* <Image
                            src={selectedImage || product?.slide_images[0]}
                            alt={product?.name}
                            className="object-contain max-w-full max-h-full cursor-pointer"
                            preview={{
                                visible: isImgModalOpen,
                                onVisibleChange: (visible) => setIsImgModalOpen(visible),
                                current: product?.slide_images.indexOf(selectedImage || product?.slide_images[0]),
                                src: product?.slide_images, // 👈 gives full gallery with zoom & arrows
                            }}
                            /> */}
                    </div>

                    {/* Second Child Container */}
                    <div className="flex items-center justify-center overflow-x-auto px-2 mt-2 md:h-[26%]">
                        {(Array.isArray(product?.slide_images) && product.slide_images.length ? product.slide_images : [null]).map((img, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-24 h-24 mx-2 cursor-pointer"
                                onClick={() => img && setSelectedImage(img)}
                            >
                                 {/* <Image
                                    src={img}
                                    alt={`Thumbnail ${index}`}
                                    className="object-cover w-full h-full border-2 border-gray-200 hover:border-blue-500"
                                    preview={false} // disable preview on thumbnails
                                /> */}
                                {img ? (
                                  <img src={img} alt={`Thumbnail ${index}`} className="object-cover w-full h-full border-2 border-gray-200 hover:border-blue-500" />
                                ) : (
                                  <div
                                    className="w-full h-full border-2 border-gray-200"
                                    style={{ background: 'linear-gradient(135deg, #f0f0f0 0%, #d9d9d9 100%)' }}
                                  />
                                )}
                            </div>
                        ))}
                    </div>
                </Col>

        {/* Modal for Zoomed Image */}
            {isImgModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <button
                    className="absolute top-4 right-4 text-white text-3xl"
                    onClick={() => setIsImgModalOpen(false)}
                >
                    <FaTimes />
                </button>

                <button
                    className="absolute left-4 text-white text-3xl"
                    onClick={prevImage}
                >
                    <FaArrowLeft />
                </button>

                <Zoom>
                  {product?.slide_images?.[currentIndex] ? (
                    <img src={product?.slide_images[currentIndex]} alt="Zoomed" />
                  ) : (
                    <div
                      style={{
                        width: '60vw',
                        height: '60vh',
                        background: 'linear-gradient(135deg, #202020 0%, #2a2a2a 100%)',
                        borderRadius: 12,
                      }}
                    />
                  )}
                </Zoom>
                {/* <img
                    src={product?.slide_images[currentIndex]}
                    alt="Zoomed"
                    className="max-h-[80%] max-w-[80%] object-contain"
                /> */}

                <button
                    className="absolute right-4 text-white text-3xl"
                    onClick={nextImage}
                >
                    <FaArrowRight />
                </button>
                </div>
            )}
                {/* Second Column height65 vh overflow auto*/}
                {/* h-auto md:h-[65vh] overflow-visible */}
                <Col className="w-full md:w-1/2 p-8 bg-[#f5f5f5] overflow-hidden" style={{ height: "auto", borderRadius: "1rem",}}>
                    <h1 className="text-2xl font-semibold ">{product.name}</h1>
                    {/* <h2 className="text-xl font-semibold mt-3" style={{ color: "rgb(71, 89, 122)" }}>{`€${product.price}`}</h2> */}
                    <div className="flex items-center gap-3 mt-3">
                        {discount > 0 ? (
                            <>
                            <span style={{ textDecoration: 'line-through', color: 'gray', fontSize: '22px' }}>
                                €{originalPrice}
                            </span>
                            <span style={{ fontSize: '22px', fontWeight: '600', color: 'rgb(220, 38, 38)' }}>
                                €{discountedPrice}
                            </span>
                            <Tag color="green" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                -{discount}%
                            </Tag>
                            </>
                        ) : (
                            <span style={{ fontSize: '22px', fontWeight: '600', color: 'rgb(71, 89, 122)' }}>
                            €{originalPrice}
                            </span>
                        )}
                    </div>

                    {/* <div className="mt-3">
                        <Rate disabled value={parseFloat(product.avg_rating)} />
                    </div> */}

                    <div className="mt-4">
                        <h2 className="text-xl font-medium text-gray-800">{product.description}</h2>
                    </div>

                    {/* Sizes Label + Tags + Size Chart Button */}
                    <div className="flex-col sm:flex-row sm:flex sm:items-center sm:justify-between mt-4 flex w-full">
                       <div className="flex-col sm:flex-row flex sm:items-start items-center w-full sm:w-auto mb-3 sm:mb-0 gap-2 sm:gap-0">
                            <h3 className="text-xl font-semibold mr-2 mb-2 sm:mb-0 shrink-0 w-full sm:w-auto text-center sm:text-left">Sizes:</h3>
                            <div className="flex gap-2 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
                                {productSizes.map(size => (
                                <Tag
                                    key={size}
                                    value={selectedSize}
                                    style={{
                                    textAlign: 'center',
                                    backgroundColor: size === selectedSize ? 'lightblue' : '',
                                    cursor: 'pointer',
                                    padding: '6px 18px',
                                    fontSize: '16px',
                                    fontWeight: '400',
                                    minWidth: '56px',
                                    }}
                                    onClick={() => handleSizeSelect(size)}
                                >
                                    {size}
                                </Tag>
                                ))}
                            </div>
                       </div>
                        <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                            <Button type="primary" style={{ backgroundColor: "rgb(71, 89, 122)", width: '100%' }} className='size-chart-btn sm:w-auto' onClick={openSizeChart}>Size Chart</Button>
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
                    <div className="quantity-cart-div flex items-center gap-3 mt-3">
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
                                style={{ width: 60, textAlign: 'center' }}
                                className='quantity-input'
                                value={selectedQuantity}
                                onChange={(value) => setSelectedQuantity(Math.min(10, Math.max(1, value || 1)))}
                                controls={false}
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
                           className='add-to-cart-btn'
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
                        {/* Row 1: Shipping charges */}
                        {settings.product_shipping_charges && (
                        <div className="flex items-baseline gap-2 mt-1 align-center">
                            <h3 className="c-1 text-lg font-semibold min-w-[100px]">Shipping:</h3>
                            <p className="c-1 text-gray-700">{settings.product_shipping_charges}</p>
                        </div>
                        )}

                        {/* Row 2: Collection */}
                        {settings.product_collection && (
                        <div className="flex items-baseline gap-2 mt-1 align-center">
                            <h3 className="c-1 text-lg font-semibold min-w-[100px]">Collection:</h3>
                            <p className="c-1 text-gray-700">{settings.product_collection}</p>
                        </div>
                        )}

                        {/* Row 3: Postage */}
                        {settings.product_postage && (
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="c-2 text-lg font-semibold min-w-[100px]">Postage:</h3>
                            <div className="c-2">
                            <p className="text-green-600">{settings.product_postage}</p>
                            </div>
                        </div>
                        )}

                        {/* Row 4: Returns */}
                        {settings.product_returns && (
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="c-4 text-lg font-semibold min-w-[100px]">Returns:</h3>
                            <p className="c-4 text-gray-700">
                                {settings.product_returns}{' '}
                                <Link to="/exchange-return" className="text-green-600! hover:text-green-700! hover:underline">
                                    See details
                                </Link>
                            </p>
                        </div>
                        )}

                        {/* Row 5: Payments — icons managed from Admin → Site Content → Payment Methods */}
                        {Array.isArray(settings.payment_methods) && settings.payment_methods.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <h3 className="text-lg font-semibold min-w-[100px]">Payments:</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                            {settings.payment_methods.map((pm, i) => (
                                <img
                                    key={`${pm.name || 'pm'}-${i}`}
                                    src={pm.icon_url_resolved || pm.icon_url}
                                    alt={pm.name || 'Payment method'}
                                    title={pm.name || ''}
                                    className="w-10 h-7 object-contain"
                                />
                            ))}
                            </div>
                        </div>
                        )}
                    </div>
                </Col>

            </div>
        </div>
        <Modal
            title="Item Added to Cart"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={[
                <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
                Close
                </Button>,
                     <Button key="close" type="primary" onClick={() => {navigate('/cart')
                                        setTimeout(() => {
                                        dispatch(closeDrawer());
                                        }, 300);}}>
                View Cart
                </Button>,
            ]}
            >
            <Items noDrawerBtn={true}/>
        </Modal>

        <Modal
          title="Size Chart"
          open={isSizeChartOpen}
          onCancel={() => setIsSizeChartOpen(false)}
          footer={null}
          width={600}
        >
          {sizeChartUrl ? (
            <Image src={sizeChartUrl} alt="Size Chart" width="100%" />
          ) : (
            <p>No size chart available.</p>
          )}
        </Modal>
      </>
    );
};

export default ProductDetail;
