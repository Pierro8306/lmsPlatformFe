export const ENDPOINTS = {
  // Auth & Account
  AUTH: {
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    ME: '/api/common/profile',
    CHANGE_PASSWORD: '/api/common/change-password',
    LOGOUT: '/api/common/logout',
    LOGOUT_ALL: '/api/common/logout-all',
  },

  // Admin Accounts & Groups
  USERS: {
    LIST: '/api/admin/accounts/getAll',
    BY_ROLE: (role: string) => `/api/admin/accounts/getByRole?role=${role}`,
    CREATE: '/api/admin/accounts',
    UPDATE: '/api/admin/accounts',
    DELETE: (id: string | number) => `/api/admin/accounts?IdUser=${id}`,
    GROUPS: '/api/admin/groups',
    GROUP_DETAIL: (groupId: string | number) => `/api/admin/groups/${groupId}`,
    GROUP_MEMBERS: (groupId: string | number) => `/api/admin/groups/${groupId}/members`,
  },

  // Courses (Learning)
  COURSES: {
    // Admin
    LIST: '/api/admin/learning/courses',
    CREATE: '/api/admin/learning/courses',
    UPDATE: (id: string | number) => `/api/admin/learning/courses/${id}`,
    DELETE: (id: string | number) => `/api/admin/learning/courses/${id}`,
    ADD_LESSON: (courseId: string | number, lessonId: string | number) =>
      `/api/admin/learning/courses/${courseId}/lessons/${lessonId}`,
    REMOVE_LESSON: (courseId: string | number, lessonId: string | number) =>
      `/api/admin/learning/courses/${courseId}/lessons/${lessonId}`,

    // Student
    STUDENT_LIST: '/api/student/learning/courses',
    STUDENT_DETAIL: (courseId: string | number) => `/api/student/learning/courses/${courseId}`,
  },

  // Lessons (Learning)
  LESSONS: {
    // Admin
    LIST: (unassigned: boolean = false) => `/api/admin/learning/lessons?unassigned=${unassigned}`,
    CREATE: '/api/admin/learning/lessons',
    UPDATE: (lessonId: string | number) => `/api/admin/learning/lessons/${lessonId}`,
    DELETE: (lessonId: string | number) => `/api/admin/learning/lessons/${lessonId}`,

    // Student
    STUDENT_DETAIL: (lessonId: string | number) => `/api/student/learning/lessons/${lessonId}`,
    COMPLETE: (lessonId: string | number) => `/api/student/learning/lessons/${lessonId}/complete`,
    UNCOMPLETE: (lessonId: string | number) => `/api/student/learning/lessons/${lessonId}/complete`,
  },

  // Quizzes
  QUIZZES: {
    // Admin
    LIST: '/api/admin/quizzes',
    DETAIL: (quizId: string | number) => `/api/admin/quizzes/${quizId}`,
    CREATE: '/api/admin/quizzes',
    UPDATE: (quizId: string | number) => `/api/admin/quizzes/${quizId}`,
    QUESTIONS: (quizId: string | number) => `/api/admin/quizzes/${quizId}/questions`,
    DELETE: (quizId: string | number, force: boolean = false) =>
      `/api/admin/quizzes/${quizId}?force=${force}`,
    RESULTS: (quizId: string | number) => `/api/admin/quizzes/${quizId}/results`,
    EXTRACT_QUESTIONS: '/api/admin/quizzes/extract-questions',

    // Student
    STUDENT_LIST: '/api/student/quizzes',
    START: (quizId: string | number) => `/api/student/quizzes/${quizId}/start`,
    SUBMIT: (quizId: string | number) => `/api/student/quizzes/${quizId}/submit`,
    STUDENT_RESULTS: (quizId: string | number) => `/api/student/quizzes/${quizId}/results`,
  },

  // Projects
  PROJECTS: {
    // Admin
    LIST: '/api/admin/projects',
    DETAIL: (id: string | number) => `/api/admin/projects/${id}`,
    CREATE: '/api/admin/projects',
    UPDATE: (id: string | number) => `/api/admin/projects/${id}`,
    DELETE: (id: string | number) => `/api/admin/projects/${id}`,
    SUBMISSIONS: (id: string | number) => `/api/admin/projects/${id}/submissions`,
    GRADE: (submissionId: string | number) => `/api/admin/projects/submissions/${submissionId}/grade`,

    // Student
    STUDENT_LIST: '/api/student/projects',
    STUDENT_DETAIL: (id: string | number) => `/api/student/projects/${id}`,
    SUBMIT: '/api/student/projects/submit',
    MY_SUBMISSION: (id: string | number) => `/api/student/projects/${id}/submissions/me`,
  },

  // Problems (Coding Judge)
  PROBLEMS: {
    // Admin
    LIST: '/api/admin/problems',
    DETAIL: (id: string) => `/api/admin/problems/${id}`,
    CREATE: '/api/admin/problems',
    UPDATE: (id: string) => `/api/admin/problems/${id}`,
    DELETE: (id: string) => `/api/admin/problems/${id}`,
    TESTCASES: (id: string) => `/api/admin/problems/${id}/tests`,
    TESTCASE_DETAIL: (problemId: string, testCaseId: string) =>
      `/api/admin/problems/${problemId}/tests/${testCaseId}`,
    SUBMISSIONS: (id: string) => `/api/admin/problems/${id}/submissions`,
    SUBMISSION_DETAIL: (problemId: string, submissionId: string) =>
      `/api/admin/problems/${problemId}/submissions/${submissionId}`,

    // Student
    STUDENT_LIST: '/api/student/problems',
    STUDENT_DETAIL: (id: string) => `/api/student/problems/${id}`,
    SUBMIT: '/api/student/problems/submit',
    MY_SUBMISSIONS: (id: string) => `/api/student/problems/${id}/submissions`,
  },

  // Announcements (Communications - Notifications)
  ANNOUNCEMENTS: {
    // Admin
    LIST: '/api/admin/communications/notifications',
    DETAIL: (id: string | number) => `/api/admin/communications/notifications/${id}`,
    CREATE: '/api/admin/communications/notifications',
    UPDATE: (id: string | number) => `/api/admin/communications/notifications/${id}`,
    DELETE: (id: string | number) => `/api/admin/communications/notifications/${id}`,

    // Student
    STUDENT_LIST: '/api/student/communications/notifications',
    STUDENT_DETAIL: (id: string | number) => `/api/student/communications/notifications/${id}`,
  },

  // Events (Communications - Events)
  EVENTS: {
    // Admin
    LIST: '/api/admin/communications/events',
    DETAIL: (id: string | number) => `/api/admin/communications/events/${id}`,
    CREATE: '/api/admin/communications/events',
    UPDATE: (id: string | number) => `/api/admin/communications/events/${id}`,
    DELETE: (id: string | number) => `/api/admin/communications/events/${id}`,
    PARTICIPANTS: (id: string | number) => `/api/admin/communications/events/${id}/members`,

    // Student
    STUDENT_LIST: '/api/student/communications/events',
    STUDENT_DETAIL: (id: string | number) => `/api/student/communications/events/${id}`,
    JOIN: (id: string | number) => `/api/student/communications/events/${id}/join`,
    LEAVE: (id: string | number) => `/api/student/communications/events/${id}/leave`,
  },
} as const;
