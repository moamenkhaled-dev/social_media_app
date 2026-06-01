export const CacheTTL = {
  VERSION: 60 * 60 * 24 * 7,
  PROFILE: 60 * 5,
  SETTINGS: 60 * 10,
  STATS: 60,
  POST: 60,
  POSTS_LIST: 60,
  COMMENT: 60,
  COMMENTS_LIST: 60,
  MESSAGES: 60,
} as const;

export const MAX_COUNTS = { GROUP_PARTICIPANTS: 1000 } as const;
