import fetch from 'node-fetch';

export default async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Responding to preflight request
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    // Extracting fields directly from req.body
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convert form data to a readable string
    const formDataString = Object.entries(req.body)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
        .join('');

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // Use environment variable for security
            },
            body: JSON.stringify({
                sender: { name: "Hejbit by MetaProvide", email: "license@hejbit.com" },
                to: [{ email, name }],
                subject: `Thank you for requesting a trail license!`,
              htmlContent: `<h1>Hello ${name}</h1><p>Thank you for reaching out. We will get back to you shortly.`,
              params: {
                name: name,
                formDataString: formDataString,
              },
            }),
        });

        // New notification email to license@hejbit.com
        const notificationResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: { name: "Hejbit License System", email: "tech@metaprovide.org" },
                to: [{ email: "license@hejbit.com", name: "Hejbit License Team" }],
                subject: `New License Request from ${name}`,
                htmlContent: `<h1>New License Request</h1><p>A new customer has requested a license. Details:</p>${formDataString}`,
            }),
        });


        const customerData = await customerResponse.json();
        const notificationData = await notificationResponse.json();
    

        if (customerResponse.ok && notificationResponse.ok) {
            return res.status(200).json({ message: 'Emails sent successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to send email', error: data });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

