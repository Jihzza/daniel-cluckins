# MCP Integration Guide for DaGalow Chatbot

This guide explains how to implement the Model Context Protocol (MCP) appointments server in your chatbot.

## What Was Implemented

### 1. MCP Client Service (`src/services/mcpClient.js`)
- **Purpose**: Handles communication with the MCP appointments server
- **Features**:
  - Natural language parsing for appointment requests
  - Direct appointment scheduling via Netlify functions
  - Intent detection for appointment-related messages

### 2. Appointment Scheduler Component (`src/components/chatbot/AppointmentScheduler.jsx`)
- **Purpose**: React component for appointment scheduling UI
- **Features**:
  - Form validation
  - Date/time selection with constraints
  - Contact information collection
  - Error handling and user feedback

### 3. Netlify Function (`netlify/functions/mcp-appointments.js`)
- **Purpose**: Serverless function to handle MCP server communication
- **Features**:
  - Direct Supabase integration (fallback)
  - Input validation
  - CORS handling
  - Error management

### 4. Updated Chatbot Page (`src/pages/ChatbotPage.jsx`)
- **Purpose**: Enhanced chatbot with MCP integration
- **Features**:
  - Automatic appointment request detection
  - Smart appointment form display
  - Quick appointment scheduling button
  - Seamless integration with existing n8n workflow

## Setup Instructions

### 1. Environment Variables
Add these to your Netlify environment variables:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEFAULT_TZ=Europe/Madrid
```

### 2. Database Schema
Ensure your Supabase `appointments` table has these columns:
```sql
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  duration_minutes INTEGER NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'Confirmed',
  stripe_payment_id TEXT,
  appointment_start TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Deploy the MCP Server (Optional)
If you want to use the actual MCP server instead of the direct Supabase integration:

1. Build the MCP server:
   ```bash
   cd "MCP DaGalow"
   npm run build
   ```

2. Deploy it as a separate service or integrate it into your Netlify functions

### 4. Test the Integration

#### Test Cases:
1. **Natural Language Parsing**:
   - "I want to schedule an appointment for tomorrow at 2pm for 1 hour"
   - "Can I book a meeting on 2025-01-15 at 14:30 for 90 minutes?"

2. **Quick Appointment Button**:
   - Click the "Schedule Appointment" button in the chatbot header

3. **Form Validation**:
   - Try submitting incomplete forms
   - Test date/time constraints

## How It Works

### 1. Message Processing Flow
```
User Message → Intent Detection → Parse Data → Schedule Appointment → Confirm
     ↓
If insufficient data → Show Appointment Form → User fills → Schedule → Confirm
```

### 2. Natural Language Processing
The system recognizes these patterns:
- **Date**: "tomorrow", "2025-01-15", "1/15/2025"
- **Time**: "2pm", "14:30", "2:30 PM"
- **Duration**: "1 hour", "90 minutes", "2 hrs"
- **Contact**: Name, email, phone extraction

### 3. Integration Points
- **Existing n8n workflow**: Still processes regular messages
- **MCP server**: Handles appointment scheduling
- **Supabase**: Stores appointment data
- **UI**: Seamless appointment form integration

## Customization Options

### 1. Modify Appointment Form
Edit `src/components/chatbot/AppointmentScheduler.jsx`:
- Add more fields
- Change validation rules
- Modify styling

### 2. Enhance Natural Language Processing
Edit `src/services/mcpClient.js`:
- Add more date/time patterns
- Improve contact extraction
- Add more appointment types

### 3. Customize MCP Server
Edit the MCP server in `MCP DaGalow/src/mcp-server.ts`:
- Add more tools
- Modify appointment schema
- Add business logic

## Troubleshooting

### Common Issues:

1. **Appointments not saving**:
   - Check Supabase environment variables
   - Verify database schema
   - Check Netlify function logs

2. **Natural language not working**:
   - Test with simpler phrases
   - Check regex patterns in mcpClient.js
   - Use the appointment form as fallback

3. **CORS errors**:
   - Verify Netlify function CORS headers
   - Check function deployment

### Debug Steps:
1. Check browser console for errors
2. Check Netlify function logs
3. Test with direct API calls
4. Verify Supabase connection

## Next Steps

1. **Test thoroughly** with various appointment scenarios
2. **Customize** the UI and validation rules as needed
3. **Add more MCP tools** if required (e.g., reschedule, cancel)
4. **Integrate with calendar systems** (Google Calendar, Outlook)
5. **Add email notifications** for appointments
6. **Implement payment processing** for paid appointments

## Files Modified/Created

- ✅ `src/services/mcpClient.js` (new)
- ✅ `src/components/chatbot/AppointmentScheduler.jsx` (new)
- ✅ `netlify/functions/mcp-appointments.js` (new)
- ✅ `src/pages/ChatbotPage.jsx` (modified)
- ✅ `MCP_INTEGRATION_GUIDE.md` (new)

The integration is now complete and ready for testing!
