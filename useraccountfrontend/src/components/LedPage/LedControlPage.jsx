import axios from "axios";
import { useState } from "react";
import "./LedControlPage.css";
import BASE_URL from "../../cors/config";

export default function LedControl() {
  const [status, setStatus] = useState("OFF");

  const setLed = (state) => {
    axios
      .post(`${BASE_URL}/iot/led`, { state })
      .then(() => setStatus(state.toUpperCase()))
      .catch(() => alert("ESP32 未連線"));
  };

  return (
  <div className="led-page-bg">
    <div className="led-panel">
      <h2>遠距開燈</h2>

      <div className={`led-status ${status === "ON" ? "on" : "off"}`}>
        狀態：{status}
      </div>

      <button className="btn-on" onClick={() => setLed("on")}>
        開燈
      </button>

      <button className="btn-off" onClick={() => setLed("off")}>
        關燈
      </button>
    </div>
  </div>
);
}
