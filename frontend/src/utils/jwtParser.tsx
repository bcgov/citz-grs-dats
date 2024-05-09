import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  exp: number;
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return (Date.now() < exp * 1000);
  } catch {
    return false;
  }
}
