// pages/Men.jsx
import { Link } from 'react-router-dom';
import { Card, Breadcrumb, Row, Col, } from 'antd';
import { subcategories } from '../../data/products';

const Men = () => {
    // const subcategories = ['p1', 'p2', 'p3'];

    return (
        <div style={{ backgroundColor: 'white', }}>
            <div style={{ width: '100%', padding: '2rem 6rem 1rem',  backgroundColor: 'rgba(132, 152, 176, 0.5)', margin: '16px 0px'}}> 
                <Breadcrumb style={{ marginBottom: '16px', font: '32px', color: 'black', }}>
                    <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to="/men">Men</Link></Breadcrumb.Item>
                </Breadcrumb>
                <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>Men</h1>
            </div>
            <div style={{ width: '100%', padding: '2rem 6rem 1em', margin: '16px 0px'}}>
                <Row gutter={[16,16]}>
                    { subcategories.length === 0 ? (
                        <p>No products found in this subcategory.</p>) 
                    : ( subcategories.map((sub) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={sub.key}>
                        <Card
                            hoverable
                            cover={<img alt={sub.label} src={sub.img} />}
                            style={{ position: 'relative',  boxShadow: '2px 3px 4px lightgray', fontSize: '20px', color: 'black' }}
                        >
                            <Link to={`/men/${sub.key}`}><Card.Meta title={sub.label} description={`(${sub.items})`} /></Link>
                        </Card>
                    </Col>
                        ))
                    )}
                </Row>
            </div>
        </div>
    );
};

export default Men;
