import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the user data type
interface UserData {
  email: string;
  userId?: string;
  // Add other user properties as needed
}

// Define the context type
interface UserContextType {
  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  userData: null,
  setUserData: () => {},
});

// Create a provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a hook for using the context
export const useUserContext = () => useContext(UserContext);
