import { useState, useRef, useEffect } from 'react';
import { Folder, File, MoreVertical, Edit2, Trash2, Copy } from 'lucide-react';

export default function FileBrowser({ items, onOpenFolder, onPreviewFile, onRename, onDelete, onCopy }) {
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  if (items.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>This folder is empty.</p>;
  }

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  const handleAction = (e, action, item) => {
    e.stopPropagation();
    setMenuOpenId(null);
    if (action === 'rename') {
      const newName = prompt('Enter new name:', item.name);
      if (newName && newName !== item.name) onRename(item.id, newName);
    } else if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${item.name}?`)) onDelete(item.id);
    } else if (action === 'copy') {
      onCopy(item.id);
    }
  };

  const handleItemClick = (item) => {
    if (item.isFolder) onOpenFolder(item);
    else onPreviewFile(item);
  };

  return (
    <div className="file-grid">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="file-card glass-panel" 
          onDoubleClick={() => handleItemClick(item)}
          onClick={() => handleItemClick(item)}
        >
          {/* Icon */}
          <div className="file-icon">
            {item.isFolder ? (
              <Folder size={48} color="var(--primary)" fill="rgba(99,102,241,0.2)" />
            ) : (
              <File size={48} color="#94a3b8" />
            )}
          </div>

          <h4 className="file-name" title={item.name}>{item.name}</h4>
          {!item.isFolder && (
            <span className="file-meta">
              {(item.size / 1024).toFixed(1)} KB • {new Date(item.uploadedAt?._seconds * 1000 || Date.now()).toLocaleDateString()}
            </span>
          )}

          {/* Context Menu Button */}
          <button 
            className="context-menu-btn" 
            onClick={(e) => handleMenuClick(e, item.id)}
          >
            <MoreVertical size={16} />
          </button>

          {/* Context Menu Dropdown */}
          {menuOpenId === item.id && (
            <div className="context-menu-dropdown">
              <button className="context-menu-item" onClick={(e) => handleAction(e, 'rename', item)}>
                <Edit2 size={14} /> Rename
              </button>
              {!item.isFolder && (
                <button className="context-menu-item" onClick={(e) => handleAction(e, 'copy', item)}>
                  <Copy size={14} /> Make a copy
                </button>
              )}
              <button className="context-menu-item danger" onClick={(e) => handleAction(e, 'delete', item)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
