import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, LinearProgress, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({ onFileUpload, onClear }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filesProcessed, setFilesProcessed] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    setUploadProgress(0);
    setFilesProcessed(0);
    onFileUpload(acceptedFiles, setUploadProgress, setFilesProcessed);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleClear = () => {
    setFiles([]);
    setUploadProgress(0);
    setFilesProcessed(0);
    onClear();
  };

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500' }} />
        <Typography variant="h6" gutterBottom>
          Drop files here or click to upload
        </Typography>
        <Typography variant="body2" color="textSecondary">
          (Max 100 .xlsx or .xls files)
        </Typography>
      </Box>
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">{`${filesProcessed}/${files.length} files`}</Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Button onClick={handleClear} size="small" sx={{ mt: 1 }}>Clear</Button>
        </Box>
      )}
    </Box>
  );
};

FileUpload.propTypes = {
    onFileUpload: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
  };

export default FileUpload;
