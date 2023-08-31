import { React, useState, useRef } from "react";
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
import { RegisterUser } from "../../services/UserService";
import { useDispatch } from 'react-redux';
import { setUser } from "../../redux/userSlice";
import { GetUserVerification } from "../../utils/CurrentUser";
import { UserRegistration } from "../../models/UserRegistration";
import { useNavigate } from "react-router-dom";

function Registration(){
    const [user, setRegisteredUser] = useState(new UserRegistration());
    const [errorMessage, setErrorMessage] = useState('');
    const firstnameRef = useRef(null);
    const lastnameRef = useRef(null);
    const emailRef = useRef(null);
    const phonenumRef = useRef(null);
    const addressRef = useRef(null);
    const cityRef = useRef(null);
    const countryRef = useRef(null);
    const passwordRef = useRef(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!validateForm(user)){
            return;
        }
        try {
          const resp = await RegisterUser(user);
          dispatch(setUser({token: resp.token, isVerified: GetUserVerification(resp.token) }));
          navigate('/');
          
        } catch (error) {
          setErrorMessage(error.message);
          setRegisteredUser((prevUser) => ({ ...prevUser, email: ''}));
        }
    };

    function validateForm(user){
        if(user.firstname.trim() === ''){
            setErrorMessage('Field firstname cannot be empty.');
            firstnameRef.current.focus();
            return false;
        }
        if(user.lastname.trim() === ''){
            setErrorMessage('Field lastname cannot be empty.');
            lastnameRef.current.focus();
            return false;
        }
        if(user.email.trim() === ''){
          setErrorMessage('Please fill out email.');
          emailRef.current.focus();
          return false;
        }
        if(user.address.trim() === ''){
            setErrorMessage('Field address cannot be empty.');
            addressRef.current.focus();
            return false;
        }
        if(user.city.trim() === ''){
            setErrorMessage('Field city cannot be empty.');
            cityRef.current.focus();
            return false;
        }
        if(user.country.trim() === ''){
            setErrorMessage('Field country cannot be empty.');
            countryRef.current.focus();
            return false;
        }
        if(user.phoneNum.trim() === ''){
            setErrorMessage('Field phone number cannot be empty.');
            phonenumRef.current.focus();
            return false;
        }
        if(user.password.trim() === ''){
          setErrorMessage('Password field cannot be empty.');
          passwordRef.current.focus();
          return false;
        }
    
        return true;
      }

    return(
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
            Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {errorMessage && (
            <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
               {errorMessage}
          </Typography>
          )}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                <TextField
                    autoComplete="off"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    inputRef={firstnameRef}
                    value={user.firstname}
                    onChange={(e) =>
                        setRegisteredUser((prevUser) => ({ ...prevUser, firstname: e.target.value }))
                    }
                />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    inputRef={lastnameRef}
                    autoComplete="off"
                    value={user.lastname}
                    onChange={(e) =>
                        setRegisteredUser((prevUser) => ({ ...prevUser, lastname: e.target.value }))
                    }
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    inputRef={emailRef}
                    autoComplete="off"
                    value={user.email}
                    onChange={(e) =>
                        setRegisteredUser((prevUser) => ({ ...prevUser, email: e.target.value }))
                    }
                />
                </Grid>
                <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="address"
              label="Address"
              id="address"
              inputRef={addressRef}
              autoComplete="off"
              value={user.address}
              onChange={(e) =>
                setRegisteredUser((prevUser) => ({ ...prevUser, address: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="city"
              label="City"
              id="city"
              inputRef={cityRef}
              autoComplete="off"
              value={user.city}
              onChange={(e) =>
                setRegisteredUser((prevUser) => ({ ...prevUser, city: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="country"
              label="Country"
              inputRef={countryRef}
              id="country"
              autoComplete="off"
              value={user.country}
              onChange={(e) =>
                setRegisteredUser((prevUser) => ({ ...prevUser, country: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="phone"
              label="Phone Number"
              id="phone"
              inputRef={phonenumRef}
              autoComplete="off"
              value={user.phoneNum}
              onChange={(e) =>
                setRegisteredUser((prevUser) => ({ ...prevUser, phoneNum: e.target.value }))
              }
            />
          </Grid>
          
          <Grid item xs={12}>
                <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    inputRef={passwordRef}
                    autoComplete="off"
                    value={user.password}
                    onChange={(e) =>
                        setRegisteredUser((prevUser) => ({ ...prevUser, password: e.target.value }))
                    }
                />
                </Grid>
        </Grid>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
                <Grid item>
                <Link href="/login" variant="body2">
                    Already have an account? Sign in
                </Link>
                </Grid>
            </Grid>
            </Box>
        </Box>
        </Container>
    );
}

export default Registration;