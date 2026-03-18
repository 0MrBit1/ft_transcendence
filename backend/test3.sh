#!/bin/bash
ORG_ID="d058db74-c5c9-4393-a4d6-43c427fb0d21"
EVENT_JSON=$(curl -s -X POST http://localhost:4000/api/v1/events \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Isolated Test 3\",
    \"type\": \"PUBLIC\",
    \"startTime\": \"2026-09-01T10:00:00Z\",
    \"locationType\": \"ONLINE\",
    \"organizationId\": \"$ORG_ID\"
  }")
EVENT_ID=$(echo "$EVENT_JSON" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "EVENT_ID=$EVENT_ID"
curl -s -i -X PATCH http://localhost:4000/api/v1/events/$EVENT_ID/publish
echo ""
