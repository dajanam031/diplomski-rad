import axios from "axios";

export const RegisterUser = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/signup`, userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };

  export const LoginUser = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };