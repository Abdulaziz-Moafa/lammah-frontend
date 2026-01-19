import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface Modal {
  id: string;
  component: string;
  props?: Record<string, unknown>;
}

interface UIState {
  // Toast notifications
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;

  // Modal management
  modals: Modal[];
  openModal: (component: string, props?: Record<string, unknown>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // TV Mode (large screen)
  isTVMode: boolean;
  setTVMode: (enabled: boolean) => void;

  // Sidebar (for admin)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Connection status
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

let toastId = 0;
let modalId = 0;

export const useUIStore = create<UIState>()((set) => ({
  // Toast state
  toasts: [],
  addToast: (type, message, duration = 5000) => {
    const id = `toast-${++toastId}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Modal state
  modals: [],
  openModal: (component, props) => {
    const id = `modal-${++modalId}`;
    set((state) => ({
      modals: [...state.modals, { id, component, props }],
    }));
    return id;
  },
  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    })),
  closeAllModals: () =>
    set({ modals: [] }),

  // Loading state
  globalLoading: false,
  loadingMessage: null,
  setGlobalLoading: (loading, message) =>
    set({
      globalLoading: loading,
      loadingMessage: loading ? (message ?? null) : null,
    }),

  // TV Mode
  isTVMode: false,
  setTVMode: (enabled) =>
    set({ isTVMode: enabled }),

  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Connection
  isOnline: true,
  setOnline: (online) =>
    set({ isOnline: online }),
  wsConnected: false,
  setWsConnected: (connected) =>
    set({ wsConnected: connected }),
}));
