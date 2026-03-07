import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    if (!user) return null

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">🛒</span>
                        <span className="brand-text">BVEC Shoppers</span>
                    </Link>

                    <div className="navbar-links">
                        <Link to="/" className="nav-link">
                            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                            </svg>
                            <span>Feed</span>
                        </Link>
                        <Link to="/sell" className="nav-link nav-link-primary mobile-sell-btn">
                            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Sell</span>
                        </Link>
                        <Link to="/my-listings" className="nav-link">
                            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                            </svg>
                            <span>My Listings</span>
                        </Link>
                    </div>

                    <div className="navbar-profile">
                        <Link to="/profile" className="profile-link">
                            <img
                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'U'}&background=6c63ff&color=fff`}
                                alt="Avatar"
                                className="profile-avatar"
                            />
                        </Link>
                        <button onClick={handleSignOut} className="btn-sign-out" title="Sign out">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <Link to="/sell" className="desktop-sell-btn" title="Create Listing">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Sell</span>
            </Link>
        </>
    )
}
