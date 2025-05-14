// // components/NavigationLinks.jsx
// import { Link } from 'react-router-dom'; // If using React Router; change to <a> if not
// import { Dropdown, Menu } from 'antd';
// import { subcategories } from '../../data/products'

// const categories = [
//     { name: 'Men', path: '/men' },
//     { name: 'Women', path: '/women' },
//     { name: 'Kids', path: '/kids' },
//     { name: 'Accessories', path: '/accessories' },
// ];

// // const NavigationLinks = ({ onClick }) => {

// //     const menSubmenu = {
// //         items: [
// //             { key: 'p1', label: <Link to="/men/p1" onClick={onClick}>P1</Link> },
// //             { key: 'p2', label: <Link to="/men/p2" onClick={onClick}>P2</Link> },
// //             { key: 'p3', label: <Link to="/men/p3" onClick={onClick}>P3</Link> },
// //         ],
// //     };

// //     const womenSubmenu = {
// //         items: [
// //             { key: 'e1', label: <Link to="/women/e1" onClick={onClick}>E1</Link> },
// //             { key: 'e2', label: <Link to="/women/e2" onClick={onClick}>E2</Link> },
// //             { key: 'e3', label: <Link to="/women/e3" onClick={onClick}>E3</Link> },
// //         ],
// //     };


// //     return (
// //         // <ul className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
// //         //     {categories.map((cat) => (
// //         //         <li key={cat.name}>
// //         //             <Link
// //         //                 to={cat.path}
// //         //                 className="text-gray-700 hover:text-blue-500 text-lg"
// //         //                 onClick={onClick}
// //         //             >
// //         //                 {cat.name}
// //         //             </Link>
// //         //         </li>
// //         //     ))}
// //         // </ul>
// //         <ul className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0"  style={{ backgroundColor: '#47597A', padding: '0rem 1.5rem', borderRadius: '1rem' }}>
// //             <li>
// //                 <Dropdown menu={menSubmenu}  trigger={['hover']}>
// //                     <Link to="/men" className="text-gray-700 hover:text-blue-500 text-lg" onClick={onClick}>
// //                         Men
// //                     </Link>
// //                 </Dropdown>
// //             </li>
// //             <li>
// //                 <Dropdown menu={womenSubmenu}  trigger={['hover']}>
// //                     <Link to="/women" className="text-gray-700 hover:text-blue-500 text-lg" onClick={onClick}>
// //                         Women
// //                     </Link>
// //                 </Dropdown>
// //             </li>
// //             <li>
// //                 <Link to="/kids" className="text-gray-700 hover:text-blue-500 text-lg" onClick={onClick}>
// //                     Kids
// //                 </Link>
// //             </li>
// //             <li>
// //                 <Link to="/accessories" className="text-gray-700 hover:text-blue-500 text-lg" onClick={onClick}>
// //                     Accessories
// //                 </Link>
// //             </li>
// //         </ul>
// //     );
// // };

// const NavigationLinks = ({ onClick, isSidebar = false }) => {
//     const menItems = [
//         { key: 'p1', label: 'P1', path: '/men/p1' },
//         { key: 'p2', label: 'P2', path: '/men/p2' },
//         { key: 'p3', label: 'P3', path: '/men/p3' },
//     ];

//     const womenItems = [
//         { key: 'e1', label: 'E1', path: '/women/e1' },
//         { key: 'e2', label: 'E2', path: '/women/e2' },
//         { key: 'e3', label: 'E3', path: '/women/e3' },
//     ];

//     return (
//         <>
//             {/* {!isSidebar && ( <div className="flex">
//                 <img
//                     src="/assets/logo-jn.png.webp" // replace with your image path
//                     alt="Logo"
//                     className="object-contain"
//                     style={{padding: "1rem 0rem", height: "80px", width: "480px"}}
//                 />
//             </div>)} */}
//             <ul
//                 className={`flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 ${
//                     !isSidebar ? 'md:rounded-2xl md:px-6' : ''
//                 }`}
//                 // style={!isSidebar ? { backgroundColor: '#fff' } : {}}
//             >
//                 <li>
//                     {isSidebar ? (
//                         <div>
//                             <Link to="/men" className="text-gray-700 font-bold text-lg" onClick={onClick}>
//                                 Men
//                             </Link>
//                             <ul className="ml-4 mt-2 space-y-2">
//                                 {menItems.map(item => (
//                                     <li key={item.key}>
//                                         <Link to={item.path} className="text-gray-700" onClick={onClick}>
//                                             {item.label}
//                                         </Link>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ) : (
//                         <Dropdown
//                         menu={{
//                             items: subcategories.map(item => ({
//                                 key: item.key,
//                                 label: <Link to={`/men/${item.key}`} onClick={onClick}>{item.label}</Link>
//                             }))
//                         }}
                        
//                             trigger={['hover']}
//                         >
//                             <Link to="/men" className="text-gray-700 hover:text-blue-500 text-lg" onClick={onClick}>
//                                 Men
//                             </Link>
//                         </Dropdown>
//                     )}
//                 </li>

//                 <li>
//                     {isSidebar ? (
//                         <div>
//                             <Link to="/women" className="text-gray-700 font-bold text-lg" onClick={onClick}>
//                                 Women
//                             </Link>
//                             <ul className="ml-4 mt-2 space-y-2">
//                                 {womenItems.map(item => (
//                                     <li key={item.key}>
//                                         <Link to={item.path} className="text-gray-700" onClick={onClick}>
//                                             {item.label}
//                                         </Link>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ) : (
//                         <Dropdown
//                             menu={{ items: womenItems.map(item => ({ key: item.key, label: <Link to={item.path} onClick={onClick}>{item.label}</Link> })) }}
//                             trigger={['hover']}
//                         >
//                             <Link to="/women" className="text-gray-700 hover:text-blue-500 text-lg" onClick={onClick}>
//                                 Women
//                             </Link>
//                         </Dropdown>
//                     )}
//                 </li>

//                 <li>
//                     <Link to="/kids" className="text-gray-700 hover:text-blue-500 text-lg" onClick={onClick}>
//                         Kids
//                     </Link>
//                 </li>
//                 <li>
//                     <Link to="/accessories" className="text-gray-700 hover:text-blue-500 text-lg" onClick={onClick}>
//                         Accessories
//                     </Link>
//                 </li>
//             </ul>
//         </>
//     );
// };

// export default NavigationLinks;

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown } from 'antd';
import axios from 'axios';

const NavigationLinks = ({ onClick, isSidebar = false }) => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, subRes] = await Promise.all([
                    axios.get('http://localhost:3005/api/categories'),
                    axios.get('http://localhost:3005/api/subcategories')
                ]);

                setCategories(catRes.data);
                setSubcategories(subRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories or subcategories:', error);
            }
        };

        fetchData();
    }, []);

    // Group subcategories by category_id
    const getSubcategoriesByCategory = (categoryId) => {
        return subcategories?.filter((sub) => sub.category_id === categoryId);
    };

    const handleCategoryClick = (categoryId, categoryName, hasSubcategories) => {
        if (hasSubcategories) {
            navigate(`/store/${categoryName}`);
        } else {
            navigate(`/products/${categoryName}`);
        }
        if (onClick) onClick();
    };

    if (loading) return null; // Or show a spinner

    return (
        <ul className={`flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 ${!isSidebar ? 'md:rounded-2xl md:px-6' : ''}`}>
            {categories.map((category) => {
                const categorySubs = getSubcategoriesByCategory(category.category_id);
                const hasSubs = categorySubs.length > 0;

                const dropdownItems = categorySubs.map((sub) => ({
                    key: sub.subcategory_id,
                    label: (
                        <Link
                            to={`/store/${category.name}/${sub.name}`}
                            onClick={onClick}
                        >
                            {sub.name}
                        </Link>
                    )
                }));

                return (
                    <li key={category.category_id}>
                        {isSidebar ? (
                            <div>
                                <span
                                    className="text-gray-700 font-bold text-lg cursor-pointer"
                                    onClick={() => handleCategoryClick(category.category_id, category.name, hasSubs)}
                                >
                                    {category.name}
                                </span>
                                {hasSubs && (
                                    <ul className="ml-4 mt-2 space-y-2">
                                        {categorySubs.map((sub) => (
                                            <li key={sub.subcategory_id}>
                                                <Link
                                                    to={`/subcategory/${sub.subcategory_id}`}
                                                    className="text-gray-700"
                                                    onClick={onClick}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : hasSubs ? (
                            <Dropdown
                                menu={{ items: dropdownItems }}
                                trigger={['hover']}
                            >
                                <span
                                    className="navbar-cat text-gray-700 hover:text-blue-500 text-lg cursor-pointer"
                                    onClick={() => handleCategoryClick(category.category_id, category.name, hasSubs)}
                                >
                                    {category.name}
                                </span>
                            </Dropdown>
                        ) : (
                            <span
                                className="navbar-cat text-gray-700 hover:text-blue-500 text-lg cursor-pointer"
                                onClick={() => handleCategoryClick(category.category_id, category.name, hasSubs)}
                            >
                                {category.name}
                            </span>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

export default NavigationLinks;
