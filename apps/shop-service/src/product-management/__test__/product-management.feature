Feature: Session Management
  As an API consumer
  I want to recover product Configurations
  So I can create a shopping expirience that matches our products offerings

  Background:
    Given the default data seed is loaded

  Scenario: Configurations from existing products can be recovered
    When the consumer retrieves the data for the product "Bicycles"
    Then the configuration for "Bicycles" is returned

