import React, { useState, useEffect, useMemo } from 'react';
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
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const getReputationLevel = (score) => {
  if (score === 0) return 'Clean';
  if (score >= 1 && score <= 39) return 'Good';
  if (score >= 40 && score <= 69) return 'Medium';
  if (score >= 70 && score <= 100) return 'High';
  return 'N/A';
};

const COLORS = {
  Clean: '#4CAF50',
  Good: '#2196F3',
  Medium: '#FFC107',
  High: '#F44336',
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

const Dashboard = ({ data, entityName, selectedServerNames, viewType }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [scoreFilter, setScoreFilter] = useState('');
    const [activeServer, setActiveServer] = useState(null);
    const [chartFilter, setChartFilter] = useState({ level: null, server: null });

    useEffect(() => {
        if (viewType === 'server' && selectedServerNames && selectedServerNames.length > 0) {
            setActiveServer(prevActiveServer => 
                selectedServerNames.includes(prevActiveServer) ? prevActiveServer : selectedServerNames[0]
            );
        } else if (viewType !== 'server') {
            setActiveServer(null);
        }
        
        setChartFilter({ level: null, server: null });
        setScoreFilter('');
        setPage(0);
    }, [entityName, viewType, selectedServerNames]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChartClick = (data) => {
        if (viewType !== 'entity' || !data) return;

        // If 'payload' property exists, it's from recharts, otherwise it's from our custom calls.
        const payload = data.payload ? data.payload : data;
        
        if(!payload) return;

        const { name, server } = payload;
        setChartFilter(currentFilter => {
            if (currentFilter.level === name && currentFilter.server === (server || null)) {
                return { level: null, server: null }; // Toggle off
            }
            return { level: name, server: server || null };
        });
        setPage(0);
    };
    
    const { analysisData, displayData, title, reputationScores, entitySummary } = useMemo(() => {
        let sourceData = [];
        let title = '';
        let entitySummary = { highRiskServers: [], blacklistedServers: [] };

        if (viewType === 'entity') {
            sourceData = data;
            title = `${entityName} - Global Reputation Overview`;
            
            const serverMetrics = data.reduce((acc, row) => {
                const serverName = row['server'] || row['Server Name'];
                if (!serverName) return acc;

                if (!acc[serverName]) {
                    acc[serverName] = { highRiskCount: 0, blacklistedCount: 0, totalIps: 0 };
                }

                acc[serverName].totalIps++;

                const scoreString = row['Reputation Score'] || '0%';
                const score = parseInt(scoreString.toString().replace('%', ''), 10);
                if (getReputationLevel(score) === 'High') {
                    acc[serverName].highRiskCount++;
                }

                if (row['Blacklist Status'] && row['Blacklist Status'].includes('Blacklisted')) {
                    acc[serverName].blacklistedCount++;
                }
                return acc;
            }, {});

            entitySummary.highRiskServers = Object.entries(serverMetrics)
                .filter(([, metrics]) => metrics.highRiskCount > 0)
                .sort((a, b) => b[1].highRiskCount - a[1].highRiskCount)
                .map(([serverName]) => serverName);

            entitySummary.blacklistedServers = Object.entries(serverMetrics)
                .filter(([, metrics]) => metrics.blacklistedCount > 0)
                .map(([serverName, metrics]) => ({
                    name: serverName,
                    percentage: ((metrics.blacklistedCount / metrics.totalIps) * 100).toFixed(0)
                }))
                .sort((a, b) => b.percentage - a.percentage);

        } else if (viewType === 'server' && selectedServerNames.length > 0) {
            const serverToAnalyze = activeServer || selectedServerNames[0];
            sourceData = data.filter(row => (row.server || row['Server Name']) === serverToAnalyze);
            
            const serverRow = sourceData.find(row => row.Country);
            const country = serverRow ? ` (${serverRow.Country})` : '';
            title = `${serverToAnalyze}${country}`;
        }

        const analysis = sourceData.reduce((acc, row) => {
            const scoreString = row['Reputation Score'] || '0%';
            const score = parseInt(scoreString.toString().replace('%', ''), 10);
            const level = getReputationLevel(score);
            if (!acc[level]) {
                acc[level] = { name: level, value: 0 };
            }
            acc[level].value++;
            return acc;
        }, {});
        
        const chartData = Object.values(analysis);
        const scores = [...new Set(sourceData.map(r => r['Reputation Score'] || '0%'))].sort();

        return { analysisData: chartData, displayData: sourceData, title, reputationScores: scores, entitySummary };

    }, [data, entityName, selectedServerNames, viewType, activeServer]);

    const dynamicServerList = useMemo(() => {
        if (!chartFilter.level || viewType !== 'entity') {
            return null;
        }

        const level = chartFilter.level;
        const isBlacklistCase = level === 'Blacklisted';

        const serverMetrics = data.reduce((acc, row) => {
            const serverName = row['server'] || row['Server Name'];
            if (!serverName) return acc;

            if (!acc[serverName]) {
                acc[serverName] = { count: 0, totalIps: 0 };
            }
            acc[serverName].totalIps++;

            let isMatch = false;
            if (isBlacklistCase) {
                if (row['Blacklist Status'] && row['Blacklist Status'].includes('Blacklisted')) {
                    isMatch = true;
                }
            } else {
                const scoreString = row['Reputation Score'] || '0%';
                const score = parseInt(scoreString.toString().replace('%', ''), 10);
                if (getReputationLevel(score) === level) {
                    isMatch = true;
                }
            }

            if (isMatch) {
                acc[serverName].count++;
            }
            return acc;
        }, {});

        const serverList = Object.entries(serverMetrics)
            .filter(([, metrics]) => metrics.count > 0)
            .map(([serverName, metrics]) => ({
                name: serverName,
                count: metrics.count,
                total: metrics.totalIps,
                percentage: ((metrics.count / metrics.totalIps) * 100).toFixed(0)
            }))
            .sort((a, b) => b.count - a.count);

        return {
            title: `Servers with ${level} IPs`,
            servers: serverList,
            isBlacklist: isBlacklistCase
        };
    }, [chartFilter.level, data, viewType]);

    const filteredRows = useMemo(() => {
        let initialRows;
        if (viewType === 'entity') {
            initialRows = data;
        } else { // server view
            const serverToAnalyze = activeServer || (selectedServerNames && selectedServerNames.length > 0 && selectedServerNames[0]);
            if (serverToAnalyze) {
                initialRows = data.filter(row => (row.server || row['Server Name']) === serverToAnalyze);
            } else {
                initialRows = [];
            }
        }
    
        if (!initialRows) return [];
        
        if (viewType === 'entity' && !chartFilter.level) {
            return [];
        }
    
        let newRows = initialRows;
    
        if (viewType === 'entity' && chartFilter.level) {
             newRows = newRows.filter(row => {
                 const serverName = row['server'] || row['Server Name'];
                 const scoreString = row['Reputation Score'] || '0%';
                 const score = parseInt(scoreString.toString().replace('%', ''), 10);
                 const level = getReputationLevel(score);
    
                if (chartFilter.server) {
                    if (chartFilter.level === 'Blacklisted'){
                         return serverName === chartFilter.server && row['Blacklist Status'] && row['Blacklist Status'].includes('Blacklisted');
                    } else if (chartFilter.level === 'High') {
                         return serverName === chartFilter.server && level === 'High';
                    } 
                     return serverName === chartFilter.server && level === chartFilter.level;
                } else {
                     return level === chartFilter.level;
                }
            });
        } else if (viewType === 'server') { 
            if (scoreFilter) {
                 newRows = newRows.filter(row => (row['Reputation Score'] || '0%') === scoreFilter);
            }
        }
    
        return newRows;
    }, [data, viewType, chartFilter, scoreFilter, activeServer, selectedServerNames]);

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No data available for this selection.</Typography>
            </Paper>
        );
    }
    
    const renderEntityView = () => (
    <Paper sx={{ p: 3, mb: 3 }} className="glass-card">
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6">{title}</Typography>
                 {chartFilter.level && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="subtitle2">Filtered by:</Typography>
                        <Chip 
                            label={`${chartFilter.level}${chartFilter.server ? ` on ${chartFilter.server}` : ''}`}
                            onDelete={() => setChartFilter({ level: null, server: null })}
                            size="small"
                        />
                    </Box>
                )}
            </Grid>

            <Grid item xs={12} md={5}>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={analysisData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={renderCustomizedLabel} onClick={handleChartClick}>
                            {analysisData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} cursor="pointer" />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Grid>

            <Grid item xs={12} md={7}>
                {!chartFilter.level ? (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Card variant="outlined" className="glass-card">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>High-Risk Servers</Typography>
                                    <List dense>
                                        {entitySummary.highRiskServers.slice(0, 5).map(server => (
                                            <ListItem key={server} button onClick={() => handleChartClick({ name: 'High', server: server })}>
                                                <ListItemText primary={server} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Card variant="outlined" className="glass-card">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Blacklisted Servers</Typography>
                                    <List dense>
                                        {entitySummary.blacklistedServers.slice(0, 5).map(server => (
                                            <ListItem key={server.name} button onClick={() => handleChartClick({ name: 'Blacklisted', server: server.name })}>
                                                <ListItemText primary={`${server.name} ${server.percentage}% of IPs`} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                ) : (
                    <Card variant="outlined" className="glass-card">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>{dynamicServerList.title}</Typography>
                            <List dense>
                                {dynamicServerList.servers.slice(0, 5).map(server => (
                                    <ListItem key={server.name} button onClick={() => handleChartClick({ name: chartFilter.level, server: server.name })}>
                                        <ListItemText 
                                            primary={server.name} 
                                            secondary={dynamicServerList.isBlacklist ? `${server.percentage}% of IPs` : `${server.count} IPs`} 
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                )}
            </Grid>

            {chartFilter.level && renderTable()}
        </Grid>
    </Paper>
    )

    const renderServerView = () => (
        <>
            {viewType === 'server' && selectedServerNames.length > 1 && (
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedServerNames.map(serverName => (
                        <Button
                            key={serverName}
                            variant={(activeServer || selectedServerNames[0]) === serverName ? 'contained' : 'outlined'}
                            onClick={() => setActiveServer(serverName)}
                        >
                            {serverName}
                        </Button>
                    ))}
                </Box>
            )}
            <Paper sx={{ p: 3, mb: 3 }} className="glass-card">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6">{title}</Typography>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <ResponsiveContainer width="100%" height={300}>
                           <PieChart>
                                <Pie
                                    data={analysisData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {analysisData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]}/>
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={7}>
                         <Box sx={{ mb: 2 }}>
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
                        </Box>
                       {renderTable(false)}
                    </Grid>
                </Grid>
            </Paper>
        </>
    )

    const renderTable = (showServer = true) => (
        <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined" className="glass-card">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {showServer && <TableCell>Server</TableCell>}
                            <TableCell>IP</TableCell>
                            <TableCell>Reputation Score</TableCell>
                            <TableCell>Blacklist Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                            <TableRow key={index} hover>
                                {showServer && <TableCell>{row['server'] || row['Server Name']}</TableCell>}
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
    )

    return viewType === 'entity' ? renderEntityView() : renderServerView();
};

Dashboard.propTypes = {
    data: PropTypes.array.isRequired,
    entityName: PropTypes.string.isRequired,
    selectedServerNames: PropTypes.array,
    viewType: PropTypes.oneOf(['entity', 'server']).isRequired,
};

Dashboard.defaultProps = {
    selectedServerNames: [],
};

export default Dashboard;
