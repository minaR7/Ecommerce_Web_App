// import { useParams } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const Category = () => {
//   const { categoryName, subcategoryName } = useParams();

//   const [subcategories, setSubcategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch subcategories based on categoryName
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const subRes = await axios.get(`http://localhost:3005/api/subcategories?category=${categoryName}`);
//         setSubcategories(subRes.data);

//         let productUrl = `http://localhost:3005/api/products?category=${categoryName}`;
//         if (subcategoryName) {
//           productUrl += `&subcategory=${subcategoryName}`;
//         }

//         const prodRes = await axios.get(productUrl);
//         setProducts(prodRes.data);
//       } catch (error) {
//         console.error('Error fetching category data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [categoryName, subcategoryName]);

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4 capitalize">
//         {subcategoryName || categoryName}
//       </h2>

//       {subcategories.length > 0 && !subcategoryName && (
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold">Subcategories</h3>
//           <ul className="flex gap-4">
//             {subcategories.map((sub) => (
//               <li key={sub.subcategory_id}>
//                 <a
//                   href={`/category/${categoryName}/${sub.name}`}
//                   className="text-blue-600 hover:underline"
//                 >
//                   {sub.name}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {products.map((product) => (
//           <div key={product.id} className="border p-2 rounded shadow-sm">
//             <img src={product.coverImg} alt={product.name} />
//             <p className="font-semibold">{product.name}</p>
//             <p>${product.basePrice}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Category;


// Category.jsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, Breadcrumb, Row, Col, } from 'antd';
import axios from 'axios';

const Category = () => {
  const { categoryName } = useParams();

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await axios.get(`http://localhost:3005/api/subcategories?category=${categoryName}`);
        setSubcategories(res.data);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
    console.log('run')
  }, [categoryName]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ backgroundColor: 'white', }}>
        <div style={{ width: '100%', padding: '2rem 6rem 1rem',  backgroundColor: 'rgba(132, 152, 176, 0.5)', margin: '16px 0px'}}> 
            <Breadcrumb style={{ marginBottom: '16px', font: '32px', color: 'black', }}>
                <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to={`/store/${categoryName}`}>{categoryName}</Link></Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xxl font-semibold" style={{ margin: '16px 0', color: "rgb(71, 89, 122)" }}>{categoryName}</h1>
        </div>
        <div style={{ width: '100%', padding: '2rem 6rem 1em', margin: '16px 0px'}}>
            <Row gutter={[16,16]}>
                { subcategories?.length === 0 ? (
                    <p>No products found in this category.</p>) 
                : ( subcategories.map((sub) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={sub.subcategory_id}>
                        <Link to={`/store/${categoryName}/${sub.name}`}>
                        <Card
                            hoverable
                            cover={<img alt={sub.name} src={sub.cover_img} />}
                            style={{ position: 'relative',  boxShadow: '2px 3px 4px lightgray', fontSize: '20px', color: 'black' }}
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

export default Category;
