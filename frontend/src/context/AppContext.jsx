import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getModelInfo } from "../api/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // uploadedFile: the raw JS File object (only exists in the same session/tab)
  const [uploadedFile, setUploadedFile] = useState(null);

  // lastUploadedName: the filename string persisted from the backend
  // This survives page navigation because it comes from the DB, not React memory
  const [lastUploadedName, setLastUploadedName] = useState(null);
  const [latestRunId, setLatestRunId] = useState(null);
  const [latestDatasetId, setLatestDatasetId] = useState(null);

  // Fetch the latest uploaded dataset name from the backend on mount
  const refreshFromBackend = useCallback(async () => {
    try {
      const res = await getModelInfo();
      if (res?.data?.dataset_file_name) {
        setLastUploadedName(res.data.dataset_file_name);
      }
      if (res?.data?.run_id) {
        setLatestRunId(res.data.run_id);
      }
    } catch {
      // No model yet — that's fine, silence the error
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  return (
    <AppContext.Provider
      value={{
        uploadedFile,
        setUploadedFile,
        lastUploadedName,
        setLastUploadedName,
        latestRunId,
        setLatestRunId,
        latestDatasetId,
        setLatestDatasetId,
        refreshFromBackend,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
