# Fastway Tech Assessment (SOP)

## Overview

This application allows users to:

- **Track** a parcel using a Fastway tracking number
- **Get a shipping quote** by providing destination and parcel details

The system communicates with the official Fastway Couriers South Africa API.

---

## Accessing the Application

Open a web browser and navigate to:

```
https://app.url
```

OR

```
http://localhost:8080
```

*(If running locally via Docker)*

---

## Navigation

| Page  | URL Path | Purpose                         |
|-------|----------|---------------------------------|
| Home  | `/`      | Dashboard and overview          |
| Track | `/track` | Parcel tracking                 |
| Quote | `/quote` | Shipping quote calculator       |

The application is fully **mobile-responsive** and works on phones, tablets, and desktops.

---

## Feature 1 — Track a Parcel

### Steps

1. Click **"Track Parcel"** in the navigation bar or select the **"Track a Parcel"** card on the home page.
2. Enter your tracking number in the **Tracking Number** field:
   - Format: alphanumeric (e.g. `Z60000983328`)
   - Length: 8–30 characters
3. Click **"Track Parcel"**
4. Review the results:

### Results Overview

- **Status Badge** — Current parcel status (Delivered, In Transit, Pending)
- **Info Grid** — Origin, destination, courier, weight, service type
- **Estimated Delivery** — Displayed if available
- **Scan History** — Full chronological tracking timeline

---

## Feature 2 — Get a Shipping Quote

### Steps

1. Click **"Get a Quote"** in the navigation bar or select the **"Shipping Quote"** card
2. Complete the form:

| Field                         | Description                              | Example        |
|------------------------------|------------------------------------------|----------------|
| Destination Suburb           | Autofilled suburb name                   | `Sandton`      |
| Postal Code                  | 4-digit SA postal code                   | `2196`         |
| Parcel Weight (kg)           | Weight in kg (0.1–500)                   | `2.5`          |
| Parcel Dimensions (optional) | Length × Width × Height in cm            | `30 x 30 x 30` |

> **Note:** RFCode is automatically set to **JNB** (Johannesburg)

3. Click **"Calculate Quote"**
4. Review results:

### Results Overview

- **Best Available Rate** — Highlighted
- **All Services** — List of available delivery options with pricing and timeframes

---

# API Specification

## Base URL

- Development:
```
http://localhost:8080
```

- Production:
```
https://your-prod-domain.com
```

---

## General Info

- **Authentication:** None
- **Content-Type:** `application/json`
- **Date Format:** ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)

---

## Response Structure

### Success
```json
{
  "status": "success",
  "data": {}
}
```

### Error
```json
{
  "status": "error",
  "message": "Human readable message",
  "code": 400
}
```

---

## Endpoints

### 1. Health Check

**GET `/api/health`**

Used to verify that the API is running.

#### Response (200)
```json
{
  "status": "ok",
  "timestamp": "2026-03-17T05:26:00+02:00",
  "version": "1.0.0"
}
```

#### Example
```
GET /api/health
```

---

### 2. Track Parcel

**GET `/api/track`**

Retrieves tracking information for a parcel.

#### Query Parameters

| Name  | Type   | Required | Description              | Validation                  | Example        |
|-------|--------|----------|--------------------------|-----------------------------|----------------|
| label | string | Yes      | Tracking number          | Alphanumeric, 8–30 chars    | F123456789ZA   |

#### Success Response (200)
```json
{
  "label": "F987654321ZA",
  "current_status": "Delivered",
  "scan_type": "DEL",
  "delivered_to": "J Smith",
  "delivered_date": "2026-03-15",
  "signature": null,
  "reference": "ORD-12345",
  "scans": [
    {
      "Date": "2026-03-15",
      "Time": "14:22",
      "StatusDescription": "Delivered",
      "Type": "DEL",
      "Description": "Delivered to recipient"
    }
  ]
}
```

#### Errors

| HTTP | Description                          |
|------|--------------------------------------|
| 422  | Validation failed                    |
| 404  | No tracking data found               |
| 503  | Fastway API unavailable              |

#### Example
```
GET /api/track?label=F123456789ZA
```

---

### 3. Get Quote

**GET `/api/quote`**

Calculates shipping quotes.

#### Query Parameters

| Name     | Type   | Required | Description                | Validation              | Example        |
|----------|--------|----------|----------------------------|-------------------------|----------------|
| suburb   | string | Yes      | Destination suburb         | Letters + spaces        | Durban North   |
| postcode | string | Yes      | Postal code                | 4 digits                | 4051           |
| weight   | number | Yes      | Weight in kg               | > 0, ≤ 30               | 4.5            |
| length   | number | No       | Length (cm)                | > 0                     | 40             |
| width    | number | No       | Width (cm)                 | > 0                     | 30             |
| height   | number | No       | Height (cm)                | > 0                     | 25             |

#### Success Response (200)
```json
{
  "suburb": "Durban North",
  "postcode": "4051",
  "weight": 4.5,
  "has_dimensions": true,
  "from": "...",
  "to": "...",
  "delivery_franchise": "...",
  "pickup_franchise": "...",
  "delivery_timeframe_days": 1,
  "services": [
    {
      "service": "Express",
      "price": 189.5,
      "transit_days": 1
    },
    {
      "service": "Saver",
      "price": 115.0
    }
  ]
}
```

#### Errors

| HTTP | Description                          |
|------|--------------------------------------|
| 422  | Validation failed                    |
| 404  | No services found                    |
| 503  | Fastway API unavailable              |

#### Examples
```
GET /api/quote?suburb=Durban%20North&postcode=4051&weight=3.2
```

```
GET /api/quote?suburb=Cape%20Town&postcode=8001&weight=12&length=50&width=40&height=30
```

---

### 4. Suburb Search (Autocomplete)

**GET `/api/suburbs`**

Returns matching suburbs.

#### Query Parameters

| Name | Type   | Required | Description          | Validation            | Example |
|------|--------|----------|----------------------|-----------------------|---------|
| term | string | Yes      | Search term          | 2–50 chars            | durban  |

#### Response (200)
```json
{
  "suburbs": [
    "Durban Central",
    "Durban North",
    "Durban South",
    "Durban West"
  ]
}
```

#### Behavior

- Max 10 results
- Returns `[]` if input is invalid
- Returns `[]` on API failure

#### Example
```
GET /api/suburbs?term=umhlanga
```

---

## Summary Table

| Method | Path           | Purpose                | Params                                  | Status Codes        |
|--------|----------------|------------------------|------------------------------------------|---------------------|
| GET    | /api/health    | Health check           | —                                        | 200                 |
| GET    | /api/track     | Track parcel           | `label`                                  | 200, 404, 422, 503 |
| GET    | /api/quote     | Get quote              | `suburb`, `postcode`, `weight`           | 200, 404, 422, 503 |
| GET    | /api/suburbs   | Suburb search          | `term`                                   | 200                 |

