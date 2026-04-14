import TierStatus from './TierStatus';

const Dashboard: React.FC = () => {
  const userId = 1; // Replace with actual user ID

  return (
    <div>
      <h1>Dashboard</h1>
      <TierStatus userId={userId} />
    </div>
  );
};

export default Dashboard;