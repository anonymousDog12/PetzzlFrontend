import React, { createContext, useContext, useState } from 'react';

const PetProfileContext = createContext();

export const usePetProfile = () => {
  return useContext(PetProfileContext);
};

export const PetProfileProvider = ({ children }) => {
  const [petProfile, setPetProfile] = useState({});

  const updateProfile = (newData) => {
    setPetProfile((prevProfile) => ({ ...prevProfile, ...newData }));
  };

  const value = { petProfile, updateProfile };

  return <PetProfileContext.Provider value={value}>{children}</PetProfileContext.Provider>;
};
