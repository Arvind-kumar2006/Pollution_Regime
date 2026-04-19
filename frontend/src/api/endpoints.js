/** API origin — proxied through Vercel rewrites in production (/api → EC2). */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const API_ENDPOINTS = {
  upload: "/data/upload",
  train: "/model/train",
  predict: "/model/predict",
  history: "/model/history",
  modelInfo: "/model/info",
};
