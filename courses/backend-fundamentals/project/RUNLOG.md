# RUNLOG — verified live walkthrough (docker compose, real Postgres+Redis)

```
### 0. health
{"status":"ok"}
[HTTP 200]
### 1. register ada
{"data":{"id":"1","email":"ada@example.com"}}
[HTTP 201]
### 2. login -> capture JWT
token length: 175 chars
token head: eyJhbGciOiJIUzI1NiIsInR5c...
### 3. browse public catalog
{"data":[{"id":"1","name":"Wireless Mouse","price":"2500","available":100},{"id":"2","name":"Mechanical Keyboard","price":"8900","available":50}]}
[HTTP 200]
### 4. add to cart: 2 of product 1
{"data":[[1,2,2500,5000]]}
[HTTP 201]
### 4b. merge: add 3 more of product 1 (qty -> 5, keep original price)
{"data":[[1,5,2500,12500]]}
[HTTP 201]
### 5. checkout with Idempotency-Key
{"data":{"id":"1","status":"confirmed","totalCents":12500,"createdAt":"2026-08-07T16:38:27.137Z"}}
[HTTP 201]
### 6. same key again -> replayed, no second order/charge
{"data":{"id":"1","status":"confirmed","totalCents":12500,"createdAt":"2026-08-07T16:38:27.137Z"}}
[HTTP 200]
### 7. checkout again with a NEW key -> balance was deducted once
{"data":{"id":"2","status":"confirmed","totalCents":8900,"createdAt":"2026-08-07T16:38:27.180Z"}}
[HTTP 201]
### 8. hammer /api/products x70 -> expect 429s (limit 60/min per IP)
     59 200
     11 429
### 9. rate-limited response body + Retry-After
{"error":{"code":"RATE_LIMITED","message":"Too many requests"}}
[HTTP 429] Retry-After: {"retry-after":["60"],
"content-type":["application/json; charset=utf-8"],
"content-length":["63"],
"etag":["W/\"3f-5+J1U4yM/sm34HbvJ+RUc4mdZu8\""],
"date":["Fri, 07 Aug 2026 16:38:28 GMT"],
"connection":["keep-alive"],
"keep-alive":["timeout=5"]
}
DONE
```
