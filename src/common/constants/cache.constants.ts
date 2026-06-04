export const CacheTTL = {
  VERSION: 60 * 60 * 24 * 7,
  PROFILE: 60 * 5,
  SETTINGS: 60 * 10,
  STATS: 60 * 10,
  POST: 60 * 10,
  POSTS_LIST: 60 * 10,
  COMMENT: 60 * 10,
  COMMENTS_LIST: 60 * 10,
  MESSAGES: 60 * 10,
  FOLLOWERS_LIST: 60 * 10 * 24 * 7,
  FOLLOWINGS_LIST: 60 * 10 * 24 * 7,
  FOLLOW_REQUESTS_LIST: 60 * 10 * 24 * 7,
  BLOCK_LIST: 60 * 10,
} as const;

export const MAX_COUNTS = { GROUP_PARTICIPANTS: 1000 } as const;
