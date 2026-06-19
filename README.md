# Medicare Hospital Management System

This repository contains the complete source code for the **Medicare Hospital Management System**. The project is divided into two distinct parts: a **Spring Boot** backend and a **Vite + React** frontend. 

Both projects are already perfectly organized to be run locally using your preferred IDEs like **VS Code** and **IntelliJ / Eclipse / Spring Tool Suite**.

---

## 🏥 1. Running the Backend (Spring Boot)

The backend provides the RESTful API and connects to a MySQL database. It runs on **port 8081**.

### Prerequisites:
1. Java 17 or higher installed.
2. MySQL Server running locally.

### Database Setup:
1. Open your MySQL client (e.g., MySQL Workbench or Command Line).
2. The application will automatically create the database `hospital_db` and all required tables when it starts. Ensure your root user credentials match the ones in `hospital-backend/src/main/resources/application.properties` (username: `root`, password: `root`). Change them if your local MySQL setup uses a different password.

### Running via Terminal/Command Prompt:
1. Open a terminal.
2. Navigate to the backend directory:
   ```bash
   cd hospital-backend
   ```
3. Run the application using the Maven wrapper:
   - **Windows:** `.\mvnw spring-boot:run`
   - **Mac/Linux:** `./mvnw spring-boot:run`

### Running via IDE (IntelliJ / Eclipse / STS):
1. Open your IDE.
2. Select **File > Open** or **Import Project**.
3. Select the `hospital-backend` folder (make sure to select the folder containing the `pom.xml` file).
4. The IDE will recognize it as a Maven project and download the dependencies.
5. Locate `HospitalApplication.java` in `src/main/java/com/hospital/` and click the **Run** or **Play** button.

---

## 💻 2. Running the Frontend (Vite + React)

The frontend is a modern React application built with Vite and Tailwind CSS. It connects to the backend API automatically.

### Prerequisites:
1. **Node.js** (v18 or higher) installed on your computer.

### Running via VS Code:
1. Open **Visual Studio Code**.
2. Go to **File > Open Folder...** and select the `hospital-frontend` folder.
3. Open the integrated terminal in VS Code (`Ctrl + ~` or `Terminal > New Terminal`).
4. Install the required Node.js dependencies (you only need to do this once):
   ```bash
   npm install
   ```
5. Start the Vite development server:
   ```bash
   npm run dev
   ```
6. The terminal will show a local URL (usually `http://localhost:5173/` or `http://localhost:5174/`). `Ctrl + Click` the link to open the application in your browser.

---

## 🔑 Test Credentials

Once both servers are running, open the frontend URL in your browser. The system will automatically create an Admin account on the very first backend startup.

**Admin Login:**
- **Username:** `admin`
- **Password:** `admin123`

From the Admin Dashboard, you can manage the hospital, or you can register new Doctor and Patient accounts from the main login screen.
