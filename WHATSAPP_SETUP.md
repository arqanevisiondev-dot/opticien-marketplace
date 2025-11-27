# WhatsApp Notifications Setup

When a new optician registers, the admin needs to be notified via WhatsApp. There are 3 ways to implement this:

## Option 1: Auto-Open WhatsApp Link (Current - No API needed) ✅

**Status:** Already implemented!

**How it works:**
1. When optician registers, system generates a pre-filled WhatsApp message
2. A new browser tab opens with `https://wa.me/ADMIN_PHONE?text=MESSAGE`
3. User clicks "Send" to notify the admin

**Pros:**
- ✅ Free
- ✅ No API setup required
- ✅ Works immediately

**Cons:**
- ❌ Requires user to have WhatsApp installed
- ❌ User must manually click "Send"
- ❌ Admin must have WhatsApp on the phone number in database

**Setup:**
1. Make sure admin account has WhatsApp number in database
2. Test by registering a new optician account
3. WhatsApp will auto-open in a new tab

---

## Option 2: Twilio WhatsApp API (Recommended for production)

**Cost:** ~$0.005 per message
**Setup time:** 30 minutes

**How it works:**
1. Sign up at [Twilio](https://www.twilio.com/whatsapp)
2. Get WhatsApp-enabled phone number
3. Add credentials to `.env`
4. Messages send automatically via API

**Setup:**

1. **Sign up for Twilio:**
   - Go to https://www.twilio.com/try-twilio
   - Verify your email and phone

2. **Get WhatsApp Sandbox:**
   - In Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to join sandbox (send "join <code>" to Twilio's WhatsApp)

3. **Add to `.env`:**
```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

4. **Update signup route:**
```typescript
// In app/api/auth/signup/route.ts
import { sendWhatsAppMessage } from '@/lib/whatsapp';

// Replace the whatsappUrl generation with:
await sendWhatsAppMessage(whatsappPhone, message);
```

**Pros:**
- ✅ Fully automatic
- ✅ Reliable delivery
- ✅ Message status tracking
- ✅ Production-ready

**Cons:**
- ❌ Costs money (but very cheap)
- ❌ Requires API setup

**Code:**
See `/lib/whatsapp.ts` for implementation

---

## Option 3: WhatsApp Business API (Enterprise)

**Cost:** Custom pricing
**Setup time:** Several days/weeks

**Requirements:**
- Meta Business account
- WhatsApp Business API access
- Template message approval
- Webhook setup

**Best for:**
- Large scale operations (1000+ messages/day)
- Official verified business account
- Advanced automation

**Not recommended unless:**
- You're sending thousands of messages
- You need official WhatsApp business verification

---

## Current Implementation

The app currently uses **Option 1** (auto-open WhatsApp link).

**Test it:**
1. Start dev server: `pnpm dev`
2. Create admin with WhatsApp: Visit `/admin-login`
3. Register new optician at `/auth/signup`
4. WhatsApp will auto-open with pre-filled message

**To upgrade to Twilio (Option 2):**
1. Follow Twilio setup above
2. Uncomment Twilio code in `/lib/whatsapp.ts`
3. Update `/app/api/auth/signup/route.ts` to call `sendWhatsAppMessage()`

---

## Environment Variables

```env
# Option 1: No variables needed

# Option 2: Twilio
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Option 3: Meta Business API
WHATSAPP_BUSINESS_ACCOUNT_ID="your_account_id"
WHATSAPP_ACCESS_TOKEN="your_access_token"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
```
