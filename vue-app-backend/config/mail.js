const fs = require("fs");
const path = require("path");
require('dotenv').config();

const sendEmail = async ({ to, subject, text, html, attachments }) => {
    try {
        // Dynamically import fetch here
        const fetch = (await import("node-fetch")).default;

        const brevoApiKey = process.env.BREVO_API_KEY;
        const useremail = process.env.USER_EMAIL;
        const senderName = process.env.NAME;

        if (!brevoApiKey || !useremail) {
            throw new Error("Missing Brevo API key or sender email in environment variables.");
        }

        // Normalize to array of { email }
        const toRecipients = Array.isArray(to)
            ? to.map(email => ({ email }))
            : [{ email: to }];

        const payload = {
            sender: {
                email: useremail,
                name: senderName,
            },
            to: toRecipients,
            subject,
            ...(text ? { textContent: text } : {}),
            htmlContent: html,
        };

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": brevoApiKey,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Brevo API error response:", errorBody);
            throw new Error(`Brevo API error: ${response.status} - ${errorBody}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.log("Brevo API throw error:", error);
        throw error;
    }
};

module.exports = sendEmail;