# Adris Veterinaria - Comprehensive Onboarding Guide

This guide is divided into two parts:

1.  **IT Setup:** Use this if you are setting up a fresh computer to _run_ the software.
2.  **Clinic Onboarding:** Use this if you want to _add a new clinic_ to the platform.

---

# Part 1: IT Setup (Fresh Laptop)

Follow these steps if you have a brand new Windows laptop and want to run the Adris Veterinaria web application.

## Step 1: Install Node.js

This software is built on "Node.js". You cannot run it without this.

1.  Open your web browser (Chrome, Edge, etc.).
2.  Go to: [https://nodejs.org/](https://nodejs.org/)
3.  Click the big green button that says **"LTS Recommended For Most Users"** (e.g., v20.x or v22.x).
4.  Download the installer file (`.msi`).
5.  Run the installer and click **Next** -> **I accept** -> **Next** -> **Next** ... -> **Install**.
6.  **IMPORTANT:** When it finishes, you might need to **restart your computer** for the changes to take effect.

## Step 2: Run the Application

We made this part easy.

1.  Open the folder containing this project.
2.  Look for a file named **`install_and_run.bat`** (it might just show as `install_and_run`).
3.  **Double-click it.**

A black window (terminal) will appear. It will:

- Check if you installed Node.js (from Step 1).
- Download all the necessary programming libraries ("dependencies"). This takes a few minutes the first time.
- Start the server.
- Automatically open the website: [http://localhost:3000/adris](http://localhost:3000/adris)

**That's it!** Leave the black window open while using the site. Closing it stops the server.

---

# Part 2: Clinic Onboarding Guide

This system supports multiple clinics. Each clinic has its own URL and customized content (colors, logo, text).

## Structure

All data lives in the `web/content_data` folder.

- `web/content_data/adris` -> http://localhost:3000/adris
- `web/content_data/petlife` -> http://localhost:3000/petlife

## How to Add a New Clinic

### 1. Create the Folder

1.  Go to `web\content_data`.
2.  Create a **new folder**. The name of this folder will be the URL.
    - _Example:_ If you name it `supervet`, the URL will be `http://localhost:3000/supervet`.

### 2. Copy Templates

1.  We have provided a template folder at `web\content_data\_TEMPLATE` (if it exists) or you can copy the contents of an existing clinic (like `adris`).
2.  **Copy** all the `.json` files from `adris` or `_TEMPLATE`.
3.  **Paste** them into your new `supervet` folder.

### 3. Customize the JSON Files

Open these files with a text editor (Notepad, VS Code, etc.) and change the values.

- **`config.json`**: General info.
  - `name`: The name of the clinic.
  - `contact`: Phone, email, address.
  - `branding`: URLs for logos.
- **`theme.json`**: The color scheme.
  - Change hex codes (e.g., `#FF5733`) to match the clinic's brand.
- **`home.json`**: Content for the homepage (Hero title, features, banner).
- **`services.json`**: List of services offered and prices.
- **`about.json`**: "About Us" text and team members.
- **`testimonials.json`**: Reviews.
- **`faq.json`**: Frequently asked questions.
- **`legal.json`**: Privacy policy text.

### 4. Test It

1.  Make sure the server is running (Step 2 above).
2.  Go to `http://localhost:3000/supervet` (or whatever name you chose).
3.  You should see the new clinic with your custom data!

---

## Troubleshooting

- **"Port 3000 is in use"**: Only one instance can run at a time. Close any other black terminal windows running the server.
- **Changes not showing up?**: Refresh the page. If `config.json` changes don't appear, you might need to stop the server (Ctrl+C in the black window) and run `install_and_run.bat` again.
