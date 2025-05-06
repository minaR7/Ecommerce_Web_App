// pages/ProductDetail.jsx
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb, Tag } from 'antd';
import { products, subcategories } from '../../data/products';

const ProductDetail = () => {
    const { id } = useParams();
    const product = products.find(p => p.productId === id);

    if (!product) {
        return <div style={{ padding: '20px' }}>Product not found.</div>;
    }

    const subcategoryLabel = subcategories.find(s => s.key === product.subcategory)?.label || product.subcategory;

    return (
        <div style={{ padding: '20px' }}>
            <Breadcrumb style={{ marginBottom: '16px' }}>
                <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to="/men">Men</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to={`/men/${product.subcategory}`}>{subcategoryLabel}</Link> </Breadcrumb.Item>
                {/* <Breadcrumb.Item>{product.productName}</Breadcrumb.Item> */}
            </Breadcrumb>

            <div style={{ display: 'flex', gap: '20px' }}>
                <img src={product.image} alt={product.productName} style={{ width: '300px', borderRadius: '8px' }} />
                <div>
                    <h1>{product.productName}</h1>
                    <p><strong>ID:</strong> {product.productId}</p>
                    <p>{product.productDescription}</p>
                    <h3>Available Sizes & Prices:</h3>
                    <ul>
                        {product.productSizes.map(size => (
                            <li key={size}>
                                Size: {size} - ${product.price[size]} - 
                                {product.availability[size] ? (
                                    <Tag color="green" style={{ marginLeft: '8px' }}>In Stock</Tag>
                                ) : (
                                    <Tag color="red" style={{ marginLeft: '8px' }}>Out of Stock</Tag>
                                )}
                            </li>
                        ))}
                    </ul>
                    <h3>Colors:</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {product.productColors.map(color => (
                            <Tag key={color}>{color}</Tag>
                        ))}
                    </div>
                    <h3>Reviews:</h3>
                    <ul>
                        {product.productReviews.map((review, index) => (
                            <li key={index}>{review}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
