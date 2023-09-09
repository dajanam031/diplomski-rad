import './App.css';
import { Routes, Route } from 'react-router-dom';
import Registration from './components/users/Registration';
import Login from './components/users/Login';
import Dashboard from './components/shared/Dashboard';
import Profile from './components/users/Profile';
import { PrivateRoutes, Redirect } from './utils/PrivateRoutes';
import darkTheme from './styles/theme';
import { ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { GetUserVerification, isTokenExpired } from './utils/CurrentUser';
import { clearUser, setUser } from './redux/userSlice';
import { Navigate } from 'react-router-dom';
import SendMoney from './components/transactions/SendMoney';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const isExpired = isTokenExpired(token);
      if (!isExpired) {
        const user = {
          token,
          isVerified: GetUserVerification(token),
        };
        dispatch(setUser(user));
      } else {
        dispatch(clearUser());
      }
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
    <ThemeProvider theme={darkTheme}>
      <Routes>
            <Route path='/transaction' element={<SendMoney/>}/>
          <Route element={<PrivateRoutes/>}>
            <Route path='/profile' element={<Profile/>}/>
            <Route path='/' element={<Dashboard/>}/>
          </Route>

          <Route element={<Redirect/>}>
            <Route path='/signup' element={<Registration/>}/>
            <Route path='/login' element={<Login/>}/>
          </Route>

          <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </ThemeProvider>
    </>
  );
}

export default App;
