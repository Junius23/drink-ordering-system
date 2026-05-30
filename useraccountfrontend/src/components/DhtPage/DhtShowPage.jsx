import axios from 'axios';
import React, { useEffect, useState } from 'react'
import './DhtShowPage.css'
import BASE_URL from '../../cors/config';

const DhtShowPage = () => {
  const [temp, setTemp] = useState("--");
  const [humidity, setHumidity] = useState("--");

    // ⭐ 讀取溫度 / 濕度
  const loadSensor = () => {
    axios.get(`${BASE_URL}/iot/sensor`)
      .then(res => {
        setTemp(res.data.temp);
        setHumidity(res.data.humidity);
      })
      .catch(() => {
        setTemp("--");
        setHumidity("--");
      });
  };
    
  // ⭐ 自動每 3 秒讀取一次感測器
  useEffect(() => {
    loadSensor();
    const timer = setInterval(loadSensor, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dht-page">
      <h2 className="dht-title">DHT11 溫濕度感測器</h2>

      <div className="dht-cards">

        <div className="dht-card temp-card">
          <span className="icon">🌡</span>
          <p className="value">{temp}°C</p>
          <p className="label">溫度</p>
        </div>

        <div className="dht-card humidity-card">
          <span className="icon">💧</span>
          <p className="value">{humidity}%</p>
          <p className="label">濕度</p>
        </div>

      </div>
    </div>
  )
}

export default DhtShowPage
