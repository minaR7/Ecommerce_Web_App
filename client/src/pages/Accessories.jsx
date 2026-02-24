// pages/Accessories.jsx
import { Link } from 'react-router-dom';
import { Card, Breadcrumb, Row } from 'antd';

const Accessories = () => {
    // const subcategories = ['p1', 'p2', 'p3'];
    const subcategories = [];

    return (
        <div style={{ backgroundColor: 'white', }}>
            <div style={{ width: '100%', padding: '2rem 6rem 1rem',  backgroundColor: 'rgba(132, 152, 176, 0.5)', margin: '16px 0px'}}> 
                <Breadcrumb style={{ marginBottom: '16px' }}>
                    <Breadcrumb.Item><Link to="/">Home</Link> </Breadcrumb.Item>
                    <Breadcrumb.Item><Link to="/accessories">Accessories</Link></Breadcrumb.Item>
                </Breadcrumb>
                <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>Accessories</h1> 
            </div>

        <div style={{ width: '100%', padding: '2rem 6rem 1em', margin: '16px 0px'}}>
                <Row gutter={[16,16]}>
                    { subcategories.length === 0 ? (
                        <p>No products found in this subcategory.</p>) : 
                    (subcategories?.map((sub) => (
                        <Card
                            key={sub}
                            title={sub.toUpperCase()}
                            style={{ width: 200 }}
                        >
                            <p>Some content for {sub}</p>
                            <Link to={`/accessories/${sub}`}>View {sub}</Link>
                        </Card>
                    )))}
                </Row>     
            </div>
        </div>
    );
};

export default Accessories;
