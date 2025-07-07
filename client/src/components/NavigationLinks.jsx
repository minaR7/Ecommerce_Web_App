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
                    // axios.get('http://localhost:3005/api/categories'),
                    // axios.get('http://localhost:3005/api/subcategories')
                    axios.get(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/categories`),
                    axios.get(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/subcategories`)
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
                                    <ul className="sidebar-items ml-4 mt-2 space-y-2">
                                        {categorySubs.map((sub) => (
                                            <li key={sub.subcategory_id}>
                                                <Link
                                                    // to={`/subcategory/${sub.subcategory_id}`}
                                                    to={`/store/${category.name}/${sub.name}`}
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
