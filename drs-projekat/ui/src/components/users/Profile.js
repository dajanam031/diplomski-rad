import React, { useState } from 'react';
import {Typography, Paper, Grid, TextField, Button, Alert,
Dialog,DialogActions,DialogContent,DialogTitle,Snackbar} from '@mui/material';
import { useEffect } from 'react';
import { GetUserProfile, UpdateUserProfile, ChangePassword } from '../../services/UserService';
import Dashboard from '../shared/Dashboard';
import { UserUpdate } from '../../models/UserUpdate';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(new UserUpdate());
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [errorPass, setErrorPass] = useState('');
  const [isChangePassDialogOpen, setIsChangePassDialogOpen] = useState(false);

  const profile = async () => {
    try {
      const resp = await GetUserProfile();
      setUserInfo(resp);
    } catch (error) {
      setErrorMessage(error.message);
    }
  
};
  useEffect(() => {
    profile();
  }, []);

  const handleConfirmUpdate = async (e) =>  {
    e.preventDefault();
      if (!validateForm(userInfo)) {
          return;
      }
      
      try {
        const resp = await UpdateUserProfile(userInfo);
        setUserInfo(resp);
        setIsEditMode(false);
        setErrorMessage('');
        setIsSnackbarOpen(true);
        setSnackbarMessage("Successfully updated profile data!");
      } catch (error) {
        setIsSnackbarOpen(true);
        setSnackbarMessage(error.message);
      }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswords(newPass, confirmPass)) {
      return;
    }
    try {
      const resp = await ChangePassword({'newPassword': newPass});
      handleCloseChangePassDialog();
      setIsSnackbarOpen(true);
      setSnackbarMessage(resp['message']);

    } catch (error) {
      setIsSnackbarOpen(true);
      setSnackbarMessage(error.message);
    }
  };

  function validatePasswords(newPass, confirmPass) {
    if(newPass.trim() === '' || confirmPass.trim() === ''){
      setErrorPass("Please fill out all required fields.");
      setConfirmPass('');
      setNewPass('');
      return false;
    }
    if(newPass !== confirmPass){
      setErrorPass("Passwords doesn't match. Try again.");
      setConfirmPass('');
      return false;
    }

    return true;
  }

  function validateForm(user) {
    const trimmedFields = ['username', 'firstname', 'lastname', 'address', 'city', 'country', 'phoneNum'];
    const hasEmptyRequiredFields = trimmedFields.some((field) => user[field].trim() === '');

    if (hasEmptyRequiredFields) {
      setErrorMessage("Please fill out all required fields.");
      return false;
  }
    return true;
  }

  const handleUpdateProfile = () => {
    setIsEditMode(true);
  };

  const handleDecline = () => {
    profile();
    setIsEditMode(false);
    setErrorMessage('');
  };

  
  const handleOpenChangePassDialog = () => {
    setIsChangePassDialogOpen(true);
  };

  const handleCloseChangePassDialog = () => {
    setIsChangePassDialogOpen(false);
    setConfirmPass('');
    setNewPass('');
    setErrorPass('');
  };
  
  
  return (
    <>
    <Dashboard content={
      <div style={{ marginTop: '100px' }}>
    <Grid container justifyContent="center" alignItems="center" style={{ height: '50vh' }}>
    <Grid item xs={12} sm={10} md={8} lg={6}>
      <Paper elevation={3} style={{ padding: '10px', margin: '10px' }}>
        <form>
          {errorMessage && (
            <Typography color='error'>{errorMessage}</Typography>
          )}
          <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
          <TextField
            name="email"
            label="Email"
            autoComplete='off'
            disabled={userInfo.social === 'google' || !isEditMode}
            variant="outlined"
            fullWidth
            value={userInfo.email}
            margin="normal"
            onChange={(e) => setUserInfo((prevUser) => ({ ...prevUser, email: e.target.value }))}
          />
          </Grid>
          <Grid item xs={12} sm={6}>
          <TextField
            name="username"
            label="Username"
            autoComplete='off'
            variant="outlined"
            fullWidth
            value={userInfo.username}
            margin="normal"
            disabled={userInfo.social === 'github' ||  !isEditMode}
            onChange={(e) => setUserInfo((prevUser) => ({ ...prevUser, username: e.target.value }))}
          />
          </Grid>
          <Grid item xs={12} sm={6}>
          <TextField
            name="firstname"
            label="First name"
            variant="outlined"
            autoComplete='off'
            fullWidth
            value={userInfo.firstname}
            margin="normal"
            disabled={!isEditMode}
            onChange={(e) => setUserInfo((prevUser) => ({ ...prevUser, firstname: e.target.value }))}
          />
          </Grid>
          <Grid item xs={12} sm={6}>
          <TextField
            name="lastname"
            label="Last name"
            variant="outlined"
            autoComplete='off'
            fullWidth
            value={userInfo.lastname}
            margin="normal"
            disabled={!isEditMode}
            onChange={(e) => setUserInfo((prevUser) => ({ ...prevUser, lastname: e.target.value }))}
          />
          </Grid>
          <Grid item xs={12} sm={6}>
          <TextField
            name="address"
            label="Address"
            variant="outlined"
            autoComplete='off'
            fullWidth
            value={userInfo.address}
            margin="normal"
            disabled={!isEditMode}
            onChange={(e) => setUserInfo((prevUser) => ({ ...prevUser, address: e.target.value }))}
          />
          </Grid>
          <Grid item xs={12} sm={6}>
          <TextField
            name="city"
            label="City"
            variant="outlined"
            autoComplete='off'
            fullWidth
            value={userInfo.city}
            margin="normal"
            disabled={!isEditMode}
            onChange={(e) => setUserInfo((prevUser) => ({ ...prevUser, city: e.target.value }))}
          />
          </Grid>
          <Grid item xs={12} sm={6}>
          <TextField
            name="country"
            label="Country"
            variant="outlined"
            autoComplete='off'
            fullWidth
            value={userInfo.country}
            margin="normal"
            disabled={!isEditMode}
            onChange={(e) => setUserInfo((prevUser) => ({ ...prevUser, country: e.target.value }))}
          />
          </Grid>
          <Grid item xs={12} sm={6}>
          <TextField
            name="phoneNum"
            label="Phone number"
            variant="outlined"
            autoComplete='off'
            fullWidth
            value={userInfo.phoneNum}
            margin="normal"
            disabled={!isEditMode}
            onChange={(e) => setUserInfo((prevUser) => ({ ...prevUser, phoneNum: e.target.value }))}
          />
          </Grid>
          </Grid>
          <br/>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {!isEditMode && (
            <div>
            <Button variant="outlined" color="primary" onClick={handleUpdateProfile} endIcon={<EditIcon/>}>
                  Edit Profile
                </Button>
            </div>
          )}
          {isEditMode && (
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
                  <div style={{ display: 'flex', marginTop: '10px' }}>
                    <Button variant="contained" color="success" style={{ marginLeft: '40px' }} onClick={handleConfirmUpdate}>
                      Confirm
                    </Button>
                    <Button variant="outlined" color="error" style={{ marginLeft: '200px' }} onClick={handleDecline}>
                      Decline
                    </Button>
                  </div>
                </div>
              )}
              <br/>
              {userInfo.social === 'regular' && (
              <Button variant="outlined" color="primary" onClick={handleOpenChangePassDialog} endIcon={<LockIcon/>}>
                Change Password
              </Button>
              )}
          </div>
        </form>
      </Paper>
    </Grid>
    <Dialog open={isChangePassDialogOpen} onClose={handleCloseChangePassDialog}
          fullWidth
          PaperProps={{
            style: {
              maxWidth: '400px',
              textAlign: 'center', 
            },
          }}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
        <form onSubmit={handleChangePassword}>
          {errorPass && (
            <Typography color='error'>{errorPass}</Typography>
          )}
            <TextField helperText="New password"
            onChange={(e) => setNewPass(e.target.value)} autoComplete='off'
            variant='outlined' type='password' />
            <br/>
            <TextField helperText="Confirm new password"
            onChange={(e) => setConfirmPass(e.target.value)} autoComplete='off'
            variant='outlined' value={confirmPass} type='password' />
          </form>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'flex-end' }}>
          <Button onClick={handleChangePassword} color="success" variant='outlined' style={{ marginRight: '170px' }}>
            Confirm
          </Button>
          <Button onClick={handleCloseChangePassDialog} color="error" variant='outlined' style={{ marginLeft: '10px' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setIsSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="info">{snackbarMessage}</Alert>
      </Snackbar>
  </Grid>
  </div>
  }/>
    </>
  );
};

export default Profile;
