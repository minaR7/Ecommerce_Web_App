// ProductListing.jsx
import { useParams, Link  } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, Breadcrumb, Row, Col, Rate, Tag} from 'antd';
import axios from 'axios';

const ProductListing = () => {
  const { categoryName, subcategoryName } = useParams();

  const [subcategoryId, setSubcategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsBySubcategory = async () => {
      try {
        // First, fetch subcategories to get the ID of the current subcategory
        const subRes = await axios.get(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/subcategories?category=${categoryName}`);
        const matchedSub = subRes.data.find(
          (sub) => sub.name.toLowerCase() === subcategoryName.toLowerCase()
        );

        if (!matchedSub) {
          console.error('Subcategory not found');
          return;
        }

        setSubcategoryId(matchedSub.subcategory_id);

        // Now fetch products using subcategory ID
        const prodRes = await axios.get(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/products?subcategory=${matchedSub.subcategory_id}`);
        setProducts(prodRes.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsBySubcategory();
    console.log('run')
  }, [categoryName, subcategoryName]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ backgroundColor: 'white', }}>
        <div style={{ width: '100%', padding: '2rem 6rem 1rem',  backgroundColor: 'rgba(132, 152, 176, 0.5)', margin: '16px 0px'}}> 
            <Breadcrumb style={{ marginBottom: '16px', font: '32px', color: 'black', }}>
                <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to={`/store/${categoryName}`}>{categoryName}</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to={`/store/${categoryName}/${subcategoryName}`}>{subcategoryName}</Link></Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>{subcategoryName}</h1>
        </div>

      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-2 rounded shadow-sm">
            <img src={product.coverImg} alt={product.name} />
            <p className="font-semibold">{product.name}</p>
            <p>${product.basePrice}</p>
          </div>
        ))}
      </div> */}
        <div className='product-list-container' style={{ width: '100%', padding: '2rem 6rem 1em', margin: '16px 0px'}}>
            <Row gutter={[16,16]}>
                { products?.length === 0 ? (
                    <p>No products found in this category.</p>) 
                : ( products.map((product) => {
                  const originalPrice = product?.price;
                  const discount = product?.discount_percentage || 0;
                  const discountedPrice =
                    discount > 0
                      ? (originalPrice - (originalPrice * discount) / 100).toFixed(2)
                      : originalPrice.toFixed(2);

                      
                  console.log(product, discount)
                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={product.product_id}>
                          {/* <Link to={`/store/${categoryName}/${subcategoryName}/${product.name}`}> */}
                        <Link to={`/product/${product.product_id}`}>
                          <Card
                            hoverable
                            style={{
                              position: 'relative',
                              boxShadow: '2px 3px 4px lightgray',
                              fontSize: '16px',
                              color: 'black',
                              height: '100%', // ensure uniform height
                            }}
                            // style={{
                    //               width: '100%',
                    //               height: '100%',
                    //               objectFit: 'cover', // maintains aspect ratio and fills the box
                    //             }}/>}
                    //         style={{ position: 'relative',  boxShadow: '2px 3px 4px lightgray', fontSize: '20px', color: 'black' }}
                            cover={
                              // <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                                <img
                                  alt={product.name}
                                  src={product.cover_img}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover', // maintains aspect ratio and fills the box
                                  }}
                                />
                            // </div> 
                            }
                          >
                            <Card.Meta title={product.name} />
                            {/* <h4
                              className="text-xl font-semibold mt-3"
                              style={{ color: 'rgb(71, 89, 122)' }}
                            >
                              €{product.price}
                              
                            </h4> */}
                            <div className="product-list-card-details flex items-center gap-3 mt-3">
                                {discount > 0 ? (
                                    <>
                                    <span style={{ textDecoration: 'line-through', color: 'gray'}}>
                                        €{product.price}
                                    </span>
                                    <span style={{ fontWeight: '600', color: 'rgb(220, 38, 38)' }}>
                                        €{discountedPrice}
                                    </span>
                                    <Tag color="green" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                        -{discount}%
                                    </Tag>
                                    </>
                                ) : (
                                    <span style={{ fontSize: '22px', fontWeight: '600', color: 'rgb(71, 89, 122)' }}>
                                    €{product.price}
                                    </span>
                                )}
                          </div>

                            {/* <div className="mt-3">
                              <Rate disabled value={parseFloat(product.avg_rating)} />
                            </div> */}
                          </Card>
                        </Link>
                      </Col>
                      )
                })
                )}
            </Row>
        </div>
    </div>
  );
};

export default ProductListing;
