import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/feed" className="brand">Mini LinkedIn</Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="user-chip">{user.name}</span>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          !isAuthPage && (
            <>
              <Link className="btn" to="/login">Login</Link>
              <Link className="btn primary" to="/signup">Sign Up</Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}


