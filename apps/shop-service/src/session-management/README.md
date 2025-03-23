# Session Management

This feature folder includes a basic session management for testing purposes. On the first access
it will auto-generate a random userId and attach it to the session data and store it in-memory.

## Emitted events

The module will emit the following events

```ts
interface UserLoggedInEvent {
  type: "shop-service/session-management/USER_LOGGED_IN";
  userId: string;
}

interface UserLoggedOutEvent {
  type: "shop-service/session-management/USER_LOGGED_OUT";
  userId: string;
}
```
