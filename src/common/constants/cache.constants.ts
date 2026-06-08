export const CacheTTL = {
  // rarely changes
  VERSION: 60 * 60 * 24 * 7,

  // user data
  PROFILE: 60 * 5,
  SETTINGS: 60 * 30,
  STATS: 60 * 2,

  // posts
  POST: 60 * 30,
  POSTS_LIST: 60 * 2,

  //comment
  COMMENT: 60 * 5,
  COMMENTS_LIST: 60 * 3,

  // chat
  MESSAGES: 30,

  // social graph
  FOLLOWERS_LIST: 60 * 60,
  FOLLOWINGS_LIST: 60 * 60,
  FOLLOW_REQUESTS_LIST: 60,
  BLOCK_LIST: 60 * 10,

  // moderation
  REPORT: 60 * 30,
  REPORT_LIST: 60,
  MODERATION_CASE: 60 * 30,
  MODERATION_CASE_LIST: 60,

  // stories
  STORY: 60 * 60 * 24,
  STORY_LIST: 60,

  //admin
  BANNED_USERS_LIST: 60 * 5,
} as const;

export const MAX_COUNTS = { GROUP_PARTICIPANTS: 1000 } as const;
