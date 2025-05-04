// components/Navbar.jsx
import NavigationLinks from './NavigationLinks';

const Navbar = () => {
    return (
        <nav className="hidden md:flex justify-between items-center bg-white shadow px-8 py-4">
            <div className="text-2xl font-bold">MyStore</div>
            <NavigationLinks />
        </nav>
    );
};

export default Navbar;
