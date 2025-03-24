import { createContext } from 'react';

export const AuthContext = createContext({
  accessToken: undefined as string | undefined,
  idToken: undefined as string | undefined,
  isArchivist: false,
});
