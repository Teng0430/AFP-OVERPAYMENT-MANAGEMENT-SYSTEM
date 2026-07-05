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
    <nav role="navigation" aria-label="Main navigation" className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
      <span className="font-bold text-foreground">IDS</span>
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="User menu"
          className="flex cursor-pointer items-center gap-2 rounded border-none bg-transparent p-1"
        >
          {user?.profile_image_url ? (
            <img src={user.profile_image_url} alt={`${user.name}'s avatar`} className="h-8 w-8 rounded-full" />
          ) : (
            <DefaultAvatar />
          )}
          <span className="text-sm text-foreground">{user?.name}</span>
        </button>
        {dropdownOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 min-w-[150px] rounded border border-border bg-card shadow-lg"
          >
            <div className="border-b border-border px-4 py-2 font-bold text-foreground">{user?.name}</div>
            <button
              onClick={handleLogout}
              role="menuitem"
              className="block w-full cursor-pointer border-none bg-transparent px-4 py-2 text-left text-foreground hover:bg-accent"
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
