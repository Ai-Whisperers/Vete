# Adris Veterinaria - Testing & Setup Guide

Welcome! This guide will help you get the Adris Veterinaria web application up and running on your local machine for testing.

## Prerequisites

Before you begin, ensure you have **Node.js** installed on your computer.

- **Download Node.js:** [https://nodejs.org/](https://nodejs.org/) (LTS version recommended)
- To verify installation, open a terminal (Command Prompt or PowerShell) and run:
  ```bash
  node -v
  npm -v
  ```

## Quick Start (Automated)

We have provided a script to automate the setup process.

1.  Navigate to the root folder of this project (where this file is located).
2.  Double-click on the file named **`install_and_run.bat`**.

This script will automatically:

- Navigate to the `web` application folder.
- Install all necessary dependencies (`npm install`).
- Application will build/prepare.
- Start the local development server.
- Open your default web browser to [http://localhost:3000/adris](http://localhost:3000/adris).

> **Note:** The first time you run this, it may take a few minutes to install dependencies.

## Manual Setup

If you prefer to run things manually or if the script encounters an issue, follow these steps:

1.  **Open Terminal:** Open Command Prompt or PowerShell.
2.  **Navigate to Project Directory:**
    ```bash
    cd path\to\this\folder\web
    ```
    _(Make sure you are inside the `web` folder)_
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Start the Server:**
    ```bash
    npm run dev
    ```
5.  **Open Browser:**
    Open Chrome or your preferred browser and go to:
    [http://localhost:3000/adris](http://localhost:3000/adris)

## Troubleshooting

- **"npm" is not recognized:** Ensure Node.js is installed and added to your system PATH. You may need to restart your computer after installing Node.js.
- **Port 3000 is in use:** If the terminal says the port is busy, you might have another instance running. Close other Node.js windows or let Next.js pick a different port (check the terminal output for the new URL).
