import Prism from 'prismjs';
Prism.highlightAll();

import "./styles/notion-theme/index.scss";
import "./styles/prism-themes/prism-shades-of-purple.css";
import "./styles/app.scss";

import App from "./App.svelte";

const app = new App({
  target: document.querySelector(".super-content-wrapper"),
  anchor: document.querySelector(".super-content"),
});

export default app;
