import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DefaultAvatar from '../assets/DefaultAvatar';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login?logout=Logged+out+successfully.', { replace: true });
  };

  return (
    <nav role="navigation" aria-label="Main navigation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
      <span style={{ fontWeight: 'bold' }}>IDS</span>
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="User menu"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
        >
          {user?.profile_image_url ? (
            <img src={user.profile_image_url} alt={`${user.name}'s avatar`} width={32} height={32} style={{ borderRadius: '50%' }} />
          ) : (
            <DefaultAvatar />
          )}
          <span>{user?.name}</span>
        </button>
        {dropdownOpen && (
          <div
            role="menu"
            style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: '150px', zIndex: 1000 }}
          >
            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>{user?.name}</div>
            <button
              onClick={handleLogout}
              role="menuitem"
              style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
