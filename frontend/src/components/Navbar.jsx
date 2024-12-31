import React, { use } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useRef, useEffect } from 'react';
import { AiOutlineCaretDown } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { setLogout } from '../slices/authSlice';
import navLinks from '../util/navlinks';
const Navbar = () => {
  const { token, role, user } = useSelector(state => state.auth);
  const {items} = useSelector(state=>state.cart)


  const [showMenu, setShowMenu] = React.useState(false);

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };


  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleLogout = () => {
    dispatch(setLogout());
    navigate('/')
  }

  return (
    <div className='sticky top-0 z-50'>


    <nav className="flex justify-between items-center h-16 bg-[#ffffff] text-black relative shadow-lg font-inter px-8" role="navigation" >
      {/* Logo */}
      <Link to="/" className="pl-8">
        <div className="text-gray-700 font-bold text-2xl">
          Industrial Goods
        </div>
      </Link>

      { /* Navigation Links  */}
      <ul className="lg:flex justify-between items-center gap-5 font-semibold hidden">
        <li className="hover:text-gray-600 transition-all duration-300 cursor-pointer">
          <Link to="/">Home</Link>
        </li>
        <li className="hover:text-gray-600 transition-all duration-300 cursor-pointer">
          <Link to="/about">About</Link>
        </li>
        <li className="hover:text-gray-600 transition-all duration-300 cursor-pointer">
          <Link to="/products">Products</Link>
        </li>
        <li className="hover:text-gray-600 transition-all duration-300 cursor-pointer">
          <Link to="/contactus">Contact</Link>
        </li>
      </ul>

      {/* User Actions */}
      <div className="flex gap-x-3">
        {/* Show menu when user is logged in and is a customer */}
        <Link to={'/cart'}>
                <button className="btn hover:bg-gray-200 relative">
                  {
                    items.length > 0 &&  <span className="absolute -top-1 -right-1 bg-blue-700 text-white rounded-full px-2 animate-bounce w-5 h-5 flex items-center justify-center">{items.length}</span>
                  }
              <FaShoppingCart />
            </button>
            </Link>
        {token && (
          <>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu((prev) => !prev)} className='flex gap-1 items-center' >
                <img
                  src={user?.Image} // Ensure user.Image is a valid image URL
                  alt="User"
                  className="w-12 h-12 object-cover rounded-full cursor-pointer"

                />
                <AiOutlineCaretDown className={`text-sm text-mytext transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  {navLinks
                    .filter((link) => link.role === String(role)) // Filter links based on role
                    .map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        {link.name}
                      </Link>
                    ))}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {/* Show login/signup buttons when user is not logged in */}
        {!token && (
          <>
            <Link to="/signup">
              <button className="btn hover:scale-95">Sign Up</button>
            </Link>
            <Link to="/login">
              <button className="btn hover:scale-95 btn-primary">Login</button>
            </Link>
          </>
        )}
      </div>
    </nav>
    </div>
  );
};

export default Navbar;
