// components/NavigationLinks.jsx
import { Link } from 'react-router-dom'; // If using React Router; change to <a> if not

const categories = [
    { name: 'Men', path: '/men' },
    { name: 'Women', path: '/women' },
    { name: 'Kids', path: '/kids' },
    { name: 'Accessories', path: '/accessories' },
];

const NavigationLinks = ({ onClick }) => {
    return (
        <ul className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
            {categories.map((cat) => (
                <li key={cat.name}>
                    <Link
                        to={cat.path}
                        className="text-gray-700 hover:text-blue-500 text-lg"
                        onClick={onClick}
                    >
                        {cat.name}
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default NavigationLinks;
