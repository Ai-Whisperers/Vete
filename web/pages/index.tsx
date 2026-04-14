import React from 'react';
import PetList from '../components/PetList';
import PetForm from '../components/PetForm';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to Vete</h1>
      <PetList />
      <PetForm />
    </div>
  );
};

export default HomePage;