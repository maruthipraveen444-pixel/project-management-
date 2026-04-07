# Deployment Guide: MERN Application (From Scratch)

This guide will walk you through deploying your **Zoho Projects** application to production. We will use the modern "Gold Standard" for free/hobby tier deployments:

*   **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud Database)
*   **Backend:** [Render](https://render.com/) (Node.js/Express)
*   **Frontend:** [Vercel](https://vercel.com/) (React/Vite)

---

## Part 1: Push your code to GitHub

Before deploying, your code needs to be on GitHub.

1.  Create a new repository on GitHub (e.g., `zoho-projects-clone`).
2.  Open your terminal in the root folder (`Zoho Projects`).
3.  Run these commands:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for deployment"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

---

## Part 2: Setup MongoDB Atlas (Database)

1.  **Register:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2.  **Create Cluster:** Choose the **FREE (Shared)** tier. Pick a region near you.
3.  **Security (Crucial):**
    *   **Database User:** Create a username and password (write them down!).
    *   **Network Access:** Add an IP address. Click "Allow Access from Anywhere" (`0.0.0.0/0`) so Render can connect.
4.  **Get Connection String:**
    *   Go to "Database" -> "Connect" -> "Drivers".
    *   Copy the connection string (looks like `mongodb+srv://<db_username>:<db_password>@cluster0...`).
    *   **Remember** to replace `<db_password>` with your actual password!

---

## Part 3: Deploy Backend (Render)

1.  **Create Account:** Go to [Render.com](https://render.com/) and sign in with GitHub.
2.  **New Web Service:**
    *   Select your GitHub repository.
3.  **Configure:**
    *   **Name:** `zoho-backend`
    *   **Root Directory:** `backend`
    *   **Environment:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
4.  **Add Environment Variables:** (Go to the "Env Vars" tab)
    *   `MONGODB_URI`: (Your Atlas connection string)
    *   `JWT_SECRET`: (Any random long string)
    *   `NODE_ENV`: `production`
    *   `FRONTEND_URL`: (Wait for Part 4 to get this URL, or put `*` temporarily)
5.  **Deploy:** Click "Create Web Service". Once finished, copy the **Render URL** (e.g., `https://zoho-backend.onrender.com`).

---

## Part 4: Deploy Frontend (Vercel)

1.  **Create Account:** Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2.  **Add New Project:**
    *   Import your GitHub repository.
3.  **Configure:**
    *   **FrameWork Preset:** Vite (should be auto-detected)
    *   **Root Directory:** `frontend`
4.  **Environment Variables:**
    *   Add `VITE_API_URL`: (Your Render URL from Part 3)
5.  **Deploy:** Click "Deploy". You will get a **Vercel URL** (e.g., `https://zoho-projects.vercel.app`).

---

## Part 5: The "Final Connection" (CORS)

For security, your backend needs to "allow" your frontend.

1.  Go back to **Render** -> your backend service -> **Env Vars**.
2.  Update `FRONTEND_URL` with your actual **Vercel URL**.
3.  Render will automatically restart.

---

### Verification Checklist
- [ ] Backend status on Render is "Live".
- [ ] `VITE_API_URL` on Vercel includes `https://` but **no** trailing slash.
- [ ] MongoDB Atlas "Network Access" includes `0.0.0.0/0`.

Your app is now live! 🚀
