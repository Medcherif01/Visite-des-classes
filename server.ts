import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialise Google GenAI with recommended telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Route: Generate Pedagogical Comments with Gemini AI
app.post('/api/generate-pedagogical-comments', async (req, res) => {
  try {
    const {
      teacherName,
      coordinatorName,
      className,
      subject,
      lessonTopic,
      sessionNumber,
      grandTotal,
      maxPossibleScore,
      percentageScore,
      performanceLevel,
      categoryScores,
      ratingsBreakdown,
      observationNotes,
      language = 'fr',
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY non configurée sur le serveur.',
        fallbackNeeded: true,
      });
    }

    const systemInstruction = `Tu es un inspecteur académique et coordinateur pédagogique chevronné de l'École Internationale Alkawthar.
Ton rôle est de rédiger un compte-rendu d'évaluation de visite de classe rigoureux, bienveillant, constructif et d'une grande valeur didactique.
Tu analyses les notes chiffrées attribuées pour chaque critère, le score global et les notes d'observation prises en direct pour produire une synthèse détaillée et des commentaires spécifiques à l'enseignant observé.
Langue demandée pour la rédaction : ${language === 'ar' ? 'Arabe littéraire pédagogique' : language === 'en' ? 'Anglais académique' : 'Français soutenu et professionnel'}.
Règles :
1. Sois très précis par rapport à la matière (${subject}) et au sujet de leçon (${lessonTopic || 'Séance pédagogique'}).
2. Personnalise avec le nom de l'enseignant (${teacherName}).
3. Ne reste pas vague : lie les recommandations concrètement aux critères ayant obtenu des notes moyennes ou faibles (inférieures à 4/5), et valorise les points forts (notes 4 ou 5/5).
4. Structure strictement selon le format JSON requis.`;

    const prompt = `Voici les données de la visite d'observation de classe :
- Enseignant observé : ${teacherName}
- Coordinateur : ${coordinatorName || 'Coordinateur Pédagogique'}
- Établissement : École Internationale Alkawthar
- Classe : ${className || 'Non spécifié'}
- Matière / Discipline : ${subject || 'Non spécifié'}
- Thème de la leçon : ${lessonTopic || 'Séance programmée'}
- Séance N° : ${sessionNumber || 1}
- Score global obtenu : ${grandTotal} / ${maxPossibleScore || 100} points (${percentageScore}%)
- Mention attribuée : ${performanceLevel?.label_fr || 'Satisfaisant'}

Scores par domaine :
${JSON.stringify(categoryScores || {}, null, 2)}

Détail des notes par critère observable :
${JSON.stringify(ratingsBreakdown || [], null, 2)}

Notes d'observation prises en direct pendant la séance :
${
  observationNotes && observationNotes.length > 0
    ? observationNotes.map((n: any) => `[${n.timestamp}] (${n.tag}) : ${n.content}`).join('\n')
    : 'Aucune note spécifique prise pendant la séance.'
}

Génère en JSON les commentaires complets d'inspection pour cette fiche d'évaluation :
1. "synthesis" : Synthèse globale diagnostique et argumentée (environ 3 à 5 phrases percutantes).
2. "strengths" : 3 à 5 points forts observés concrets formulés avec des puces (•).
3. "toImprove" : 2 à 4 axes d'amélioration prioritaires et constructifs avec des puces (•).
4. "recommendations" : 3 à 4 recommandations didactiques et opérationnelles numérotées (1., 2., 3.).
5. "actionPlan" : Plan d'action et engagements mutuels pour la prochaine visite convenue.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synthesis: {
              type: Type.STRING,
              description: 'Synthèse pédagogique globale argumentée de la visite',
            },
            strengths: {
              type: Type.STRING,
              description: 'Points forts observés avec puces',
            },
            toImprove: {
              type: Type.STRING,
              description: "Axes d'amélioration prioritaires avec puces",
            },
            recommendations: {
              type: Type.STRING,
              description: 'Recommandations didactiques précises numérotées',
            },
            actionPlan: {
              type: Type.STRING,
              description: 'Plan d action mutuel pour la prochaine visite',
            },
          },
          required: ['synthesis', 'strengths', 'toImprove', 'recommendations', 'actionPlan'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Réponse vide du modèle Gemini.');
    }

    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Erreur API Gemini Server-Side:', error);
    return res.status(500).json({
      error: error.message || 'Erreur lors de la génération des commentaires avec Gemini.',
      fallbackNeeded: true,
    });
  }
});

// Vite Middleware mounting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduVisite Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
