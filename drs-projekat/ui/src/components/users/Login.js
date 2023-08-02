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
import { useState, useRef } from 'react';
import { LoginUser } from '../../services/UserService';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import { GetUserVerification } from '../../utils/CurrentUser';

export default function Login() {
  const [user, setLoginUser] = useState(new UserLogin());
  const [errorMessage, setErrorMessage] = useState('');
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(user)) {
      return;
    }
    
    try {
      const resp = await LoginUser(user);
      dispatch(setUser({ token: resp.token, isVerified: GetUserVerification(resp.token) }));

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