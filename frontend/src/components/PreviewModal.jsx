import { X } from 'lucide-react';

export default function PreviewModal({ url, file, onClose }) {
  if (!url || !file) return null;

  // Determine if it is an image
  const isImage = file.mimeType && file.mimeType.startsWith('image/');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <X size={24} />
        </button>
        {isImage ? (
          <img src={url} alt="Preview" className="preview-image" />
        ) : (
          <iframe src={url} title="Preview" className="preview-iframe" />
        )}
      </div>
    </div>
  );
}
