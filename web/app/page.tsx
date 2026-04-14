import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import StaffRolesPage from './pages/admin/staff-roles';

const HomePage: NextPage = () => {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push('/admin/staff-roles')}>Staff Roles</button>
      <StaffRolesPage />
    </div>
  );
};

export default HomePage;