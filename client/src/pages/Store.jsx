// Store.jsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, Breadcrumb, Row, Col, } from 'antd';
import axios from 'axios';

const Store = () => {
  const { categoryName } = useParams();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await axios.get(`http://localhost:3005/api/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [categoryName]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ backgroundColor: 'white', }}>
        <div style={{ width: '100%', padding: '2rem 6rem 1rem',  backgroundColor: 'rgba(132, 152, 176, 0.5)', margin: '16px 0px'}}> 
            <Breadcrumb style={{ marginBottom: '16px', font: '32px', color: 'black', }}>
                <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>Store</h1>
        </div>
        <div style={{ width: '100%', padding: '2rem 6rem 1em', margin: '16px 0px'}}>
            <Row gutter={[16,16]}>
                {categories?.length === 0 ? (
                    <p>No categories found in store.</p>) 
                : ( categories.map((sub) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={sub.category_id}>
                        <Link to={`/store/${sub.name}`}>
                        <Card
                            hoverable
                            cover={<img alt={sub.name} src={sub.cover_img} width={1} height={1}/>}
                            style={{ position: 'relative',  boxShadow: '2px 3px 4px lightgray', fontSize: '20px', color: 'black', height: '50%' }}
                        >
                            <Card.Meta title={sub.name} description={`(${sub.description})`} />
                        </Card>
                        </Link>
                    </Col>
                    ))
                )}
            </Row>
        </div>
    </div>
  );
};

export default Store;
