import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
const API_URL = 'http://localhost:5000';

function NewPost({ onCreated }) {
  const { token } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please type something for your post');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('text', text);
      if (image) form.append('image', image);
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form
      });
      const ctPost = res.headers.get('content-type') || '';
      const post = ctPost.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) throw new Error((post && post.error) || post || 'Create post failed');
      setText('');
      setImage(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setShowModal(false);
      onCreated(post);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 12 }}>
      <div style={{ flex: 1, color: '#6b7280' }}>Share something with your network…</div>
      <button
        className="btn primary"
        onClick={() => setShowModal(true)}
        style={{
          background: '#0a66c2',
          border: 'none',
          color: '#fff',
          fontWeight: 600,
          padding: '10px 14px',
          borderRadius: 8,
          cursor: 'pointer'
        }}
      >
        + Create Post
      </button>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 560, height: '80vh', padding: 16, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Create Post</h3>
              <button className="btn" onClick={() => { setShowModal(false); }} aria-label="Close">✕</button>
            </div>

            <form onSubmit={submit} style={{ flex: 1, overflow: 'auto' }}>
              <textarea
                rows={5}
                placeholder="Share something..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ width: '100%' }}
              />

              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (!f) { setImage(null); setFileName(''); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); return; }
                    const allowed = ['image/png','image/jpeg','image/gif'];
                    if (!allowed.includes(f.type)) {
                      setError('Only PNG, JPG, GIF up to 5MB are allowed');
                      e.target.value = '';
                      setImage(null);
                      setFileName('');
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      return;
                    }
                    if (f.size > 5 * 1024 * 1024) {
                      setError('Image exceeds 5MB limit');
                      e.target.value = '';
                      setImage(null);
                      setFileName('');
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      return;
                    }
                    setError('');
                    setImage(f);
                    setFileName(f.name);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(URL.createObjectURL(f));
                  }}
                  style={{ display: 'none' }}
                />
                <label htmlFor="imageInput" className="btn" style={{ cursor: 'pointer', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, background: '#f8f8f8' }}>
                  📎 Choose image
                </label>
                <span style={{ color: '#666', fontSize: 12, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fileName || 'PNG, JPG, GIF up to 5MB'}
                </span>
              </div>

              {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
              {previewUrl && (
                <div className="post-image" style={{ marginTop: 8 }}>
                  <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '40vh', borderRadius: 8, objectFit: 'contain' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => { setShowModal(false); }}>
                  Cancel
                </button>
                <button className="btn primary" disabled={loading}>
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const [confirmPostId, setConfirmPostId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/posts`);
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await res.json() : await res.text();
        if (!res.ok) throw new Error((data && data.error) || data || 'Load feed failed');
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onCreated(post) {
    setPosts((prev) => [post, ...prev]);
  }

  async function deletePost(postId) {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) throw new Error((data && data.error) || data || 'Delete failed');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setConfirmPostId(null);
    } catch (e) {
      setError(e.message);
    }
  }

  function openConfirm(postId) {
    setConfirmPostId(postId);
  }
  function closeConfirm() {
    setConfirmPostId(null);
  }
  function confirmDelete() {
    if (confirmPostId) deletePost(confirmPostId);
  }

  return (
    <>
    <div className="feed">
      <NewPost onCreated={onCreated} />
      {loading && <div>Loading feed...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>
          <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 12 }}>📰</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No posts yet</div>
          <div>Be the first to share something with your network.</div>
        </div>
      )}
      {posts.map((p) => (
        <div key={p.id} className="card post">
          <div className="post-header">
            <span className="avatar">{p.user.name.charAt(0).toUpperCase()}</span>
            <div>
              <div className="name">{p.user.name}</div>
              <div className="time">{new Date(p.createdAt).toLocaleString()}</div>
            </div>
            {user && user.id === p.user.id && (
              <div style={{ marginLeft: 'auto' }}>
                <button className="btn" onClick={() => openConfirm(p.id)} title="Delete post">🗑️</button>
              </div>
            )}
          </div>
          <div className="post-text">{p.text}</div>
          {p.image && (
            <div className="post-image">
              <img src={`${API_URL}${p.image}`} alt="post" style={{ maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
            </div>
          )}
        </div>
      ))}
    </div>
    {confirmPostId && (
      <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
        <div className="modal" style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 420, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Delete post?</h3>
            <button className="btn" onClick={closeConfirm} aria-label="Close">✕</button>
          </div>
          <p style={{ color: '#555', marginTop: 8 }}>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={closeConfirm}>Cancel</button>
            <button className="btn primary" onClick={confirmDelete} style={{ background: '#d9534f', borderColor: '#d43f3a' }}>Delete</button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}


