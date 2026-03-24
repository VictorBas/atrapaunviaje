function buscarVuelos() {
  const origen = document.getElementById('origen').value;
  const destino = document.getElementById('destino').value;
  const dias = document.getElementById('dias').value;

  if(origen && destino && dias) {
    alert(`Buscando recomendaciones para ${origen} → ${destino} (${dias} días)...`);
    
    // Redirigir a Skyscanner como ejemplo
    const link = `https://www.skyscanner.es/transport/flights/${origen.toLowerCase()}/${destino.toLowerCase()}/`;
    window.open(link, "_blank");
  } else {
    alert("Introduce origen, destino y duración");
  }
}

function verOferta(destino) {
  alert(`Mostrando vuelos y hoteles recomendados a ${destino}`);
  const link = `https://www.skyscanner.es/transport/flights/mad/${destino.toLowerCase()}/`;
  window.open(link, "_blank");
}

function leerArticulo(slug) {
  alert(`Abriendo artículo: ${slug}`);
}


import fetch from "node-fetch";
import fs from "fs";

const apiKey = process.env.GEMINI_API_KEY; // guarda tu key como variable de entorno

// 1️⃣ Carga tu JSON actual
const destinos = JSON.parse(fs.readFileSync("destinos.json", "utf-8"));

async function generarItinerario(destino) {
  const prompt = `
Genera un itinerario detallado para ${destino.nombre}, de ${destino.dias} días.
Divídelo en "mañana", "tarde" y "noche" para cada día.
Devuélvelo en JSON con este formato:

[
  { "dia": "Día 1", "manana": "...", "tarde": "...", "noche": "..." },
  ...
]

No agregues texto adicional fuera del JSON.
  `;

  const response = await fetch("https://api.anthropic.com/v1/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({
      model: "gemini-1.5",
      prompt: prompt,
      max_tokens: 1000
    })
  });

  const data = await response.json();
  // Gemini suele devolver la respuesta en data.completion
  return JSON.parse(data.completion);
}

async function main() {
  for (let i = 0; i < destinos.length; i++) {
    console.log(`Generando itinerario para ${destinos[i].nombre}...`);
    try {
      const nuevoItinerario = await generarItinerario(destinos[i]);
      destinos[i].itinerario = nuevoItinerario;
    } catch (e) {
      console.error(`Error generando itinerario para ${destinos[i].nombre}:`, e);
    }
  }

  // 2️⃣ Guardar el JSON actualizado
  fs.writeFileSync("destinos_actualizado.json", JSON.stringify(destinos, null, 2));
  console.log("JSON actualizado con itinerarios guardado como destinos_actualizado.json");
}

main();

fetch('/itinerarios')
  .then(res => res.json())
  .then(data => {
    const slug = new URLSearchParams(window.location.search).get('slug');
    const destinoActual = data.find(d => d.slug === slug);
    console.log(destinoActual.itinerario); // ya puedes mostrarlo
  });
