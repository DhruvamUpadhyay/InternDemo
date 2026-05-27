import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FolderPlus, Home, ChevronRight } from 'lucide-react';
import FileBrowser from './FileBrowser';
import PreviewModal from './PreviewModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export default function Dashboard({ user }) {
  const [items, setItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState({ id: 'root', name: 'Home' });
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'Home' }]);
  
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_BASE}/api/fs/${currentFolder.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user, currentFolder]);

  // ---- FILE ACTIONS ----
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parentId', currentFolder.id);

      await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      fetchItems();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('New Folder Name:');
    if (!name) return;
    try {
      const token = await user.getIdToken();
      await axios.post(`${API_BASE}/api/folders`, { name, parentId: currentFolder.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (error) {
      alert('Failed to create folder');
    }
  };

  const handleRename = async (id, newName) => {
    try {
      const token = await user.getIdToken();
      await axios.put(`${API_BASE}/api/files/${id}`, { name: newName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (error) {
      alert('Rename failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = await user.getIdToken();
      await axios.delete(`${API_BASE}/api/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleCopy = async (id) => {
    try {
      const token = await user.getIdToken();
      await axios.post(`${API_BASE}/api/files/${id}/copy`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (error) {
      alert('Copy failed');
    }
  };

  const handlePreview = async (item) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${API_BASE}/api/files/${item.id}/access`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviewData({ url: res.data.url, file: item });
    } catch (error) {
      alert('Failed to generate preview');
    }
  };

  // ---- NAVIGATION ----
  const navigateToFolder = (folder) => {
    setCurrentFolder(folder);
    const existingIndex = breadcrumbs.findIndex(b => b.id === folder.id);
    if (existingIndex >= 0) {
      setBreadcrumbs(breadcrumbs.slice(0, existingIndex + 1));
    } else {
      setBreadcrumbs([...breadcrumbs, folder]);
    }
  };

  // ---- DRAG & DROP ----
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]); // handles first file for now
    }
  };

  return (
    <div 
      className="animate-fade-in" 
      style={{ marginTop: '1rem', minHeight: '80vh', position: 'relative' }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="drag-overlay">
          <div className="drag-message">
            <UploadCloud size={64} style={{ display: 'block', margin: '0 auto 10px' }} />
            Drop to Upload to "{currentFolder.name}"
          </div>
        </div>
      )}

      {/* Header / Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="breadcrumbs">
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                className="breadcrumb-link" 
                onClick={() => navigateToFolder(crumb)}
                style={{ fontWeight: idx === breadcrumbs.length - 1 ? 'bold' : 'normal', color: idx === breadcrumbs.length - 1 ? 'white' : '' }}
              >
                {idx === 0 ? <Home size={18} /> : crumb.name}
              </span>
              {idx < breadcrumbs.length - 1 && <ChevronRight size={16} color="var(--text-muted)" />}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={handleCreateFolder}>
            <FolderPlus size={18} /> New Folder
          </button>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud size={18} /> {uploading ? 'Uploading...' : 'Upload File'}
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleUpload(e.target.files[0])} />
        </div>
      </div>

      {/* File System Grid */}
      <FileBrowser 
        items={items}
        onOpenFolder={navigateToFolder}
        onPreviewFile={handlePreview}
        onRename={handleRename}
        onDelete={handleDelete}
        onCopy={handleCopy}
      />

      {/* Modals */}
      {previewData && <PreviewModal url={previewData.url} file={previewData.file} onClose={() => setPreviewData(null)} />}
    </div>
  );
}
