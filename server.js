import express from 'express';
import 'dotenv/config';
import fs from 'fs';
import fetch from 'node-fetch';

const app = express();
app.use(express.static('.'));
app.use(express.json());

const RUTA_DESTINOS = './destinos.json';

// --- FUNCIÓN DE PRECARGA ---
async function precargarItinerarios() {
    try {
        if (!fs.existsSync(RUTA_DESTINOS)) return;

        let destinos = JSON.parse(fs.readFileSync(RUTA_DESTINOS, 'utf-8'));
        let huboCambios = false;

        console.log("🔍 Revisando destinos para precarga...");

        for (let i = 0; i < destinos.length; i++) {
            const d = destinos[i];
            // Solo genera si no existe el itinerario
            if (!d.itinerario || d.itinerario.length === 0) {
                console.log(`🤖 Generando itinerario para ${d.nombre}...`);
                try {
                    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: "open-mistral-7b",
                            messages: [
                                {
                                    role: "system",
                                    content: "Eres un agente de viajes. Responde SOLO un array JSON. Cada campo ('manana', 'tarde', 'noche') debe ser un STRING (texto plano) de máximo 200 caracteres. PROHIBIDO usar objetos, arrays anidados o formato Markdown (nada de asteriscos **). Ejemplo: [{\"dia\":\"Día 1\",\"manana\":\"Visita al Coliseo y alrededores\",\"tarde\":\"Paseo por el Trastevere\",\"noche\":\"Cena cerca del Panteón\"}]"
                                },
                                { role: "user", content: `Genera itinerario de ${d.dias} días para ${d.nombre}` }
                            ],
                            response_format: { type: "json_object" }
                        })
                    });

                    const data = await response.json();
                    let itinerarioIA = JSON.parse(data.choices[0].message.content);

                    if (!Array.isArray(itinerarioIA)) {
                        const clave = Object.keys(itinerarioIA)[0];
                        itinerarioIA = itinerarioIA[clave];
                    }

                    destinos[i].itinerario = itinerarioIA;
                    huboCambios = true;
                } catch (err) { console.error(`❌ Error en ${d.nombre}:`, err.message); }
            }
        }

        if (huboCambios) {
            fs.writeFileSync(RUTA_DESTINOS, JSON.stringify(destinos, null, 2));
            console.log("💾 Archivo destinos.json actualizado.");
        }
    } catch (err) { console.error("Error en precarga:", err); }
}

app.get('/api/destinos', (req, res) => {
    const data = fs.readFileSync(RUTA_DESTINOS, 'utf-8');
    res.json(JSON.parse(data));
});

app.get('/api/rutas', (req, res) => {
    try {
        const data = fs.readFileSync('./rutas.json', 'utf-8');
        res.json(JSON.parse(data));
    } catch (e) { res.json([]); }
});

app.get('/favicon.ico', (req, res) => res.status(204));

const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    await precargarItinerarios();
});