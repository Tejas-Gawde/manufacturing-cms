# Manufacturing Order Creation Examples

## New MO Creation Flow

The MO creation now supports two modes:

### 1. BOM-Based Creation

When a BOM is selected, components and work orders are auto-filled from the BOM.

**Request:**
```json
POST /api/mos
{
  "status": "planned",
  "deadline": "2025-01-20T10:00:00Z",
  "bom_id": 12,
  "work_center_id": 4
}
```

**Response:**
```json
{
  "item": {
    "id": 1,
    "status": "planned",
    "deadline": "2025-01-20T10:00:00Z",
    "bomId": 12,
    "workCenterId": 4,
    "createdBy": 1,
    "components": [
      {
        "material_id": 1,
        "material_name": "Steel Rod",
        "qty": 2,
        "unit": "piece",
        "unit_cost": 50
      }
    ],
    "workOrders": [
      {
        "step_name": "Cutting",
        "estimated_time": 30
      },
      {
        "step_name": "Welding",
        "estimated_time": 45
      }
    ],
    "bomName": "Steel Frame",
    "workCenterName": "Assembly Line 1",
    "creatorName": "John Manager"
  }
}
```

### 2. Manual Creation

When no BOM is selected, components and work orders are provided manually.

**Request:**
```json
POST /api/mos
{
  "status": "planned",
  "deadline": "2025-01-20T10:00:00Z",
  "work_center_id": 4,
  "components": [
    {
      "material_name": "Aluminum Sheet",
      "qty": 3,
      "unit": "piece",
      "unit_cost": 75
    },
    {
      "material_name": "Screws",
      "qty": 20,
      "unit": "piece",
      "unit_cost": 2
    }
  ],
  "work_orders": [
    {
      "step_name": "Cutting",
      "estimated_time": 25
    },
    {
      "step_name": "Drilling",
      "estimated_time": 15
    },
    {
      "step_name": "Assembly",
      "estimated_time": 30
    }
  ]
}
```

## New API Endpoints

### Get BOM Details for MO Creation
```
GET /api/mos/bom/:bom_id
```

Returns BOM details including components and work orders for auto-filling the MO creation form.

### Get Available Stock Items
```
GET /api/stock/available?material_type=raw_materials&search=steel
```

Returns available stock items for manual component selection in MO creation.

**Response:**
```json
{
  "items": [
    {
      "materialName": "Steel Rod",
      "materialType": "raw_materials",
      "balance": 100,
      "unit": "piece",
      "unitCost": 50,
      "totalValue": 5000
    }
  ]
}
```

## Frontend Integration Flow

1. **MO Creation Form:**
   - Show BOM selection dropdown (optional)
   - If BOM selected: Auto-fill components and work orders (read-only)
   - If no BOM: Show editable components and work orders sections

2. **Component Selection (Manual Mode):**
   - Use `/api/stock/available` to populate component selection
   - Allow user to add/remove components with quantities

3. **Work Order Management (Manual Mode):**
   - Allow user to add/remove work order steps
   - Each step needs name and estimated time

4. **Submission:**
   - Send appropriate request based on mode (BOM-based or manual)
   - Backend handles validation and creation

## Database Changes

- `manufacturing_orders.bom_id` is now optional (can be NULL)
- Added `manufacturing_orders.components` (JSONB)
- Added `manufacturing_orders.work_orders` (JSONB)
- Components and work orders are stored directly in the MO record
- Individual work order records are still created for tracking purposes
