import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app/App"
import { configureApplication } from "./app/composition/configureApplication"
import "./styles/index.css"

async function startApplication() {
  await configureApplication()

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

void startApplication()
