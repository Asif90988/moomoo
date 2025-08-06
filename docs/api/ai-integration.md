# AI Integration API

## Overview
The AI Integration API provides endpoints to interact with AI-generated market insights and thoughts.

## Endpoints

### GET /api/ai/thoughts
- **Description**: Retrieves AI-generated market thoughts.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "text": "string",
      "confidence": number,
      "timestamp": string
    }
  ]
  ```
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:3001/api/ai/thoughts"
  ```

### POST /api/ai/generate-thought
- **Description**: Generates a new AI thought based on provided parameters.
- **Request Body**:
  ```json
  {
    "market": "string",
    "timeframe": "short" | "medium" | "long"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "text": "string",
    "confidence": number,
    "timestamp": string
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST "http://localhost:3001/api/ai/generate-thought" \
       -H "Content-Type: application/json" \
       -d '{"market":"NASDAQ", "timeframe":"medium"}'
