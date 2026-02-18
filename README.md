# 🌍 Pollution Regime Detection System

A machine learning system that detects **hidden pollution regimes** from air-quality time-series data using **Hidden Markov Models (HMM)** and presents insights through a web dashboard.

---

## 📌 Project Overview

This project analyzes pollution data (PM2.5, PM10, NO2, CO, etc.) to identify **pollution regimes** — stable patterns like Low, Moderate, or Hazardous pollution.

Instead of simple AQI thresholds, this system uses **HMM to learn patterns and transitions over time**, making predictions more time-aware and data-driven.

---

## 🧠 Core Idea

- Pollution levels follow patterns over time  
- These patterns are treated as **hidden states (regimes)**  
- HMM learns:
  - Transition probabilities  
  - Emission probabilities  
  - Most likely regime sequence  

---

## 🏗️ System Architecture

### Architecture Diagram 1
![System Architecture 1](https://github.com/user-attachments/assets/60bcceb6-847f-401b-b77c-8b29ae547861)

### Architecture Diagram 2
![System Architecture 2](https://github.com/user-attachments/assets/f59d5180-cb59-4b9e-a057-a931002fba26)

### Architecture Diagram 3
![System Architecture 3](https://github.com/user-attachments/assets/62d9e740-08a7-4d22-a04a-54d8eadd2eac)

---

## ⚙️ Tech Stack

**Backend**
- Python
- FastAPI
- hmmlearn
- Pandas, NumPy

**Frontend**
- React / Streamlit

**Database**
- MongoDB / PostgreSQL

---

## 🔄 Pipeline


