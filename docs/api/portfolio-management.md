# Portfolio Management API

## Overview
The Portfolio Management API provides endpoints to manage and retrieve user portfolios and related financial data.

## Endpoints

### GET /api/portfolio
- **Description**: Fetches the user's portfolio details.
- **Response**:
  ```json
  {
    "id": "string",
    "balance": number,
    "holdings": [
      {
        "symbol": "string",
        "quantity": number,
        "value": number
      }
    ],
    "transactions": [
      {
        "id": "string",
        "symbol": "string",
        "quantity": number,
        "price": number,
        "timestamp": string
      }
    ]
  }
  ```
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:3001/api/portfolio"
  ```

### POST /api/portfolio/deposit
- **Description**: Adds funds to the user's portfolio.
- **Request Body**:
  ```json
  {
    "amount": number
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "newBalance": number
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST "http://localhost:3001/api/portfolio/deposit" \
       -H "Content-Type: application/json" \
       -d '{"amount":5000.0}'
  ```

### POST /api/portfolio/withdraw
- **Description**: Withdraws funds from the user's portfolio.
- **Request Body**:
  ```json
  {
    "amount": number
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "newBalance": number
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST "http://localhost:3001/api/portfolio/withdraw" \
       -H "Content-Type: application/json" \
       -d '{"amount":2500.0}'
