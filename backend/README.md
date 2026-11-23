# Chat Live Backend

REST API + real-time messaging backend built with Node.js, Express 5, MongoDB/Mongoose and Socket.IO. CommonJS modules are used. AI, SMS OTP, Redis and microservices are intentionally out of scope.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in MongoDB, JWT, SMTP and Cloudinary values
npm run dev
```

Node.js 20+ recommended. The server refuses to start without JWT_SECRET and connects to MongoDB before listening.

## Environment

See `.env.example`. Never commit `.env` or real credentials. Email verification and password reset use SMTP email OTP only. OTP values are hashed, expire after 10 minutes, have a maximum of five attempts, and resend is throttled to one minute.

## API base

Base path: `/api/v1`. Health: `GET /api/v1/health`. Protected endpoints accept `Authorization: Bearer <access-token>` (the middleware also accepts the raw JWT for compatibility).

### Authentication

| Method | Endpoint | Auth |
|---|---|---|
| POST | /auth/register | No |
| POST | /auth/verify-email | No |
| POST | /auth/resend-verification | No |
| POST | /auth/login | No |
| POST | /auth/forgot-password | No |
| POST | /auth/reset-password | No |

Register body: `{firstName,lastName,email,phone,password,username}`. Verify/reset body includes `email,code`; reset also includes `password`. Login uses `email,password`.

### Users, contacts and blocks

- GET /users/me, GET /users/search?q=, PATCH /users/me, PATCH /users/me/privacy
- GET /contacts, POST /contacts {userId,nickname?}, PATCH /contacts/:id, DELETE /contacts/:id
- GET /blocks, POST /blocks {userId}, DELETE /blocks/:userId

### Conversations, messages and groups

- GET /conversations; POST /conversations/private {userId}
- GET /conversations/:id/messages?page=1&limit=30; POST /conversations/:id/messages
- PATCH /conversations/:id/messages/:messageId (text edit)
- DELETE /conversations/:id/messages/:messageId with optional `{forEveryone:true}`; otherwise delete-for-me
- POST /conversations/:id/messages/:messageId/reactions {emoji}; POST /conversations/:id/read {messageId}
- POST /groups {name,description?,memberIds}; GET /groups/:id/members; POST /groups/:id/members {memberIds}; POST /groups/:id/leave; DELETE /groups/:id (admin only)

Group read receipts are not implemented. Read position is stored per membership. Group deletion is admin-only; members can leave. Rejoining an existing member record reactivates it.

### Media, stories and notifications

- POST /media multipart field `file` (20 MB limit); upload uses Cloudinary and returns media metadata.
- GET/POST /stories; POST /stories/:id/view; DELETE /stories/:id. Stories expire after 24 hours and visibility supports everyone/contacts/selected.
- GET /notifications; PATCH /notifications/read-all

### Socket.IO

Connect with Socket.IO and pass `auth: { token: accessToken }`. Authenticated sockets join the user's room and active conversation rooms. Events: `message:send` (ack callback), `message:new`, `typing:start`, `typing:stop`. The REST message endpoint remains available. For multi-instance deployment, a shared Socket.IO adapter would be needed later; it is not included in this version.

## Models

Existing models are retained in `src/modules`: users, OTP, linked devices, contacts, blocks, conversations, conversation members, messages, stories, story views and notifications. `dbConversion.js` remains as a compatibility alias for the legacy collection naming.

## Security and implementation notes

- Passwords and OTPs are hashed; password reset explicitly hashes before query update.
- Protected actions check authenticated membership and ownership.
- User response helper avoids exposing password/OTP/token hashes and hides phone unless the account privacy flag is enabled.
- Uploads are memory-buffered with a 20 MB limit and Cloudinary storage.
- CORS origins are configured with CORS_ORIGIN or CLIENT_URL (comma-separated).
- Set HTTPS and a strict production CORS allowlist in deployment.

## Known limitations to finish before production

This branch contains the first integrated backend implementation, but it has not yet been run against your MongoDB/SMTP/Cloudinary accounts or exercised with integration tests. Linked-device QR pairing and refresh-token rotation are not yet implemented; group invites/role promotion, per-device sessions, message delivery acknowledgements, story-viewer listing, per-notification read, and comprehensive schema/request validation also remain to be completed. Add integration tests and regenerate package-lock with `npm install` after dependency changes. Do not use this as a production deployment until those checks are completed.
