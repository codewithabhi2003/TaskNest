import { createContext, useContext, useState, useEffect } from "react";
import type { Workspace } from "@/types";

interface WorkspaceContextType {
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("selectedWorkspace");
    if (stored) {
      setSelectedWorkspace(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    if (selectedWorkspace) {
      localStorage.setItem("selectedWorkspace", JSON.stringify(selectedWorkspace));
    }
  }, [selectedWorkspace]);

  return (
    <WorkspaceContext.Provider value={{ selectedWorkspace, setSelectedWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
};