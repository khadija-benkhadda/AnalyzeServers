import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';

const CountryView = ({ data }) => {
  const getReputationLevel = (score) => {
    if (score === 0) return 'Clean';
    if (score >= 1 && score <= 39) return 'Good';
    if (score >= 40 && score <= 69) return 'Medium';
    if (score >= 70 && score <= 100) return 'High';
    return 'N/A';
  };

  const countryData = data.reduce((acc, item) => {
    const country = item['Country'] || 'Unknown';
    if (!acc[country]) {
      acc[country] = {
        totalIPs: 0,
        blacklisted: 0,
        reputation: {
          Clean: 0,
          Good: 0,
          Medium: 0,
          High: 0,
        },
      };
    }

    acc[country].totalIPs++;
    if (item['Blacklist Status'] && item['Blacklist Status'].includes('Blacklisted')) {
      acc[country].blacklisted++;
    }

    const scoreValue = parseInt(item['Reputation Score'], 10);
    const reputation = getReputationLevel(scoreValue);
    if (reputation !== 'N/A') {
      acc[country].reputation[reputation]++;
    }

    return acc;
  }, {});

  return (
    <Paper sx={{ p: 3 }}>
       <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom component="div">
          Country-Level Analysis
        </Typography>
      </Box>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell>Total IPs</TableCell>
              <TableCell>Blacklisted</TableCell>
              <TableCell>Clean</TableCell>
              <TableCell>Good</TableCell>
              <TableCell>Medium</TableCell>
              <TableCell>High</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(countryData).map(([country, d]) => (
              <TableRow key={country}>
                <TableCell>{country}</TableCell>
                <TableCell>{d.totalIPs}</TableCell>
                <TableCell>{d.blacklisted}</TableCell>
                <TableCell>{d.reputation.Clean}</TableCell>
                <TableCell>{d.reputation.Good}</TableCell>
                <TableCell>{d.reputation.Medium}</TableCell>
                <TableCell>{d.reputation.High}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

CountryView.propTypes = {
  data: PropTypes.array.isRequired,
};

export default CountryView;
