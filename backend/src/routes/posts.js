import { Router } from 'express';
import { Post } from '../models/Post.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

const router = Router();

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id || payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Create a new post (auth required) with optional image
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const post = await Post.create({ user: req.userId, text: text.trim(), image: imagePath });
    const populated = await post.populate('user', 'fullName');
    res.status(201).json({
      id: populated._id,
      text: populated.text,
      image: populated.image,
      user: { id: populated.user._id, name: populated.user.fullName },
      createdAt: populated.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public feed: latest first
router.get('/', async (_req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'fullName');
    res.json(
      posts.map((p) => {
        const hasUser = p.user && typeof p.user === 'object';
        return {
          id: p._id,
          text: p.text,
          image: p.image,
          user: hasUser ? { id: p.user._id, name: p.user.fullName } : { id: null, name: 'Unknown' },
          createdAt: p.createdAt
        };
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a post (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Post.deleteOne({ _id: post._id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


