Feature: Session Management
  As an API consumer
  I want to register and manage a session
  So I can persist my shopping experience

  Scenario: A session is generated when a consumer visits the session endpoint for the first time
    When the consumer visits the session status endpoint
    Then a new session is generated with the configured TTL
    And the response sets an httpOnly cookie with the session identifier
    And the response sets a cookie with a CSRF token
    And a user logged-in event is emitted

  Scenario: A non-expired session is persisted on subsequent visits
    Given a consumer with session credentials
    When the consumer visits the session status endpoint with the session credentials
    Then the previous session is returned

  Scenario: Consumers can close a session
    Given a consumer with session credentials
    When the consumer closes the session
    Then the session cookies are cleared
    And a user logged-out event is emitted
