## Mini LinkedIn (MERN)

Simple social app where users can sign up, log in, create posts, and view a public feed.

### Tech Stack
- Backend: Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt
- Frontend: React (Vite), React Router

### Local Setup
Prerequisites: Node 18+, npm, MongoDB running locally (or Atlas URI).

1) Backend
```
cd backend
npm install
```

Run server:
```
npm run dev
```
Server starts at `http://localhost:5001`.

2) Frontend
```
cd ../frontend
npm install
```
Optionally create `.env` in `frontend/` to point at your backend:
```

```
Run app:
```
npm run dev
```
Open `http://localhost:5173`.

### Features
- Sign up / Log in with email & password
- JWT stored in localStorage (Bearer on requests)
- Create posts (text)
- Public feed of all posts, newest first

### API Endpoints
- `POST //signup` -> { token, user }
- `POST /login` -> { token, user }
- `POST /posts` (auth) -> create post
- `GET /posts` -> list posts

### Deploy
- Frontend: Vercel/Netlify
  - Build command: `npm run build`
  - Output dir: `dist`
- Backend: Render/Railway
  - Set env vars: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`
  - Start command: `npm start`

Update `CLIENT_URL` (backend) and `VITE_API_URL` (frontend) to your deployed URLs.

### Folder Structure
```
mini-linkedin/
  backend/
    src/
      index.js
      lib/db.js
      models/{User.js,Post.js}
      middleware/auth.js
      routes/{auth.js,posts.js}
  frontend/
    src/
      auth/AuthContext.jsx
      components/NavBar.jsx
      pages/{LoginPage.jsx,SignupPage.jsx,FeedPage.jsx}
      services/api.js
      App.jsx, main.jsx, styles.css
```


