#!/bin/bash
ORG_ID="d058db74-c5c9-4393-a4d6-43c427fb0d21"

echo "=== 1. Create a fresh test event ==="
EVENT_JSON=$(curl -s -X POST http://localhost:4000/api/v1/events \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Stress Test 2\",
    \"type\": \"PUBLIC\",
    \"startTime\": \"2026-09-01T10:00:00Z\",
    \"locationType\": \"ONLINE\",
    \"capacity\": 100,
    \"organizationId\": \"$ORG_ID\"
  }")
EVENT_ID=$(echo "$EVENT_JSON" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Created Event ID: $EVENT_ID"

echo -e "\n=== 2. Try Partial Update on DRAFT (change title, capacity) ==="
curl -s -w "\nHTTP Code: %{http_code}\n" -X PATCH http://localhost:4000/api/v1/events/$EVENT_ID \
  -H "Content-Type: application/json" \
  -d '{ "title": "Stress Test 2 - Updated", "capacity": 150 }' | python3 -m json.tool

echo -e "\n=== 3. Publish Event (DRAFT -> PUBLISHED) ==="
curl -s -w "\nHTTP Code: %{http_code}\n" -X PATCH http://localhost:4000/api/v1/events/$EVENT_ID/publish | python3 -m json.tool

echo -e "\n=== 4. Publish Event Again (PUBLISHED -> PUBLISHED) -> EXPECT 400 ==="
curl -s -w "\nHTTP Code: %{http_code}\n" -X PATCH http://localhost:4000/api/v1/events/$EVENT_ID/publish | python3 -m json.tool

echo -e "\n=== 5. Delete Event (PUBLISHED) -> EXPECT 400 ==="
curl -s -w "\nHTTP Code: %{http_code}\n" -X DELETE http://localhost:4000/api/v1/events/$EVENT_ID | python3 -m json.tool

echo -e "\n=== 6. Cancel Event (PUBLISHED -> CANCELLED) ==="
curl -s -w "\nHTTP Code: %{http_code}\n" -X PATCH http://localhost:4000/api/v1/events/$EVENT_ID/cancel | python3 -m json.tool

echo -e "\n=== 7. Cancel Event Again (CANCELLED -> CANCELLED) -> EXPECT 400 ==="
curl -s -w "\nHTTP Code: %{http_code}\n" -X PATCH http://localhost:4000/api/v1/events/$EVENT_ID/cancel | python3 -m json.tool
