// components/Navbar.jsx
import NavigationLinks from './NavigationLinks';

const Navbar = () => {
    return (
        <nav className="hidden md:flex justify-between items-center" >
             {/* <div className="flex">
                <img
                    src="/assets/logo-jn.png.webp" // replace with your image path
                    alt="Logo"
                    className="object-contain"
                    style={{padding: "1rem 0rem", height: "80px", width: "480px"}}
                />
            </div> */}
            <NavigationLinks/>
        </nav>
    );
};

export default Navbar;
