# LandVerify CRM Database Structure (Supabase)

## Tables

### users
- `id` uuid PRIMARY KEY (default: `auth.uid()`)
- `first_name` varchar
- `last_name` varchar
- `email` varchar UNIQUE
- `phone` varchar
- `role` varchar CHECK (role IN ('admin', 'agent', 'property_owner', 'client'))
- `status` varchar DEFAULT 'active'
- `profile_image` varchar
- `created_at` timestamp DEFAULT now()
- `updated_at` timestamp DEFAULT now()

### agents
- `id` uuid PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` uuid REFERENCES users(id)
- `license_number` varchar UNIQUE
- `specializations` jsonb DEFAULT '[]'
- `areas_served` jsonb DEFAULT '[]'
- `bio` text
- `performance_metrics` jsonb DEFAULT '{}'
- `status` varchar DEFAULT 'active'
- `created_at` timestamp DEFAULT now()
- `updated_at` timestamp DEFAULT now()

### properties
- `id` uuid PRIMARY KEY DEFAULT uuid_generate_v4()
- `owner_id` uuid REFERENCES users(id)
- `owner_name` varchar
- `email` varchar
- `phone` varchar
- `address` varchar
- `coordinates` geography(POINT)
- `property_type` varchar
- `size` numeric
- `price` numeric
- `images` jsonb DEFAULT '[]'
- `documents` jsonb DEFAULT '[]'
- `verification_status` varchar DEFAULT 'pending'
- `verification_details` jsonb DEFAULT '{}'
- `history_log` jsonb DEFAULT '[]'
- `created_at` timestamp DEFAULT now()
- `updated_at` timestamp DEFAULT now()

### leads
- `id` uuid PRIMARY KEY DEFAULT uuid_generate_v4()
- `name` varchar
- `email` varchar
- `phone` varchar
- `source` varchar
- `status` varchar DEFAULT 'new'
- `assigned_agent_id` uuid REFERENCES agents(id)
- `requirements` jsonb DEFAULT '{}'
- `budget_range` jsonb DEFAULT '{}'
- `preferred_locations` jsonb DEFAULT '[]'
- `communication_history` jsonb DEFAULT '[]'
- `notes` text
- `created_at` timestamp DEFAULT now()
- `updated_at` timestamp DEFAULT now()

### deals
- `id` uuid PRIMARY KEY DEFAULT uuid_generate_v4()
- `property_id` uuid REFERENCES properties(id)
- `lead_id` uuid REFERENCES leads(id)
- `agent_id` uuid REFERENCES agents(id)
- `deal_type` varchar CHECK (deal_type IN ('sale', 'rent', 'lease'))
- `stage` varchar DEFAULT 'new'
- `value` numeric
- `commission` numeric
- `documents` jsonb DEFAULT '[]'
- `activity_log` jsonb DEFAULT '[]'
- `created_at` timestamp DEFAULT now()
- `updated_at` timestamp DEFAULT now()

### tasks
- `id` uuid PRIMARY KEY DEFAULT uuid_generate_v4()
- `title` varchar
- `description` text
- `due_date` timestamp
- `priority` varchar CHECK (priority IN ('low', 'medium', 'high'))
- `status` varchar DEFAULT 'pending'
- `assigned_to` uuid REFERENCES users(id)
- `assigned_by` uuid REFERENCES users(id)
- `related_to` jsonb DEFAULT '{}'
- `reminders` jsonb DEFAULT '[]'
- `created_at` timestamp DEFAULT now()
- `updated_at` timestamp DEFAULT now()

### calendar_events
- `id` uuid PRIMARY KEY DEFAULT uuid_generate_v4()
- `title` varchar
- `description` text
- `start_time` timestamp
- `end_time` timestamp
- `event_type` varchar CHECK (event_type IN ('meeting', 'viewing', 'inspection', 'follow_up', 'other'))
- `location` varchar
- `attendees` jsonb DEFAULT '[]'
- `related_to` jsonb DEFAULT '{}'
- `reminders` jsonb DEFAULT '[]'
- `created_by` uuid REFERENCES users(id)
- `status` varchar DEFAULT 'scheduled'
- `created_at` timestamp DEFAULT now()
- `updated_at` timestamp DEFAULT now()

## Indexes

### users
- `CREATE INDEX idx_users_email ON users(email);`
- `CREATE INDEX idx_users_role ON users(role);`

### agents
- `CREATE INDEX idx_agents_user_id ON agents(user_id);`
- `CREATE INDEX idx_agents_license_number ON agents(license_number);`

### properties
- `CREATE INDEX idx_properties_owner_id ON properties(owner_id);`
- `CREATE INDEX idx_properties_verification_status ON properties(verification_status);`
- `CREATE INDEX idx_properties_coordinates ON properties USING GIST(coordinates);`

### leads
- `CREATE INDEX idx_leads_assigned_agent_id ON leads(assigned_agent_id);`
- `CREATE INDEX idx_leads_status ON leads(status);`

### deals
- `CREATE INDEX idx_deals_property_id ON deals(property_id);`
- `CREATE INDEX idx_deals_lead_id ON deals(lead_id);`
- `CREATE INDEX idx_deals_agent_id ON deals(agent_id);`
- `CREATE INDEX idx_deals_stage ON deals(stage);`

### tasks
- `CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);`
- `CREATE INDEX idx_tasks_due_date ON tasks(due_date);`
- `CREATE INDEX idx_tasks_status ON tasks(status);`

### calendar_events
- `CREATE INDEX idx_calendar_events_created_by ON calendar_events(created_by);`
- `CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);`

## RLS (Row Level Security) Policies

### users
```sql
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id);
```

### properties
```sql
CREATE POLICY "Properties are viewable by authenticated users"
ON properties FOR SELECT
USING (auth.role() IN ('admin', 'agent'));

CREATE POLICY "Property owners can manage their properties"
ON properties FOR ALL
USING (auth.uid() = owner_id);
```

### leads
```sql
CREATE POLICY "Agents can view assigned leads"
ON leads FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM agents WHERE id = assigned_agent_id
  )
);
```

### deals
```sql
CREATE POLICY "Agents can view their deals"
ON deals FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM agents WHERE id = agent_id
  )
);
```

## JSONB Fields Structure

### agents.performance_metrics
```json
{
  "total_deals": number,
  "deals_closed": number,
  "total_value": number,
  "lead_conversion_rate": number,
  "average_days_to_close": number
}
```

### properties.verification_details
```json
{
  "verified_by": uuid,
  "verification_date": timestamp,
  "documents": [
    {
      "type": string,
      "url": string,
      "verified": boolean,
      "notes": string
    }
  ],
  "site_visit": {
    "date": timestamp,
    "inspector": uuid,
    "findings": string
  }
}
```

### leads.communication_history
```json
[
  {
    "timestamp": timestamp,
    "type": string,
    "message": string,
    "user_id": uuid
  }
]
```

### deals.activity_log
```json
[
  {
    "timestamp": timestamp,
    "action": string,
    "user_id": uuid,
    "details": string,
    "changes": object
  }
]
```

## Notes

1. **Authentication**: Using Supabase Auth with JWT tokens
2. **File Storage**: Using Supabase Storage for documents and images
3. **Realtime**: Enabled for tasks, calendar_events, and deals tables
4. **Backups**: Daily automated backups enabled
5. **Postgis**: Enabled for geographical queries on properties
6. **Functions**: Using Supabase Edge Functions for complex operations

## Security Considerations

1. All tables have RLS enabled
2. Sensitive data is encrypted at rest
3. API access is restricted by role
4. File uploads are validated and scanned
5. Rate limiting is enabled for API endpoints 