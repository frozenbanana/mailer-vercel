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

    const { name, email, company } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const toUserResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // Use environment variable for security
            },
            body: JSON.stringify({
                sender: { name: "Hejbit by MetaProvide", email: "home@metaprovide.org" },
                to: [{ email, name }],
                subject: `Thank you ${name} for reaching out`,
                htmlContent: `<p>We have received your message. We will get back to you shortly. You have sent us the following information:</p><p>Name: ${name}</p><p>Email: ${email}</p><p>Company: ${company}</p>`,
            }),
        });

        const toMetaProvideResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // Use environment variable for security
            },
            body: JSON.stringify({
                sender: { name, email },
                to: [{ email: "home@metaprovide.org", name: "Hejbit by MetaProvide" }],
                subject: `New user has reached out: ${name}`,
                htmlContent: `<p>They have sent us the following information:</p><p>Name: ${name}</p><p>Email: ${email}</p><p>Company: ${company}</p>`,
            }),
        });

        const userData = await toUserResponse.json();
        const metaprovideData = await toMetaProvideResponse.json();

        if (userData.ok && metaprovideData.ok) {
            return res.status(200).json({ message: 'Email sent successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to send email', error: data });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

