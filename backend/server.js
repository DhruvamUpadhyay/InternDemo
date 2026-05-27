const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const verifyToken = require('./middleware/auth');
const { db } = require('./firebaseAdmin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Set up Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// 1. UPLOAD FILE API
app.post('/api/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const parentId = req.body.parentId || 'root';
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const userId = req.user.uid;
    const fileName = `${userId}/${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

    if (error) throw error;

    if (db) {
      await db.collection('files').add({
        userId, name: file.originalname, storagePath: fileName, mimeType: file.mimetype, size: file.size, parentId, isFolder: false, uploadedAt: new Date()
      });
    }

    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// 2. CREATE FOLDER API
app.post('/api/folders', verifyToken, async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const userId = req.user.uid;
    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    await db.collection('files').add({ userId, name, parentId: parentId || 'root', isFolder: true, uploadedAt: new Date() });
    res.status(200).json({ message: 'Folder created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// 3. GET FILES & FOLDERS
app.get('/api/fs/:parentId', verifyToken, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not configured' });
    const userId = req.user.uid;
    const parentId = req.params.parentId;

    const snapshot = await db.collection('files').where('userId', '==', userId).where('parentId', '==', parentId).get();
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));

    items.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      const timeA = a.uploadedAt?.toMillis ? a.uploadedAt.toMillis() : 0;
      const timeB = b.uploadedAt?.toMillis ? b.uploadedAt.toMillis() : 0;
      return timeB - timeA;
    });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// 4. GET SIGNED URL (PREVIEW) & LOG ACCESS
app.get('/api/files/:fileId/access', verifyToken, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not configured' });
    const { fileId } = req.params;
    const userId = req.user.uid;

    const fileDoc = await db.collection('files').doc(fileId).get();
    if (!fileDoc.exists) return res.status(404).json({ error: 'File not found' });
    
    const fileData = fileDoc.data();
    if (fileData.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (fileData.isFolder) return res.status(400).json({ error: 'Cannot preview folder' });

    // Log access
    await db.collection('access_logs').add({
      fileId, 
      fileName: fileData.name, 
      userId, 
      userEmail: req.user.email || 'Unknown',
      action: 'Secure Preview', 
      timestamp: new Date(), 
      ipAddress: req.ip, 
      userAgent: req.get('User-Agent')
    });

    const { data, error } = await supabase.storage.from('uploads').createSignedUrl(fileData.storagePath, 3600);
    if (error) throw error;
    res.status(200).json({ url: data.signedUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate access URL' });
  }
});

// 5. RENAME FILE/FOLDER
app.put('/api/files/:fileId', verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name } = req.body;
    const userId = req.user.uid;

    const fileRef = db.collection('files').doc(fileId);
    const doc = await fileRef.get();
    if (!doc.exists || doc.data().userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await fileRef.update({ name });
    res.status(200).json({ message: 'Renamed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rename' });
  }
});

// 6. DELETE FILE/FOLDER
app.delete('/api/files/:fileId', verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.uid;

    const fileRef = db.collection('files').doc(fileId);
    const doc = await fileRef.get();
    if (!doc.exists || doc.data().userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const data = doc.data();

    if (!data.isFolder && data.storagePath) {
      await supabase.storage.from('uploads').remove([data.storagePath]);
    }
    await fileRef.delete();
    
    // Log Delete Action
    await db.collection('access_logs').add({
      fileId, fileName: data.name, userId, userEmail: req.user.email || 'Unknown', action: 'Deleted File', timestamp: new Date(), ipAddress: req.ip, userAgent: req.get('User-Agent')
    });

    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// 7. COPY FILE
app.post('/api/files/:fileId/copy', verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.uid;

    const doc = await db.collection('files').doc(fileId).get();
    if (!doc.exists || doc.data().userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const data = doc.data();
    if (data.isFolder) return res.status(400).json({ error: 'Cannot copy folders yet' });

    const newFileName = `${userId}/${Date.now()}-copy-${data.name}`;
    const { error } = await supabase.storage.from('uploads').copy(data.storagePath, newFileName);
    if (error) throw error;

    await db.collection('files').add({
      ...data, name: `Copy of ${data.name}`, storagePath: newFileName, uploadedAt: new Date()
    });
    
    // Log Copy Action
    await db.collection('access_logs').add({
      fileId, fileName: data.name, userId, userEmail: req.user.email || 'Unknown', action: 'Copied File', timestamp: new Date(), ipAddress: req.ip, userAgent: req.get('User-Agent')
    });

    res.status(200).json({ message: 'Copied successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to copy' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
