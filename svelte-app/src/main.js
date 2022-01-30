import "./app.css";
import "./styles/notion-theme.scss";
import App from "./App.svelte";
import fitty from "fitty";

const app = new App({
  target: document.querySelector("#svelte-app"),
});

setTimeout(() => {
  fitty('.notion-header__title', {
    minSize: 32,
    maxSize: 256,
  });
  fitty('h1.notion-heading .notion-semantic-string', {
    minSize: 18,
    maxSize: 128,
  })
}, 200);

export default app;
