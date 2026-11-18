import { create } from 'zustand'

type ModalType =
  | 'createUser'
  | 'editUser'
  | 'deleteUser'
  | 'createCourse'
  | 'editCourse'
  | 'deleteCourse'
  | 'createLesson'
  | 'editLesson'
  | 'deleteLesson'
  | 'createQuiz'
  | 'editQuiz'
  | 'deleteQuiz'
  | 'createProject'
  | 'editProject'
  | 'deleteProject'
  | 'createAnnouncement'
  | 'editAnnouncement'
  | 'deleteAnnouncement'
  | 'createEvent'
  | 'editEvent'
  | 'deleteEvent'
  | 'gradeSubmission'
  | 'confirm'

interface ModalState {
  isOpen: boolean
  type: ModalType | null
  data: Record<string, unknown> | null
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Modal
  modal: ModalState
  openModal: (type: ModalType, data?: Record<string, unknown>) => void
  closeModal: () => void

  // Global loading
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void

  // Page title
  pageTitle: string
  setPageTitle: (title: string) => void

  // Active course context
  activeCourseId: number | null
  setActiveCourseId: (id: number | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: false,

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),

  // Modal
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },

  openModal: (type: ModalType, data?: Record<string, unknown>) =>
    set({
      modal: {
        isOpen: true,
        type,
        data: data ?? null,
      },
    }),

  closeModal: () =>
    set({
      modal: {
        isOpen: false,
        type: null,
        data: null,
      },
    }),

  // Global loading
  globalLoading: false,
  setGlobalLoading: (loading: boolean) => set({ globalLoading: loading }),

  // Page title
  pageTitle: 'Dashboard',
  setPageTitle: (title: string) => set({ pageTitle: title }),

  // Active course context
  activeCourseId: null,
  setActiveCourseId: (id: number | null) => set({ activeCourseId: id }),
}))
