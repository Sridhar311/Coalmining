# 🛑 LoRa-Based Smart Helmet for Coal Mine Workers

# 📌 Overview

This project is an **IoT-based safety system** designed to monitor hazardous gas levels in underground coal mines. It uses gas sensors to detect harmful gases and alerts both the worker and a remote monitoring station using **LoRa communication**.

The system ensures **real-time safety monitoring** where traditional communication methods like Wi-Fi or cellular networks are unreliable.


# 🎯 Objective

* Detect dangerous gases like methane, LPG, and smoke
* Provide **instant alerts** to workers
* Transmit data wirelessly using **LoRa**
* Display real-time data on a **web dashboard**


# 🏗️ System Architecture

[MQ2 + MQ6 Sensors]
        ↓
     Arduino
        ↓
 Local Alert (Buzzer + LED + LCD)
        ↓
     LoRa Module (RFM95)
        ↓
   LoRa Receiver Node
        ↓
   Backend (Node.js)
        ↓
   Frontend Dashboard (React)

# 🔧 Hardware Components

* Arduino Uno / Nano
* MQ2 Gas Sensor (Smoke, Methane, CO)
* MQ6 Gas Sensor (LPG, Butane)
* RFM95 LoRa Module
* Buzzer
* LED
* I2C LCD Display
* Power Supply (Battery)


# 💻 Software Stack

# Frontend

* React.js
* HTML, CSS, JavaScript

# Backend

* Node.js
* Express.js

# Communication

* Raw LoRa (Point-to-Point)

# ⚙️ Features

* 🚨 Real-time gas detection
* 🔔 Immediate local alerts (buzzer + LED)
* 📡 Long-range wireless communication using LoRa
* 📊 Live dashboard monitoring
* 🔄 Near real-time updates using polling
* 🧑‍🏭 Scalable for multiple workers

# 🔄 Data Flow

1. Sensors detect gas levels
2. Arduino processes data
3. If threshold exceeds → buzzer & LED ON
4. Data transmitted via LoRa
5. Receiver sends data to backend
6. Backend exposes API
7. React dashboard fetches data periodically
8. UI updates with latest readings

# 🌐 Real-Time Update Mechanism

* Implemented using **polling**
* React frontend calls backend API every few seconds
* Updates UI dynamically using state (`useState`, `useEffect`)

# 📦 Database

* ❌ Not used in current prototype (single device, real-time focus)
* ✅ Future scope: Integration with **MongoDB** for:

  * Storing historical data
  * Trend analysis
  * Reporting

# 🚀 Future Enhancements

* Add **database (MongoDB)** for analytics
* Use **WebSockets** for real-time updates
* Integrate **GPS tracking** for worker location
* Deploy on **cloud platforms**
* Add more sensors (temperature, humidity, oxygen levels)


# ⚠️ Challenges Faced

* Handling real-time data updates efficiently
* Sensor calibration and noise handling
* Ensuring reliable communication in constrained environments


# 📌 Conclusion

This project demonstrates how **IoT + LoRa communication** can be used to improve worker safety in hazardous environments like coal mines. It provides a **scalable and cost-effective solution** for real-time monitoring and alerting.

