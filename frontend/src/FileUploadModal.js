import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Modal from 'react-modal';

const FileUploadModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${process.env.REACT_APP_CHAT_API_URL}/upload_files`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prevProgress) => ({
            ...prevProgress,
            [progressEvent.config.data.get('files').name]: percentCompleted,
          }));
        },
      });
      console.log('Upload successful:', response.data);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      <ul>
        {files.map((file) => (
          <li key={file.name}>
            {file.name} - {file.size} bytes
            {uploadProgress[file.name] && <progress value={uploadProgress[file.name]} max="100" />}
          </li>
        ))}
      </ul>
      <button onClick={handleUpload}>Upload</button>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default FileUploadModal;