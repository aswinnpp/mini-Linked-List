## Mini LinkedIn (MERN)

Simple social app where users can sign up, log in, create posts, and view a public feed.

### Tech Stack
- Backend: Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt
- Frontend: React (Vite), React Router

### Local Setup
Prereqs: Node 18+, npm, MongoDB running locally (or Atlas URI).

1) Backend
```
cd backend
npm install
```
Create `.env` in `backend/`:
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/mini_linkedin
JWT_SECRET=replace_with_a_secure_random_string
CLIENT_URL=http://localhost:5173
```
Run server:
```
npm run dev
```
Server starts at `http://localhost:4000`.

2) Frontend
```
cd ../frontend
npm install
```
Optionally create `.env` in `frontend/` to point at your backend:
```
VITE_API_URL=http://localhost:4000/api
```
Run app:
```
npm run dev
```
Open `http://localhost:5173`.

### Features
- Signup/Login with email & password
- JWT stored in localStorage (Bearer on requests)
- Create post (text)
- Public feed of all posts, newest first

### API Endpoints
- `POST /api/auth/signup` -> { token, user }
- `POST /api/auth/login` -> { token, user }
- `POST /api/posts` (auth) -> create post
- `GET /api/posts` -> list posts

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


