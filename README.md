# Gearbox Costing App Prototype

This is a static, GitHub Pages-friendly prototype for testing the costing app workflow:

1. Machine Rates
2. BOM Upload
3. Make/Buy Review
4. Routing Builder
5. Cost Summary

## How to test locally

Option 1: open `index.html` directly in a browser.

Option 2: run a simple local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How to put it on GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions**.
5. The included workflow will publish the static app.

## Important notes

- This is a front-end prototype only.
- Data is saved in browser `localStorage`, not a real database yet.
- It is good for testing workflow, screen layout, and terminology.
- The next real build should add a database, user accounts, file upload parsing, and saved projects.
