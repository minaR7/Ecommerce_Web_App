// pages/Women.jsx
import { Link } from 'react-router-dom';
import { Card, Breadcrumb, Row, Col, } from 'antd';
import { womenSubcategories } from '../../data/products';

const Women = () => {
    const subcategories = ['e1', 'e2', 'e3'];

    return (
        <div style={{ backgroundColor: 'white', }}>
            <div style={{ width: '100%', padding: '2rem 6rem 1rem',  backgroundColor: 'rgba(132, 152, 176, 0.5)', margin: '16px 0px'}}> 
                <Breadcrumb style={{ marginBottom: '16px' }}>
                    <Breadcrumb.Item><Link to="/">Home</Link> </Breadcrumb.Item>
                    <Breadcrumb.Item><Link to="/women">Women</Link> </Breadcrumb.Item>
                </Breadcrumb>
                <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>Women</h1> 
            </div>

        <div style={{ width: '100%', padding: '2rem 6rem 1em', margin: '16px 0px'}}>
                <Row gutter={[16,16]}>
                    { womenSubcategories.length === 0 ? (
                        <p>No products found in this subcategory.</p>) 
                    : ( womenSubcategories.map((sub) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={sub.key}>
                        <Card
                            hoverable
                            cover={<img alt={sub.label} src={sub.img} />}
                            style={{ position: 'relative',  boxShadow: '2px 3px 4px lightgray', fontSize: '20px', color: 'black' }}
                        >
                            <Link to={`/women/${sub.key}`}><Card.Meta title={sub.label} description={`(${sub.items})`} /></Link>
                        </Card>
                    </Col>
                        ))
                    )}
                </Row>
            </div>
        </div>
    );
};

export default Women;
