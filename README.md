# 🚀 CodeVizAi2026 – React + FastAPI Echo App

A minimal full-stack web app using **React (Vite + Tailwind CSS)** for the frontend and **FastAPI** for the backend. This project demonstrates simple API communication by sending and receiving echoed messages.

---

## 📁 Project Structure

```
CodVizAi2026/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── .gitignore
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── .gitignore
└── README.md
```

---

## 🧰 Prerequisites

Make sure the following are installed on your machine:

- **Python 3.10+**
- **Node.js 18+**
- **npm** or **yarn**
- **Git**
- [Optional] **VS Code** with the Python extension

---

## 🔧 Backend Setup (FastAPI)

### 1. Navigate to the backend folder:

```bash
cd backend
```

### 2. Create & activate a virtual environment:

> 💡 **TIP (VS Code Users):**  
> Open `backend/` in VS Code and press `Ctrl+Shift+P` → `Python: Select Interpreter`  
> to auto-create and select a Python environment.
> #### To Active VS Code Generated Virtual environment

 ```bash
# windows
.venv\Scripts\activate

# macOs
source .venv/bin/activate
```

# Manuallay Create & Activate Virtual environment

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install backend dependencies:

```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI server:

```bash
uvicorn main:app --reload
```

- The backend will run at: [http://localhost:8000](http://localhost:8000)

---

## 🌐 Frontend Setup (React + Vite + Tailwind CSS)

### 1. Navigate to the frontend folder:

```bash
cd frontend
```

### 2. Install frontend dependencies:

```bash
npm install
# or
yarn install
```

### 3. Start the React development server:

```bash
npm run dev
# or
yarn dev
```

- The frontend will run at: [http://localhost:3000](http://localhost:3000)

---

## 🔁 Test the App

1. Enter a message in the input box.
2. Click **Send**.
3. You will see the echoed message from the FastAPI backend.

---

## 🛡️ .env & .gitignore

- Store environment variables in the `backend/.env` file.
- Make sure `.env` is ignored by Git using the backend's `.gitignore`.

```gitignore
# backend/.gitignore
venv/
__pycache__/
.env
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch:  
   `git checkout -b feature/your-feature-name`
3. Commit your changes:  
   `git commit -m "Add feature"`
4. Push to the branch:  
   `git push origin feature/your-feature-name`
5. Open a Pull Request 🚀

---

## 📄 License

This project is licensed under the MIT License.
