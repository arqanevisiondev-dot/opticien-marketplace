// WhatsApp notification service using Twilio
// Sign up at https://www.twilio.com/whatsapp

export async function sendWhatsAppMessage(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886

  if (!accountSid || !authToken || !fromNumber) {
    console.error('Twilio credentials not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: `whatsapp:${to}`,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Twilio API error:', error);
      return false;
    }

    const result = await response.json();
    console.log('WhatsApp message sent:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

// Alternative: Using Twilio Node.js SDK
// Install: pnpm add twilio
// 
// import twilio from 'twilio';
// 
// export async function sendWhatsAppMessage(to: string, message: string) {
//   const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );
// 
//   try {
//     const result = await client.messages.create({
//       from: process.env.TWILIO_WHATSAPP_NUMBER,
//       to: `whatsapp:${to}`,
//       body: message,
//     });
//     return true;
//   } catch (error) {
//     console.error('Error sending WhatsApp:', error);
//     return false;
//   }
// }
