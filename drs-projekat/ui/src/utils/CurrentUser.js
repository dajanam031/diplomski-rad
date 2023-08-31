import jwtDecode from 'jwt-decode';

export const GetUserVerification = (token) => {
  const decodedToken = jwtDecode(token);
  return decodedToken['verificated'];
};

export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  const decodedToken = jwtDecode(token);
  const currentTime = Date.now() / 1000; 

  return decodedToken.exp < currentTime;
};
