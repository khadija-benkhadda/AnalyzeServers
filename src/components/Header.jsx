import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          IP Reputation Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
