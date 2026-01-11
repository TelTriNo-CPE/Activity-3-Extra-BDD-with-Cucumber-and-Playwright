Feature: Add/Remove items in cart

  # Happy path
  Scenario: Add one item to cart successfully
    Given the user is logged in as "standard_user"
    And the user is on the product page
    When the user adds "Sauce Labs Backpack" to the cart
    Then the cart should show 1 item
    And "Sauce Labs Backpack" should be shown in the cart

  # Happy path
  Scenario: Add two items then remove one successfully
    Given the user is logged in as "standard_user"
    And the user is on the product page
    When the user adds "Sauce Labs Backpack" to the cart
    And the user adds "Sauce Labs Bike Light" to the cart
    Then the cart should show 2 items
    When the user removes "Sauce Labs Bike Light" from the cart
    Then the cart should show 1 item
    And "Sauce Labs Backpack" should be shown in the cart
    And "Sauce Labs Bike Light" should not be shown in the cart

  # Negative path
  Scenario: Removing an item that is not in the cart should not change the cart
    Given the user is logged in as "standard_user"
    And the user is on the product page
    When the user adds "Sauce Labs Backpack" to the cart
    Then the cart should show 1 item
    When the user tries to remove "Sauce Labs Bike Light" from the cart
    Then the cart should still show 1 item
    And "Sauce Labs Backpack" should be shown in the cart

  # Edge/exception flow
  Scenario: Remove item from cart and continue shopping
    Given the user is logged in as "standard_user"
    And the user is on the product page
    When the user adds "Sauce Labs Backpack" to the cart
    Then the cart should show 1 item
    When the user opens the cart
    And the user removes "Sauce Labs Backpack" from the cart
    Then the cart should be empty
    When the user continues shopping
    Then the product page should be displayed
    And the user should be able to add "Sauce Labs Backpack" to the cart again
