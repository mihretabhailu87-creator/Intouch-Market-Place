import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
function Header() {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const profileButtonRef = useRef(null);
    const [user, setUser] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');
    useEffect(() => {
        if (!isProfileMenuOpen) {
            return undefined;
        }

        function handlePointerDown(event) {
            if (!profileMenuRef.current?.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setIsProfileMenuOpen(false);
                profileButtonRef.current?.focus();
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isProfileMenuOpen]);

    useEffect(() => {
        if (!isProfileMenuOpen) {
            return undefined;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            setUser(null);
            setProfileError('');
            return undefined;
        }

        const controller = new AbortController();
        async function fetchProfile() {
            setIsLoadingProfile(true);
            setProfileError('');

            try {
                const response = await fetch('http://127.0.0.1:8000/api/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Could not load profile.');
                }

                setUser(data);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setProfileError(error instanceof Error ? error.message : 'Could not load profile.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingProfile(false);
                }
            }
        }

        fetchProfile();
        return () => controller.abort();
    }, [isProfileMenuOpen]);

    return (
        <header className="topHead">
            <div className="header">
                <div className="logo">
                    <NavLink className="nav-linkLogo" to="/">InTouch</NavLink>
                </div>
                <nav className="nav-links" aria-label="Main navigation">
                    <ul>
                        <li>
                            <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/">HOME</NavLink>
                        </li>
                        <li>
                            <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/Form">Sell/Rent</NavLink>
                        </li>
                        {/* <li>
                            <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/register">newcomer</NavLink>
                        </li> */}
                        <li className="profile-menu" ref={profileMenuRef}>
                            <button
                                aria-expanded={isProfileMenuOpen}
                                aria-controls="profile-dropdown"
                                aria-label="Profile menu"
                                className="profile-trigger"
                                onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                                ref={profileButtonRef}
                                type="button"
                            >
                                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                            </button>
                            {isProfileMenuOpen && (
                                <div className="profile-dropdown" id="profile-dropdown">
                                    {isLoadingProfile && <p role="status">Loading profile...</p>}
                                    {profileError && <p role="alert">{profileError}</p>}
                                    {user && (
                                        <>
                                            <p>Hi {user.username}!</p>
                                            <p> there is a lot feature comming on stay tuned {user.username} </p>
                                            <button
                                                className = "profile-dropdown-link"
                                                onClick={() => {
                                                    localStorage.removeItem('access_token');
                                                    setUser(null);
                                                    setIsProfileMenuOpen(false);
                                                }}
                                                type="button"
                                            >
                                                Log out
                                            </button>
                                        </>
                                    )}
                                    {!user && !isLoadingProfile && (
                                        <>
                                            <NavLink className="profile-dropdown-link" onClick={() => setIsProfileMenuOpen(false)} to="/login">
                                                Log in
                                            </NavLink>
                                            <NavLink className="profile-dropdown-link" onClick={() => setIsProfileMenuOpen(false)} to="/register">
                                                Create account
                                            </NavLink>
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
