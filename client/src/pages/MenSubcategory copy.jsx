// // pages/MenSubcategory.jsx
// import { useParams } from 'react-router-dom';
// import { Breadcrumb } from 'antd';
// import { Link } from 'react-router-dom';

// const MenSubcategory = () => {
//     const { subcategory } = useParams();

//     return (
//         <div style={{ padding: '20px' }}>
//             <Breadcrumb style={{ marginBottom: '16px' }}>
//                 <Breadcrumb.Item><Link to="/">Home</Link> </Breadcrumb.Item>
//                 <Breadcrumb.Item>
//                     <Link to="/men">Men</Link>
//                 </Breadcrumb.Item>
//                 <Breadcrumb.Item>{subcategory.toUpperCase()}</Breadcrumb.Item>
//             </Breadcrumb>
//             <h1>Men - {subcategory.toUpperCase()} Page</h1>
//             <p>Displaying products for {subcategory.toUpperCase()}.</p>
//         </div>
//     );
// };

// export default MenSubcategory;


// pages/MenSubcategory.jsx
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb, Card } from 'antd';
import { products, subcategories, sampleProducts } from '../../data/products'

const MenSubcategory = () => {
    const { subcategory } = useParams();
    const filteredProducts = products.filter(p => p.subcategory === subcategory);

    const subcategoryLabel = subcategories.find(s => s.key === subcategory)?.label || subcategory;
    console.log(subcategory)
    return (
        <div style={{ padding: '20px', margin: "0px 24px" , display: "flex", flexDirection: "column", alignItems: "start"}}>
            <Breadcrumb style={{ marginBottom: '16px' }}>
                <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to="/men">Men</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to={`/men/${subcategory}`}>{subcategoryLabel}</Link></Breadcrumb.Item>
            </Breadcrumb>
            {/* <h1>{subcategoryLabel}</h1> */}

            {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {filteredProducts.length === 0 ? (
                    <p>No products found in this subcategory.</p>
                ) : (
                    filteredProducts.map(product => (
                        <Card
                            key={product.productId}
                            title={product.productName}
                            cover={<img alt={product.productName} src={product.image} />}
                            style={{ width: 240 }}
                        >
                            <p>{product.productDescription}</p>
                            <Link to={`/product/${product.productId}`}>View Details</Link>
                        </Card>
                    ))
                )}
            </div> */}
            <div className="text-gray-900 font-sans max-w-7xl py-2">
            <div className="mb-2">
                <h1 className="text-lg font-semibold">{subcategoryLabel}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {sampleProducts.map((product, index) => (
                <div
                    key={index}
                    className="rounded-md shadow-sm p-2 relative hover:shadow-md transition-shadow duration-200"
                >
                    {product.isChoice && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-green-700 to-green-900 text-white text-xs font-semibold px-2 py-0.5 rounded-tr-md rounded-br-md flex items-center space-x-1 select-none" style={{ fontFamily: 'Arial, sans-serif' }}>
                        <span>Amazon's</span>
                        <span className="bg-green-900 px-1 rounded text-[10px] font-bold">Choice</span>
                    </div>
                    )}
                    <img
                    src={product.image}
                    alt={product.alt}
                    className="w-full object-contain"
                    height={300}
                    width={260}
                    />

                    {/* <div className="flex space-x-1 mt-2 justify-center">
                    {product.colors.slice(0, 5).map((color, idx) => (
                        <span
                        key={idx}
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                        ></span>
                    ))}
                    {product.extraColors > 0 && (
                        <span className="text-xs text-gray-600 self-center">+{product.extraColors}</span>
                    )}
                    </div> */}

                    <h3 className="text-center text-lg font-bold mt-1">{product.brand}</h3>
                    {/* <p className="text-center text-xs mt-1 leading-tight line-clamp-2">{product.title}</p> */}

                    <div
                    aria-label={`Rating ${product.rating} out of 5 stars`}
                    className="flex justify-center items-center space-x-1 mt-1 text-xs star-rating"
                    >
                    {Array.from({ length: 5 }).map((_, i) => {
                        if (i + 1 <= Math.floor(product.rating)) {
                        return <i key={i} className="fas fa-star"></i>;
                        } else if (i < product.rating) {
                        return <i key={i} className="fas fa-star-half-alt"></i>;
                        } else {
                        return <i key={i} className="far fa-star"></i>;
                        }
                    })}
                    <span className="text-gray-700">({product.rating})</span>
                    </div>

                    <div className="text-center mt-1 text-2xl font-semibold leading-none">
                    ${product.price}
                    {product.priceDecimal && (
                        <span className="text-sm align-top">{product.priceDecimal}</span>
                    )}
                    {product.oldPrice && (
                        <span className="text-xs line-through text-gray-400 ml-1">
                        ${product.oldPrice}
                        </span>
                    )}
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
    );
};

export default MenSubcategory;