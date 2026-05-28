import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const IpView = ({ data }) => {
  const [searchedIps, setSearchedIps] = useState('');
  const [ipInfos, setIpInfos] = useState([]);
  const [notFoundIps, setNotFoundIps] = useState([]);

  const handleSearch = () => {
    if (searchedIps.trim() === '') {
        setIpInfos([]);
        setNotFoundIps([]);
        return;
    }

    const ipList = searchedIps.split(/[,\s\n]+/).filter(Boolean);
    const results = [];
    const notFound = [];

    ipList.forEach(ip => {
      const result = data.find(row => (row.ip || row.IP) === ip);
      if (result) {
        results.push(result);
      } else {
        notFound.push(ip);
      }
    });

    setIpInfos(results);
    setNotFoundIps(notFound);
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        IP Address Analysis
      </Typography>
      <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Search for multiple IP Addresses (comma, space, or newline separated)"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={searchedIps}
            onChange={(e) => setSearchedIps(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button variant="contained" onClick={handleSearch} sx={{ mt: 1 }}>
            Search
          </Button>
        </Grid>
      </Grid>

      {ipInfos.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Server</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Reputation Score</TableCell>
                <TableCell>Blacklist Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ipInfos.map((info, index) => (
                <TableRow key={index}>
                  <TableCell>{info['server'] || info['Server Name']}</TableCell>
                  <TableCell>{info['ip'] || info['IP']}</TableCell>
                  <TableCell>{info['Reputation Score']}</TableCell>
                  <TableCell sx={{ color: info['Blacklist Status'] && info['Blacklist Status'].includes('Blacklisted') ? 'error.main' : 'inherit' }}>
                    {info['Blacklist Status']}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {notFoundIps.length > 0 && (
          <Box mt={2}>
              <Typography color="error.main">IPs not found: {notFoundIps.join(', ')}</Typography>
          </Box>
      )}
    </Paper>
  );
};

IpView.propTypes = {
  data: PropTypes.array.isRequired,
};

export default IpView;
