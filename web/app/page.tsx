import { logAuditEvent } from '../lib/utils';

const Page = () => {
  const handlePageLoad = async () => {
    // Log audit event when page loads
    await logAuditEvent('PAGE_LOAD', { pageName: 'Home Page' });
  };

  return (
    <div>
      <h1>Home Page</h1>
    </div>
  );
};

export default Page;