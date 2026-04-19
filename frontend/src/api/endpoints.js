/** API origin — set VITE_API_URL in production (e.g. https://api.example.com). */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://3.93.196.160:8000";

export const API_ENDPOINTS = {
  upload: "/data/upload",
  train: "/model/train",
  predict: "/model/predict",
  history: "/model/history",
  modelInfo: "/model/info",
};
