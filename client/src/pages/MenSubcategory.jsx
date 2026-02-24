import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb, Card, Col, Row, Rate, Button, Tooltip} from 'antd';
import { products, subcategories, sampleProducts } from '../../data/products'
import { HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
// import "../assets/card.css";

const MenSubcategory = () => {
    const { subcategory } = useParams();
    const filteredProducts = products.filter(p => p.subcategory === subcategory);

    const subcategoryLabel = subcategories.find(s => s.key === subcategory)?.label || subcategory;

    return (
        <div style={{ backgroundColor: 'white' }}>
            <div style={{ width: '100%', padding: '2rem 6rem 1rem', backgroundColor: 'rgba(132, 152, 176, 0.5)', margin: '16px 0px' }}>
                <Breadcrumb style={{ marginBottom: '16px', font: '32px', color: 'black' }}>
                    <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to="/men">Men</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/men/${subcategory}`}>{subcategoryLabel}</Link></Breadcrumb.Item>
                </Breadcrumb>
                <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>{subcategoryLabel}</h1>
            </div>
            <div style={{ width: '100%', padding: '2rem 6rem 1em', margin: '16px 0px' }}>
                <Row gutter={[16, 16]}>
                    {filteredProducts.length === 0 ? (
                        <p>No products found in this subcategory.</p>
                    ) : (filteredProducts.map(product => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product.productId}>
                            {/* <Card
                                hoverable
                                cover={<img alt={product.productName} src={product.image} />}
                                style={{ position: 'relative', boxShadow: '2px 3px 4px lightgray' }}
                            >
                                {product.isStock === false && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0',
                                        right: '0',
                                        backgroundColor: 'black',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '0 0 0 4px'
                                    }}>
                                        Out of Stock
                                    </div>
                                )}
                                <Link to={`/product/${product.productId}`}>
                                    <Card.Meta title={product.productName} description={`$${product.price.M}`} />
                                </Link>
                                <div style={{ marginTop: '8px' }}>
                                    <Rate disabled defaultValue={product.rating} />
                                    <span style={{ marginLeft: '8px' }}>{product.reviewCount} reviews</span>
                                </div>
                                <div className="card-buttons" style={{
                                    position: 'absolute',
                                    bottom: '16px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'none',
                                    flexDirection: 'row',
                                    gap: '8px',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                }}>
                                    <Button
                                        type="primary"
                                        style={{ backgroundColor: 'black', borderColor: 'black' }}
                                        disabled={!product.isStock}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Tooltip title="Add to Wishlist">
                                        <Button
                                            shape="circle"
                                            icon={<HeartOutlined />}
                                            style={{ backgroundColor: 'black', color: 'white' }}
                                            disabled={!product.isStock}
                                        />
                                    </Tooltip>
                                </div>
                            </Card> */}
                            <Card
                            hoverable
                            style={{ position: 'relative', boxShadow: '2px 3px 4px lightgray' }}
                            cover={
                                <div style={{ position: 'relative' }}>
                                    <img alt={product.productName} src={product.image} style={{ width: '100%', display: 'block' }} />
                                    <div className="card-buttons">
                                        <Button
                                            type="primary"
                                            style={{ backgroundColor: 'black', borderColor: 'black', marginRight: '8px', color: "white",position: 'absolute', bottom: '6px', left: '3rem' }}
                                            disabled={!product.isStock}
                                        >
                                            <ShoppingCartOutlined></ShoppingCartOutlined>Add to Cart
                                        </Button>
                                        <Tooltip title="Add to Wishlist">
                                            <Button
                                                shape="circle"
                                                icon={<HeartOutlined />}
                                                style={{ backgroundColor: 'black', color: 'white',  position: 'absolute', bottom: '6px', right: '3rem' }}
                                                disabled={!product.isStock}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            }
                        >
                            {product.isStock === false && (
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    backgroundColor: 'black',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '0 0 0 4px'
                                }}>
                                    Out of Stock
                                </div>
                            )}
                            <Link to={`/product/${product.productId}`}>
                                <Card.Meta title={product.productName} description={`$${product.price.M}`} />
                            </Link>
                            {/* <div style={{ marginTop: '8px' }}>
                                <Rate disabled defaultValue={product.rating} />
                                <span style={{ marginLeft: '8px' }}>{product.reviewCount} reviews</span>
                            </div> */}
                        </Card>

                        </Col>
                    )))}
                </Row>
            </div>
        </div>
    );
};

export default MenSubcategory;
