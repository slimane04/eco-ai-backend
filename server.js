const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());
 console.log("Utilisateur mail chargé :", process.env.EMAIL_USER);
// 1.MongoDB CONNECTION
//mongoose.connect("mongodb://127.0.0.1:27017/tajirli_db");
console.log("URI MongoDB:", process.env.MONGODB_URI);
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

// 2. Nodemailer setup
const PORT = process.env.PORT || 5000;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Ton adresse Gmail
    pass: process.env.EMAIL_PASS  // Ton "Mot de passe d'application" Google
  }
});

// 3. Route POST
app.post("/contact", async (req, res) => {
  const { nom, email, phone, message } = req.body;
 
  try {
    // A. On sauvegarde dans la base de données
    const nouveauContact = new Contact({ nom, email, phone, message });
    await nouveauContact.save();
     
    // B. On prépare l'email avec TOUTES les informations du formulaire
    const mailOptions = {
      from: 'Tajirli Web <contact.tajirli@gmail.com>',
      to: 'contact.tajirli@gmail.com', // Où tu veux recevoir les infos
      subject: `Nouveau message de : ${nom}`,
      html: `
        <h3>Nouveau prospect Tajirli</h3>
        <p><strong>Nom complet :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
        <hr>
        <p>Ce message a été enregistré dans ta base de données.</p>
      `
    };

    // C. Envoi réel
    await transporter.sendMail(mailOptions);
    
    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Erreur serveur" });
  }
});

app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));