# Thejaswin P | Digital Infrastructure Engineer Portfolio

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vite](https://img.shields.io/badge/built%20with-Vite-646CFF.svg)
![GSAP](https://img.shields.io/badge/animations-GSAP-88CE02.svg)

A high-performance, interactive portfolio website designed to showcase engineering skills, projects, and professional experience. This project features a custom-built particle physics engine, real-time API integrations, and a modern, responsive design optimized for performance.

## 🚀 Features

- **Custom Particle Physics Engine**: A canvas-based text assembly effect that dynamically forms the hero text from particles, featuring mouse interaction and fluid dispersion logic.
- **Real-time GitHub Stats**: Fetches live data for repositories and contributions using the GitHub API, with graceful fallbacks.
- **Interactive UI**:
  - **3D Tilt Effects**: Powered by `vanilla-tilt.js` for project cards.
  - **Custom Cursor**: A lag-free cursor follower for desktop interaction.
  - **Scroll Animations**: Smooth reveal animations using GSAP ScrollTrigger.
- **Responsive Design**: customized experiences for mobile (Typewriter effect) and desktop (Particle effect).
- **Performance Optimized**: Built with Vite for lightning-fast HMR and production builds.

## 🛠️ Tech Stack

- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Animations**: [GSAP (GreenSock)](https://greensock.com/gsap/)
- **Physics/Effects**: HTML5 Canvas API, [Vanilla-tilt.js](https://micku7zu.github.io/vanilla-tilt.js/)
- **Fonts**: Inter & Space Grotesk (Google Fonts)

## 📦 Installation & Setup

To run this project locally, ensure you have **Node.js** (v14+ recommended) installed.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/gigacat-25/Portfolio-website.git
    cd Portfolio-website
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```
    The site will be available at `http://localhost:5173`.

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```

This will generate a `dist` folder containing the minified HTML, CSS, and JavaScript files ready for deployment.

## 🤝 Forking & Customization

Want to use this template for your own portfolio?

1.  **Fork this repository** by clicking the "Fork" button in the top right corner of the GitHub page.
2.  **Update Content**:
    - Modify `index.html` to update your name, links, experience, and projects.
    - The **GitHub Stats** in `src/main.js` are fetched for the user `gigacat-25`. Search for this username in `src/main.js` and replace it with your own GitHub username.
    - Update `src/style.css` for any color theme changes.
3.  **Deploy** your forked version.

## 🌐 Deployment

This project is static and can be deployed easily on any static site host.

### Netlify
1.  Connect your GitHub repository to Netlify.
2.  Set the **Build Command** to `npm run build`.
3.  Set the **Publish Directory** to `dist`.
4.  Click **Deploy**.

### Vercel
1.  Import your GitHub repository to Vercel.
2.  Vercel will likely auto-detect Vite. Ensure:
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
3.  Click **Deploy**.

### GitHub Pages
You can deploy using a GitHub Action or by pushing the `dist` folder to a `gh-pages` branch. The easiest way is using a deploy script:

1.  Update `vite.config.js` to set the base path if you are not deploying to a custom domain (e.g., `base: '/repo-name/'`).
2.  Build and deploy contents of `dist`.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Developed by [Thejaswin P](https://github.com/gigacat-25)**
