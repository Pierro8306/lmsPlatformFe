export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/token/refresh/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/',
    ME: '/auth/me/',
    CHANGE_PASSWORD: '/auth/change-password/',
  },

  // Users
  USERS: {
    LIST: '/users/',
    DETAIL: (id: number) => `/users/${id}/`,
    CREATE: '/users/',
    UPDATE: (id: number) => `/users/${id}/`,
    DELETE: (id: number) => `/users/${id}/`,
    AVATAR: (id: number) => `/users/${id}/avatar/`,
    GROUPS: '/users/groups/',
    GROUP_DETAIL: (id: number) => `/users/groups/${id}/`,
  },

  // Courses
  COURSES: {
    LIST: '/courses/',
    DETAIL: (id: number) => `/courses/${id}/`,
    CREATE: '/courses/',
    UPDATE: (id: number) => `/courses/${id}/`,
    DELETE: (id: number) => `/courses/${id}/`,
    PUBLISH: (id: number) => `/courses/${id}/publish/`,
    ENROLL: (id: number) => `/courses/${id}/enroll/`,
    MY_COURSES: '/courses/my-courses/',
  },

  // Lessons
  LESSONS: {
    LIST: (courseId: number) => `/courses/${courseId}/lessons/`,
    DETAIL: (courseId: number, lessonId: number) => `/courses/${courseId}/lessons/${lessonId}/`,
    CREATE: (courseId: number) => `/courses/${courseId}/lessons/`,
    UPDATE: (courseId: number, lessonId: number) => `/courses/${courseId}/lessons/${lessonId}/`,
    DELETE: (courseId: number, lessonId: number) => `/courses/${courseId}/lessons/${lessonId}/`,
    REORDER: (courseId: number) => `/courses/${courseId}/lessons/reorder/`,
    ATTACHMENTS: (courseId: number, lessonId: number) => `/courses/${courseId}/lessons/${lessonId}/attachments/`,
    ATTACHMENT_DELETE: (courseId: number, lessonId: number, attachId: number) =>
      `/courses/${courseId}/lessons/${lessonId}/attachments/${attachId}/`,
  },

  // Quizzes
  QUIZZES: {
    LIST: (courseId: number) => `/courses/${courseId}/quizzes/`,
    DETAIL: (courseId: number, quizId: number) => `/courses/${courseId}/quizzes/${quizId}/`,
    CREATE: (courseId: number) => `/courses/${courseId}/quizzes/`,
    UPDATE: (courseId: number, quizId: number) => `/courses/${courseId}/quizzes/${quizId}/`,
    DELETE: (courseId: number, quizId: number) => `/courses/${courseId}/quizzes/${quizId}/`,
    QUESTIONS: (courseId: number, quizId: number) => `/courses/${courseId}/quizzes/${quizId}/questions/`,
    ATTEMPT: (courseId: number, quizId: number) => `/courses/${courseId}/quizzes/${quizId}/attempt/`,
    SUBMIT: (courseId: number, quizId: number, attemptId: number) =>
      `/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}/submit/`,
    RESULTS: (courseId: number, quizId: number) => `/courses/${courseId}/quizzes/${quizId}/results/`,
    MY_RESULTS: (courseId: number, quizId: number) => `/courses/${courseId}/quizzes/${quizId}/my-results/`,
  },

  // Projects
  PROJECTS: {
    LIST: (courseId: number) => `/courses/${courseId}/projects/`,
    DETAIL: (courseId: number, projectId: number) => `/courses/${courseId}/projects/${projectId}/`,
    CREATE: (courseId: number) => `/courses/${courseId}/projects/`,
    UPDATE: (courseId: number, projectId: number) => `/courses/${courseId}/projects/${projectId}/`,
    DELETE: (courseId: number, projectId: number) => `/courses/${courseId}/projects/${projectId}/`,
    SUBMISSIONS: (courseId: number, projectId: number) => `/courses/${courseId}/projects/${projectId}/submissions/`,
    SUBMIT: (courseId: number, projectId: number) => `/courses/${courseId}/projects/${projectId}/submit/`,
    GRADE: (courseId: number, projectId: number, submissionId: number) =>
      `/courses/${courseId}/projects/${projectId}/submissions/${submissionId}/grade/`,
    MY_SUBMISSION: (courseId: number, projectId: number) =>
      `/courses/${courseId}/projects/${projectId}/my-submission/`,
  },

  // Problems (Coding Judge)
  PROBLEMS: {
    LIST: '/problems/',
    DETAIL: (id: string) => `/problems/${id}/`,
    CREATE: '/problems/',
    UPDATE: (id: string) => `/problems/${id}/`,
    DELETE: (id: string) => `/problems/${id}/`,
    TESTCASES: (id: string) => `/problems/${id}/testcases/`,
    TESTCASE_DETAIL: (problemId: string, testCaseId: string) => `/problems/${problemId}/testcases/${testCaseId}/`,
    SUBMISSIONS: (id: string) => `/problems/${id}/submissions/`,
    SUBMISSION_DETAIL: (problemId: string, submissionId: string) => `/problems/${problemId}/submissions/${submissionId}/`,
    RUN: (id: string) => `/problems/${id}/run/`,
    SUBMIT: (id: string) => `/problems/${id}/submit/`,
    MY_SUBMISSIONS: (id: string) => `/problems/${id}/my-submissions/`,
    GRADE_SUBMISSION: (problemId: string, submissionId: string) => `/problems/${problemId}/submissions/${submissionId}/grade/`,
    COMMENTS: (submissionId: string) => `/submissions/${submissionId}/comments/`,
  },

  // Announcements
  ANNOUNCEMENTS: {
    LIST: '/announcements/',
    DETAIL: (id: number) => `/announcements/${id}/`,
    CREATE: '/announcements/',
    UPDATE: (id: number) => `/announcements/${id}/`,
    DELETE: (id: number) => `/announcements/${id}/`,
    PIN: (id: number) => `/announcements/${id}/pin/`,
  },

  // Events
  EVENTS: {
    LIST: '/events/',
    DETAIL: (id: number) => `/events/${id}/`,
    CREATE: '/events/',
    UPDATE: (id: number) => `/events/${id}/`,
    DELETE: (id: number) => `/events/${id}/`,
    PARTICIPANTS: (id: number) => `/events/${id}/participants/`,
    JOIN: (id: number) => `/events/${id}/join/`,
    LEAVE: (id: number) => `/events/${id}/leave/`,
  },
} as const;
