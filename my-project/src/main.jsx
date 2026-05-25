import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import ThemeWrapper from "./component/ThemeContext";




ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeWrapper>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeWrapper>
);
