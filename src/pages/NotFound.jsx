import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="animate-fade-in py-16 text-center">
      <p className="text-5xl font-extrabold text-navy-900">404</p>
      <h1 className="mt-3 text-xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-2 text-sm text-gov-muted">The page you are looking for does not exist.</p>
      <Button className="mt-6" onClick={() => window.history.back()}>
        Go back
      </Button>
      <div className="mt-3">
        <Link to="/dashboard" className="text-sm font-semibold text-saffron-600 hover:underline">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
