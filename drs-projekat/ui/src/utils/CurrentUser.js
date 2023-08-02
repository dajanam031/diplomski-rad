import jwtDecode from 'jwt-decode';

export const GetUserVerification = (token) => {
  const decodedToken = jwtDecode(token);
  return decodedToken['verificated'];
};
