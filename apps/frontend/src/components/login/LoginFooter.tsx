import { Link } from 'react-router-dom';

function LoginFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full px-6 py-4" role="contentinfo">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold text-white/80">Finance Center</p>
          <p className="text-[10px] text-white/50">Armed Forces of the Philippines</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-white/50">
          <span>v2.1.0</span>
          <span>&copy; {year} AFP Finance Center</span>
          <Link
            to="/privacy"
            className="transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
            aria-label="Privacy Policy"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
            aria-label="Terms of Service"
          >
            Terms
          </Link>
          <Link
            to="/support"
            className="transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
            aria-label="Contact Support"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default LoginFooter;
