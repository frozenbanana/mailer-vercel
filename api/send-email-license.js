import fetch from 'node-fetch';

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // Use environment variable for security
            },
            body: JSON.stringify({
                sender: { name: "Hejbit by MetaProvide", email: "tech@metaprovide.org" },
                to: [{ email, name }],
                subject: `Thank you for requesting a trail license!`,
              htmlContent: `<h1>Hello ${name}</h1><p>Thank you for reaching out. We will get back to you shortly. You have sent us the following information:</p><p>${formDataString}</p>`,
              params: {
                name: name,
                formDataString: formDataString,
              },
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ message: 'Email sent successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to send email', error: data });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

