// 1. FORCER IPV4 (Crucial pour Render)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());

// 2. CONFIGURATION CORS
const allowedOrigins = [
  "http://localhost:5173", 
  "https://eco-ai-frontend.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS non autorisé"));
    }
  }
}));

 app.get("/", (req, res) => {

  res.status(200).send("Tajirli Backend is awake! 🚀");
});
// 3. CONNEXION MONGODB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connecté à MongoDB Atlas"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err.message));

const Contact = mongoose.model("Contact", {
  nom: String,
  phone: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

// 4. ROUTE POST (VERSION BREVO API)
app.post("/contact", async (req, res) => {
  const { nom, email, phone, message } = req.body;

  try {
    // A. Sauvegarde dans MongoDB
    const nouveauContact = new Contact({ nom, email, phone, message });
    await nouveauContact.save();

    // B. Envoi via l'API de Brevo (Remplace Nodemailer)
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY, // Assure-toi que cette clé est sur Render
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Tajirli Web", email: "contact.tajirli@gmail.com" },
        to: [{ email: "contact.tajirli@gmail.com" }],
        subject: `🚀 Nouveau prospect : ${nom}`,
        htmlContent: `
          <div style="font-family: sans-serif; line-height: 1.5;">
            <h3>Nouveau message de ton site Tajirli</h3>
            <p><strong>Nom :</strong> ${nom}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Téléphone :</strong> ${phone}</p>
            <p><strong>Message :</strong></p>
            <p style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</p>
            <hr>
            <p style="font-size: 0.8rem; color: #666;">Ce prospect a aussi été enregistré dans MongoDB Atlas.</p>
          </div>
        `
      })
    });

    if (response.ok) {
      console.log("✅ Email envoyé avec succès via Brevo");
      res.status(200).send({ success: true });
    } else {
      const errorData = await response.json();
      console.error("❌ Erreur API Brevo:", errorData);
      res.status(500).send({ error: "Erreur lors de l'envoi de l'email" });
    }

  } catch (error) {
    console.error("❌ Erreur Serveur:", error);
    res.status(500).send({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});