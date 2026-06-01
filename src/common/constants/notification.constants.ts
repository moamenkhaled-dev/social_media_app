export const NOTIFICATION_LIST_PROJECTION = `
  _id
  title
  body
  notificationType
  isRead
  createdAt
  data.postId
  data.commentId
  data.messageId
  data.username
  data.avatarUrl
` as const;
