import React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { UserLogin } from '../../models/UserLogin';
import { useState, useRef, useEffect } from 'react';
import { LoginUser, SignInWithGoogle } from '../../services/UserService';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import { GetUserVerification } from '../../utils/CurrentUser';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [user, setLoginUser] = useState(new UserLogin());
  const [errorMessage, setErrorMessage] = useState('');
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(user)) {
      return;
    }
    
    try {
      const resp = await LoginUser(user);
      dispatch(setUser({ token: resp.token, isVerified: GetUserVerification(resp.token) }));
      navigate('/');

    } catch (error) {
      setErrorMessage(error.message);
      setLoginUser((prevUser) => ({ ...prevUser, email: '', password: ''}));
    }
  };

  function validateForm(user){
    if(user.email.trim() === ''){
      setErrorMessage('Please fill out email.');
      emailRef.current.focus();
      return false;
    }
    if(user.password.trim() === ''){
      setErrorMessage('Please fill out password.');
      passwordRef.current.focus();
      return false;
    }

    return true;
  }

  useEffect(() => {
    /*global google*/
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    const handleCallbackResponse =  async (response) => {
      try {
        const resp = await SignInWithGoogle({'token': response.credential});
        dispatch(setUser({ token: resp.token, isVerified: GetUserVerification(resp.token) }));
        navigate('/');
  
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    script.onload = () => {
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCallbackResponse,
      });
      google.accounts.id.renderButton(document.getElementById('signInDiv'), {
        theme: 'outline',
        size: 'large',
      });
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [dispatch, navigate]);

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {errorMessage && (
            <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
               {errorMessage}
          </Typography>
          )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete='off'
              inputProps={{ style: { background: 'transparent' } }}
              autoFocus
              inputRef={emailRef}
              value={user.email}
              onChange={(e) =>
                setLoginUser((prevUser) => ({ ...prevUser, email: e.target.value }))
              }
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              inputRef={passwordRef}
              value={user.password}
              onChange={(e) =>
                setLoginUser((prevUser) => ({ ...prevUser, password: e.target.value }))
              }
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <div
        id="signInDiv"
        style={{
          display: 'flex',
          justifyContent: 'center', // Center horizontally
          alignItems: 'center', // Center vertically
        }}
      />
      <br/>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
  );
}