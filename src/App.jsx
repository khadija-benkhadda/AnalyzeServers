import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import CountryView from './components/CountryView';
import IpView from './components/IpView';
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
  const [activeView, setActiveView] = useState(null);

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
      setSelectedServers([]);
      setActiveView(null);
    } else {
      setServers([]);
      setSelectedServers([]);
      setActiveView(null);
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

        allFilesData.forEach((jsonData, index) => {
            if (jsonData.length > 0) {
                const hasEntity = Object.prototype.hasOwnProperty.call(jsonData[0], 'Entity');
                if (!hasEntity) {
                    jsonData.forEach(row => {
                        const serverName = row['server'] || row['Server Name'];
                        if (serverName) {
                            if (typeof serverName === 'string') {
                                const parts = serverName.split('_');
                                if (parts.length > 1) {
                                    row['Entity'] = parts[1];
                                }
                            }
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
    });
};


  const handleClear = () => {
    setData([]);
    setEntities([]);
    setServers([]);
    setSelectedEntity('');
    setSelectedServers([]);
    setActiveView(null);
  };

  const handleServerChange = (event) => {
    const {
      target: { value },
    } = event;
    if (value.includes('all')) {
      setSelectedServers(servers.length === selectedServers.length ? [] : servers.map(s => s.name));
    } else {
      setSelectedServers(typeof value === 'string' ? value.split(',') : value);
    }
  };

  const entityFilteredData = data.filter((item) => item['Entity'] === selectedEntity);

  const serverFilteredData = selectedServers.length > 0 
    ? entityFilteredData.filter(row => selectedServers.includes(row.server || row['Server Name']))
    : [];

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
                                    <em>None</em>
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
                                <Button onClick={() => setActiveView('entity')} variant={activeView === 'entity' ? 'contained' : 'outlined'} disabled={!selectedEntity}>Entity Analysis</Button>
                                <Button onClick={() => setActiveView('server')} variant={activeView === 'server' ? 'contained' : 'outlined'} disabled={!selectedServers.length}>Server Analysis</Button>
                                <Button onClick={() => setActiveView('country')} variant={activeView === 'country' ? 'contained' : 'outlined'} disabled={!selectedEntity}>Country-Level Analysis</Button>
                                <Button onClick={() => setActiveView('ip')} variant={activeView === 'ip' ? 'contained' : 'outlined'} disabled={!data.length}>IP Analysis</Button>
                            </ButtonGroup>
                        </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {activeView && (
            <Grid item xs={12}>
                {activeView === 'country' ? (
                    <CountryView data={entityFilteredData} />
                ) : activeView === 'entity' ? (
                    <Dashboard 
                        data={entityFilteredData} 
                        entityName={selectedEntity}
                        viewType={'entity'}
                    />
                ) : activeView === 'server' ? (
                    <Dashboard 
                        data={serverFilteredData}
                        entityName={selectedEntity}
                        selectedServerNames={selectedServers}
                        viewType={'server'}
                    />
                ) : activeView === 'ip' ? (
                    <IpView data={data} />
                ) : null}
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}

export default App;
