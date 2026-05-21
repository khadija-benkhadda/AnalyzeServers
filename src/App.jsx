import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import CountryView from './components/CountryView';
import {
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Checkbox,
  ListItemText,
  Grid,
  Paper,
  Typography,
  Button,
  ButtonGroup,
} from '@mui/material';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [entities, setEntities] = useState([]);
  const [servers, setServers] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedServers, setSelectedServers] = useState([]);
  const [activeView, setActiveView] = useState('server'); // 'server' or 'country'

  useEffect(() => {
    if (data.length > 0) {
      const uniqueEntities = [...new Set(data.map((item) => item['Entity']).filter(Boolean))];
      setEntities(uniqueEntities);
    }
  }, [data]);

  useEffect(() => {
    if (selectedEntity) {
      const entityServers = data
        .filter((item) => item['Entity'] === selectedEntity)
        .reduce((acc, item) => {
          const serverName = item['server'] || item['Server Name'];
          if (serverName && !acc.find(s => s.name === serverName)) {
            acc.push({ name: serverName, country: item['Country'] });
          }
          return acc;
        }, []);
      setServers(entityServers);
      setSelectedServers([]); // Reset server selection when entity changes
    } else {
      setServers([]);
      setSelectedServers([]);
    }
  }, [selectedEntity, data]);

  const handleFileUpload = (acceptedFiles, setUploadProgress, setFilesProcessed) => {
    const allData = [];
    const promises = acceptedFiles.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const binaryStr = e.target.result;
                    const workbook = XLSX.read(binaryStr, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsBinaryString(file);
        });
    });

    Promise.all(promises).then(allFilesData => {
        let entityMap = {};
        // First pass: create entity map from files that have both server and entity
        allFilesData.forEach(jsonData => {
            if (jsonData.length > 0) {
                const hasServer = Object.prototype.hasOwnProperty.call(jsonData[0], 'server') || Object.prototype.hasOwnProperty.call(jsonData[0], 'Server Name');
                const hasEntity = Object.prototype.hasOwnProperty.call(jsonData[0], 'Entity');
                if (hasServer && hasEntity) {
                    jsonData.forEach(row => {
                        const serverName = row['server'] || row['Server Name'];
                        if (serverName && row['Entity']) {
                            entityMap[serverName] = row['Entity'];
                        }
                    });
                }
            }
        });

        // Second pass: process all files and enrich data
        allFilesData.forEach((jsonData, index) => {
            if (jsonData.length > 0) {
                const hasEntity = Object.prototype.hasOwnProperty.call(jsonData[0], 'Entity');
                if (!hasEntity) {
                    jsonData.forEach(row => {
                        const serverName = row['server'] || row['Server Name'];
                        if (serverName) {
                            // Try to extract from server name first
                            if (typeof serverName === 'string') {
                                const parts = serverName.split('_');
                                if (parts.length > 1) {
                                    row['Entity'] = parts[1];
                                }
                            }
                            // If not found, use the entity map
                            if (!row['Entity'] && entityMap[serverName]) {
                                row['Entity'] = entityMap[serverName];
                            }
                        }
                    });
                }
            }
            allData.push(...jsonData);

            const filesProcessed = index + 1;
            const progress = (filesProcessed / acceptedFiles.length) * 100;
            setFilesProcessed(filesProcessed);
            setUploadProgress(progress);
        });

        setData(allData);
    }).catch(error => {
        console.error("Error processing files:", error);
        // Handle error state in UI if necessary
    });
};


  const handleClear = () => {
    setData([]);
    setEntities([]);
    setServers([]);
    setSelectedEntity('');
    setSelectedServers([]);
  };

  const handleServerChange = (event) => {
    const { value } = event.target;
    if (value.includes('all')) {
      setSelectedServers(servers.length === selectedServers.length ? [] : servers.map(s => s.name));
    } else {
      setSelectedServers(value);
    }
  };

  const filteredData = data.filter((item) => {
    const entityMatch = !selectedEntity || item['Entity'] === selectedEntity;
    const serverMatch = 
        selectedServers.length === 0 || 
        selectedServers.includes(item['server'] || item['Server Name']);
    
    return entityMatch && serverMatch;
  });

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ my: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Control Panel
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FileUpload onFileUpload={handleFileUpload} onClear={handleClear} />
                </Grid>
                {data.length > 0 && (
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Entity</InputLabel>
                                <Select
                                value={selectedEntity}
                                onChange={(e) => setSelectedEntity(e.target.value)}
                                >
                                <MenuItem value="">
                                    <em>All</em>
                                </MenuItem>
                                {entities.map((entity) => (
                                    <MenuItem key={entity} value={entity}>
                                    {entity}
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={!selectedEntity} size="small">
                                <InputLabel>Servers</InputLabel>
                                <Select
                                multiple
                                value={selectedServers}
                                onChange={handleServerChange}
                                renderValue={(selected) => selected.join(', ')}
                                >
                                <MenuItem value="all">
                                    <Checkbox checked={servers.length > 0 && servers.length === selectedServers.length} />
                                    <ListItemText primary="All Servers" />
                                </MenuItem>
                                {servers.map((server) => (
                                    <MenuItem key={server.name} value={server.name}>
                                    <Checkbox checked={selectedServers.indexOf(server.name) > -1} />
                                    <ListItemText primary={server.name} />
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <ButtonGroup variant="outlined" aria-label="analysis type">
                                <Button onClick={() => setActiveView('server')} variant={activeView === 'server' ? 'contained' : 'outlined'}>Server Analysis</Button>
                                <Button onClick={() => setActiveView('country')} variant={activeView === 'country' ? 'contained' : 'outlined'}>Country-Level Analysis</Button>
                            </ButtonGroup>
                        </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {selectedServers.length > 0 && (
            <Grid item xs={12}>
                {activeView === 'server' ? (
                    <Dashboard data={filteredData} />
                ) : (
                    <CountryView data={filteredData} />
                )}
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}

export default App;
