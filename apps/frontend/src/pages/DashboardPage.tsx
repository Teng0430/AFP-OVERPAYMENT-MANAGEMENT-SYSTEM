import { useAuth } from '../hooks/useAuth';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <main>
      <h1>Welcome, {user?.name}</h1>
      <p>This is your dashboard.</p>
    </main>
  );
}

export default DashboardPage;
