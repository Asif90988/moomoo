# Trading Dashboard API

## Overview
The Trading Dashboard API provides endpoints to manage and retrieve trading orders and related data.

## Endpoints

### GET /api/trading/orders
- **Description**: Retrieves a list of current trading orders.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "symbol": "string",
      "quantity": number,
      "price": number,
      "status": "open" | "filled" | "cancelled"
    }
  ]
  ```
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:3001/api/trading/orders"
  ```

### POST /api/trading/orders
- **Description**: Creates a new trading order.
- **Request Body**:
  ```json
  {
    "symbol": "string",
    "quantity": number,
    "price": number,
    "side": "buy" | "sell"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "status": "submitted"
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST "http://localhost:3001/api/trading/orders" \
       -H "Content-Type: application/json" \
       -d '{"symbol":"AAPL", "quantity":100, "price":150.0, "side":"buy"}'
