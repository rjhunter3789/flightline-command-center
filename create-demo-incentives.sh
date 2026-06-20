 #!/bin/bash
  echo "=== Creating Demo Incentives ==="

  # Ford F-150 Cash Rebate
  curl -X POST http://localhost:3001/api/incentives/create \
    -H "Content-Type: application/json" \
    -d '{
      "name": "2024 F-150 Customer Cash",
      "description": "Customer cash back on all new 2024 F-150 models",
      "type": "cash_rebate",
      "cashAmount": 2500,
      "manufacturer": "Ford",
      "models": ["F-150"],
      "modelYears": [2024],
      "startDate": "'$(date -d 'yesterday' -I)'",
      "endDate": "'$(date -d '+90 days' -I)'",
      "customerTypes": ["retail"],
      "stackable": true,
      "isActive": true
    }'

  echo ""

  # Lincoln Navigator Lease Special
  curl -X POST http://localhost:3001/api/incentives/create \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Lincoln Navigator Lease Special",
      "description": "Special lease rates on 2024 Navigator",
      "type": "lease_special",
      "cashAmount": 0,
      "manufacturer": "Lincoln",
      "models": ["Navigator"],
      "modelYears": [2024],
      "startDate": "'$(date -d 'yesterday' -I)'",
      "endDate": "'$(date -d '+60 days' -I)'",
      "customerTypes": ["lease"],
      "stackable": false,
      "isActive": true
    }'

  echo ""

  # Ford Military Discount
  curl -X POST http://localhost:3001/api/incentives/create \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Ford Military Appreciation",
      "description": "$500 bonus for active military and veterans",
      "type": "military",
      "cashAmount": 500,
      "manufacturer": "Ford",
      "models": [],
      "modelYears": [2024, 2025],
      "startDate": "'$(date -d 'yesterday' -I)'",
      "endDate": "'$(date -d '+180 days' -I)'",
      "customerTypes": ["retail", "lease"],
      "stackable": true,
      "isActive": true
    }'

  echo ""
  echo "=== Demo Incentives Created ==="
  echo "Check them at: curl http://localhost:3001/api/incentives | jq"
