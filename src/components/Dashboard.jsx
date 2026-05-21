import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const getReputationLevel = (score) => {
  if (score === 0) return 'Clean';
  if (score >= 1 && score <= 39) return 'Good';
  if (score >= 40 && score <= 69) return 'Medium';
  if (score >= 70 && score <= 100) return 'High';
  return 'N/A';
};

const COLORS = {
  Clean: '#DDEFDD',
  Good: '#DDEEFD',
  Medium: '#FDF0DD',
  High: '#F5DDDD',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeServer, setActiveServer] = useState(null);
  const [filterLevel, setFilterLevel] = useState(null);
  const [scoreFilter, setScoreFilter] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePieClick = (data) => {
    setFilterLevel(data.name);
    setPage(0);
  };

  const servers = data.reduce((acc, row) => {
    const serverName = row['server'] || row['Server Name'];
    if (!serverName) return acc;

    if (!acc[serverName]) {
      acc[serverName] = {
        rows: [],
        country: row['Country'],
      };
    }
    acc[serverName].rows.push(row);
    return acc;
  }, {});

  const serverAnalysis = Object.entries(servers).map(([serverName, { rows, country }]) => {
    const analysis = rows.reduce((acc, row) => {
      const scoreString = row['Reputation Score'] || '0%';
      const score = parseInt(scoreString.toString().replace('%', ''), 10);
      const level = getReputationLevel(score);
      if (!acc[level]) {
        acc[level] = 0;
      }
      acc[level]++;
      return acc;
    }, {});
    const chartData = Object.entries(analysis).map(([name, value]) => ({ name, value }));
    return { serverName, chartData, rows, country };
  });

  useEffect(() => {
    if (serverAnalysis.length > 0 && (!activeServer || !servers[activeServer])) {
      setActiveServer(serverAnalysis[0].serverName);
    }
  }, [data, serverAnalysis, activeServer, servers]);

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          IP Reputation Analysis
        </Typography>
        <Typography>Upload Excel files and select a server to see the analysis.</Typography>
      </Paper>
    );
  }

  const activeServerData = serverAnalysis.find(s => s.serverName === activeServer);

  const reputationScores = activeServerData ? [...new Set(activeServerData.rows.map(r => r['Reputation Score'] || '0%'))] : [];

  const filteredRows = activeServerData ? activeServerData.rows.filter(row => {
    const scoreString = row['Reputation Score'] || '0%';
    const score = parseInt(scoreString.toString().replace('%', ''), 10);
    const level = getReputationLevel(score);
    const levelMatch = !filterLevel || level === filterLevel;
    const scoreMatch = !scoreFilter || scoreString === scoreFilter;
    return levelMatch && scoreMatch;
  }) : [];

  return (
    <Paper sx={{ p: 3, backgroundColor: '#ffffff' }}>
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {serverAnalysis.map(({ serverName }) => (
          <Chip 
            key={serverName} 
            label={serverName}
            onClick={() => { setActiveServer(serverName); setFilterLevel(null); setScoreFilter(''); setPage(0); }}
            sx={{
              fontWeight: 500,
              backgroundColor: activeServer === serverName ? 'primary.main' : 'transparent',
              color: activeServer === serverName ? 'primary.contrastText' : 'inherit',
              '&:hover': {
                backgroundColor: activeServer === serverName ? 'primary.dark' : 'action.hover',
              },
            }}
          />
        ))}
      </Box>

      {activeServerData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Typography variant="h6">{`${activeServerData.serverName} (${activeServerData.country})`}</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activeServerData.chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  onClick={handlePieClick}
                >
                  {activeServerData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filter by Score</InputLabel>
                    <Select
                        value={scoreFilter}
                        label="Filter by Score"
                        onChange={(e) => { setScoreFilter(e.target.value); setPage(0); }}
                    >
                        <MenuItem value=""><em>All Scores</em></MenuItem>
                        {reputationScores.map(score => (
                            <MenuItem key={score} value={score}>{score}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {filterLevel && (
                    <Button variant="outlined" size="small" onClick={() => { setFilterLevel(null); setPage(0); }}>
                        Clear Filter ({filterLevel})
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>IP</TableCell>
                    <TableCell>Reputation Score</TableCell>
                    <TableCell>Blacklist Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{row['ip'] || row['IP']}</TableCell>
                      <TableCell>{row['Reputation Score']}</TableCell>
                      <TableCell sx={{
                        color: row['Blacklist Status'] && row['Blacklist Status'].includes('Blacklisted') ? 'error.main' : 'inherit' 
                      }}>
                        {row['Blacklist Status']}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

Dashboard.propTypes = {
    data: PropTypes.array.isRequired,
    };

export default Dashboard;
