import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './FileUploadModal.css';
import { XCircleIcon } from '@heroicons/react/24/solid';

const FileUploadModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [existingFiles, setExistingFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    // Fetch the list of existing files from the server
    axios.get(`${process.env.REACT_APP_CHAT_API_URL}/files`)
      .then((response) => {
        setExistingFiles(response.data.files);
      })
      .catch((error) => {
        console.error('Error fetching existing files:', error);
      });
  }, []);

  const onDrop = (acceptedFiles) => {
    const allowedExtensions = [
      'txt', 'json', 'csv', 'pdf', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs',
      'rb', 'php', 'swift', 'go', 'rs', 'kt', 'kts', 'scala', 'yml', 'yaml', 'env', 'ini', 'toml', 'xml',
      'html', 'css', 'scss', 'sass', 'less', 'styl', 'vue', 'svelte', 'md', 'markdown', 'log', 'sql',
      // Add more file extensions as needed
    ];

    const validFiles = acceptedFiles.filter((file) => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      return allowedExtensions.includes(fileExtension);
    });

    setFiles([...files, ...validFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.warning('Please select files to upload.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${process.env.REACT_APP_CHAT_API_URL}/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prevProgress) => {
            const newProgress = {};
            files.forEach((file) => {
              newProgress[file.name] = percentCompleted;
            });
            return newProgress;
          });
        },
      });

      if (response && response.data && response.data.message === 'Files uploaded successfully') {
        console.log('Upload successful:', response.data);
        toast.success('Files uploaded successfully!');
        setUploadedFiles([...uploadedFiles, ...files]);
        setFiles([]);
        setUploadProgress({});
        // Fetch the updated list of existing files after successful upload
        axios.get(`${process.env.REACT_APP_CHAT_API_URL}/files`)
          .then((response) => {
            setExistingFiles(response.data.files);
          })
          .catch((error) => {
            console.error('Error fetching existing files:', error);
          });
      } else {
        console.warn('Upload response or response.data is undefined');
        toast.error('File upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('File upload failed. Please try again.');
    }
  };

  const handleRemoveFile = (fileName) => {
    // Remove the file from uploadedFiles
    setUploadedFiles(uploadedFiles.filter((file) => file.name !== fileName));
    // Remove the file from the server (you'll need to implement the server-side endpoint)
    axios.delete(`${process.env.REACT_APP_CHAT_API_URL}/files/${fileName}`)
      .then(() => {
        toast.success('File removed successfully!');
        // Fetch the updated list of existing files after removing the file
        axios.get(`${process.env.REACT_APP_CHAT_API_URL}/files`)
          .then((response) => {
            setExistingFiles(response.data.files);
          })
          .catch((error) => {
            console.error('Error fetching existing files:', error);
          });
      })
      .catch((error) => {
        console.error('Error removing file:', error);
        toast.error('Failed to remove file. Please try again.');
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
      appElement={document.getElementById('root')}
    >
      <div className="modal-content bg-gray-800 text-white rounded-md p-6">
        <h2 className="modal-title text-2xl font-semibold mb-4">Upload Files</h2>
        <div {...getRootProps()} className="dropzone bg-gray-700 p-4 rounded-md mb-4">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-gray-300">Drop the files here ...</p>
          ) : (
            <p className="text-gray-300">Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
        <div className="existing-files mb-4">
          <h3 className="text-lg font-semibold mb-2">Existing Files:</h3>
          <ul>
            {existingFiles.map((file) => (
              <li key={file} className="text-gray-300 flex items-center justify-between">
                <span>{file}</span>
                <button
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  onClick={() => handleRemoveFile(file)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <ul className="file-list mb-4">
          {uploadedFiles.map((file) => (
            <li key={file.name} className="file-item mb-2">
              <div className="flex items-center">
                <div className="w-full bg-gray-600 rounded-full h-8">
                  <div
                    className="bg-green-500 bg-opacity-50 text-black text-sm font-medium rounded-full h-8 flex items-center justify-between px-4"
                    style={{ width: '100%' }}
                  >
                    <span>{file.name}</span>
                    <span>{file.size} bytes</span>
                    <span className="ml-2 flex items-center">
                      Completed
                      <button
                        className="text-red-500 hover:text-red-700 focus:outline-none ml-2"
                        onClick={() => handleRemoveFile(file.name)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {files.map((file) => (
            <li key={file.name} className="file-item mb-2">
              <div className="flex items-center">
                <div className="w-full bg-gray-600 rounded-full h-8">
                  <div
                    className="bg-orange-500 bg-opacity-50 text-black text-sm font-medium rounded-full h-8 flex items-center justify-between px-4"
                    style={{ width: `${uploadProgress[file.name] || 0}%` }}
                  >
                    <span>{file.name}</span>
                    <span>{file.size} bytes</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="modal-buttons flex justify-end">
          <button
            onClick={handleUpload}
            className="upload-button bg-blue-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={files.length === 0}
          >
            Upload
          </button>
          <button
            onClick={onClose}
            className="close-button bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FileUploadModal;