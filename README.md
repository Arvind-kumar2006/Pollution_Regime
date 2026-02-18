# 🌍 AetherScan — Pollution Regime Detection System

AetherScan is a machine learning–powered web application that detects **hidden pollution regimes** from air-quality time-series data using **Hidden Markov Models (HMM)** and presents insights through an interactive dashboard.

---

## 📌 Project Overview

AetherScan analyzes pollution data (PM2.5, PM10, NO₂, CO, etc.) to identify **pollution regimes** — stable air-quality patterns such as Low, Moderate, Unhealthy, or Hazardous.

Unlike traditional AQI threshold systems, AetherScan uses **Hidden Markov Models (HMMs)** to learn temporal patterns and transitions in pollution data. This makes predictions:

- Time-aware  
- Pattern-driven  
- More realistic for real-world pollution behavior  

---

## 🧠 Core Idea

- Pollution evolves in patterns over time  
- These patterns are modeled as **hidden states (regimes)**  
- HMM learns:
  - Transition probabilities  
  - Emission probabilities  
  - Most likely regime sequences  

This allows the system to detect regime shifts and stability periods.

---

## 🏗️ System Architecture

### Architecture Diagram 1
![System Architecture 1](https://github.com/user-attachments/assets/60bcceb6-847f-401b-b77c-8b29ae547861)

### Architecture Diagram 2
![System Architecture 2](https://github.com/user-attachments/assets/f59d5180-cb59-4b9e-a057-a931002fba26)

### Architecture Diagram 3
![System Architecture 3](https://github.com/user-attachments/assets/62d9e740-08a7-4d22-a04a-54d8eadd2eac)

---

# 🎨 AetherScan UI (Figma Wireframes)

## 📊 Dashboard — “AirSense”
Displays real-time pollution trends and regime insights.

![Dashboard](https://github.com/user-attachments/assets/056a8055-bc8e-46ff-b11f-fa850a16a23b)

**Key Features**
- PM2.5 trend chart  
- Current regime display  
- AQI indicators  
- Confidence score  
- API connection status  

---

## 📥 Model Input / Data Upload — “DataFlow”
Interface for dataset upload and HMM configuration.

![Model Input](https://github.com/user-attachments/assets/0c2ca3d6-e7d3-47d3-b901-4f91a98f3241)

**Key Features**
- CSV/JSON upload  
- Hidden state slider (N)  
- Covariance selection  
- Train & classify trigger  

---

## 📈 Prediction & Analytics — “Quantalytics”
Deep model insights and regime statistics.

![Analytics](https://github.com/user-attachments/assets/2dd82089-2797-41ce-ac69-c5618b1247d2)

**Key Features**
- Transition probability heatmap  
- Regime mean & variance table  
- Manual inference tool  

---

## 🗂️ History & Logs
Track previous model runs and performance.

![History](https://github.com/user-attachments/assets/45ee7a2b-38bd-45e4-b9b4-b8b00d37e380)

**Key Features**
- Dataset history  
- Log-likelihood scores  
- Re-run and export options  

---

## ⚙️ Tech Stack

### Backend
- Python  
- FastAPI  
- hmmlearn  
- Pandas  
- NumPy  

### Frontend
- React / Streamlit  

### Database
- MongoDB / PostgreSQL  

---

## 🔄 ML Pipeline
