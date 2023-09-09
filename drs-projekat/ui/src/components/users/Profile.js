import React from 'react';
import { Avatar, Typography, Paper, Grid } from '@mui/material';
import '../../styles/UserProfileStyles.css';
import { useEffect } from 'react';
import { GetUserProfile } from '../../services/UserService';

const Profile = () => {
  const profile = async () => {
    try {
      const resp = await GetUserProfile();
      console.log(resp);
    } catch (error) {
      console.log(error.message);
    }
  
};
  useEffect(() => {
    profile();
  }, []);
  
  return (
    <Paper elevation={3} className="container"> {/* Use the CSS class names */}
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <Avatar className="avatar" alt="User Avatar" src="/path/to/avatar.jpg" />
        </Grid>
        <Grid item>
          <Typography variant="h5" className="user-name">
            John Doe
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" className="user-details">
            Email: john.doe@example.com
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" className="user-details">
            Phone: +1 123-456-7890
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" className="user-details">
            Location: New York, USA
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Profile;
