let destinos = [];
let rutas = [];
let soloIda = false;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cards-hero')) {
        initIndex();
    } else if (document.getElementById('detalle-viaje')) {
        initDestino();
    }
});

async function initIndex() {
    try {
        const resD = await fetch('/api/destinos');
        destinos = await resD.json();
        try {
            const resR = await fetch('/api/rutas');
            rutas = await resR.json();
        } catch (e) { console.warn("No se cargaron rutas"); }
        mostrarOfertas(destinos);
    } catch (error) { console.error("❌ Error inicial:", error); }

    // Eventos de botones (Buscador, Toggle, etc.)
    const btnToggle = document.getElementById('btn-toggle-vuelo');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            soloIda = !soloIda;
            const fVuelta = document.getElementById('fecha-vuelta');
            const fVueltaP = document.getElementById('fecha-vuelta-p');
            if (fVuelta) fVuelta.style.display = soloIda ? 'none' : 'block';
            if (fVueltaP) fVueltaP.style.display = soloIda ? 'none' : 'block';
            btnToggle.textContent = soloIda ? 'Modo: Solo ida' : 'Modo: Ida y vuelta';
        });
    }

    const btnDest = document.getElementById('btn-destinos');
    const btnRut = document.getElementById('btn-rutas');
    if (btnDest) btnDest.onclick = () => { mostrarOfertas(destinos); setActive('btn-destinos'); };
    if (btnRut) btnRut.onclick = () => { mostrarOfertas(rutas); setActive('btn-rutas'); };
}

async function initDestino() {
    try {
        const res = await fetch('/api/destinos');
        const data = await res.json();
        const slug = new URLSearchParams(window.location.search).get('slug');
        const d = data.find(dest => dest.slug === slug);

        if (!d) return;

        // Imagen de fondo del Hero
        const hero = document.getElementById('hero-destino');
        if (hero) hero.style.backgroundImage = `url(${d.imagen})`;

        // Bloque de detalles (Vuelo y Hotel) - Manteniendo tu diseño original
        const detalle = document.getElementById('detalle-viaje');
        if (detalle) {
            detalle.innerHTML = `
                <div class="glass-card-viaje">
                    <div class="columna-viaje">
                        <h2>✈️ ${d.nombre} - ${d.dias} días</h2>
                        <div class="info-item"><p>📅 Fechas: ${d.fechas}</p></div>
                        <div class="info-item"><p>🛫 Vuelo ida y vuelta: ${d.vuelo}€</p></div>
                        <div class="info-item"><p>⏱️ Duración aproximada: ${d.vuelo_tiempo}</p></div>
                        <button class="btn-naranja-full" onclick="window.open('https://www.skyscanner.es')">Reservar vuelo</button>
                    </div>
                    <div class="columna-viaje">
                        <h2>🏨 Hotel recomendado</h2>
                        <div class="info-item"><p>📍 ${d.hotel}</p></div>
                        <div class="info-item"><p>💰 Precio por noche: ${d.hotel_precio}€</p></div>
                        <div class="info-item"><p>💡 Tip: Reserva pronto para mejores precios</p></div>
                        <button class="btn-azul-full" onclick="window.open('${d.hotel_link}')">Reservar hotel</button>
                    </div>
                </div>`;
        }

        // --- LÓGICA DEL ITINERARIO ---
        const contenedor = document.getElementById('dias-itinerario');
        if (contenedor && d.itinerario) {

            // Esta función interna "limpia" el contenido si la IA manda objetos en vez de texto
            const formatearContenido = (valor) => {
                if (!valor) return "No disponible";

                let textoFinal = "";

                // 1. Si es un objeto (como el de Roma que te dio problemas)
                if (typeof valor === 'object' && !Array.isArray(valor)) {
                    if (valor.actividades && Array.isArray(valor.actividades)) {
                        // Extrae solo los nombres de los lugares de la lista de Roma
                        textoFinal = valor.actividades.map(a => a.lugar || a.actividad || "").join(", ");
                    } else {
                        // Coge el primer texto que encuentre dentro del objeto
                        textoFinal = valor.actividad || valor.descripcion || Object.values(valor).find(v => typeof v === 'string') || "";
                    }
                }
                // 2. Si es un array
                else if (Array.isArray(valor)) {
                    textoFinal = valor.join(", ");
                }
                // 3. Si ya es texto
                else {
                    textoFinal = String(valor);
                }

                // LIMPIEZA FINAL: Quita los asteriscos ** que pone la IA y limita longitud
                return textoFinal.replace(/\*\*/g, '').substring(0, 250);
            };

            // Pintar las cards del itinerario
            contenedor.innerHTML = d.itinerario.map(dia => `
                <div class="itinerario-card">
                    <h3>${dia.dia || 'Siguiente día'}</h3>
                    <div class="itinerario-bloque">
                        <p><strong>🌅 Mañana:</strong> ${formatearContenido(dia.manana)}</p>
                    </div>
                    <div class="itinerario-bloque">
                        <p><strong>🌇 Tarde:</strong> ${formatearContenido(dia.tarde)}</p>
                    </div>
                    <div class="itinerario-bloque">
                        <p><strong>🌙 Noche:</strong> ${formatearContenido(dia.noche)}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("❌ Error cargando el detalle del destino:", error);
    }
}

function mostrarOfertas(lista) {
    const container = document.getElementById('cards-hero');
    if (!container) return;
    container.innerHTML = lista.map(d => {
        if (d.precio) { // Diseño para rutas.json
            return `
                <div class="card">
                    <h3>${d.nombre}</h3>
                    <p><strong>${d.dias} días</strong></p>
                    <p>📅 ${d.fechas}</p>
                    <p>💰 ${d.precio}€</p>
                    <button class="btn" onclick="window.location='destino.html?slug=${d.slug}'">Ver ruta</button>
                </div>`;
        } else { // Diseño para destinos.json
            return `
                <div class="card">
                    <h3 style="color: #007bff;">${d.nombre}</h3>
                    <p><strong>${d.dias} días</strong></p>
                    <p>📅 ${d.fechas}</p>
                    <p>✈️ ${d.vuelo}€</p>
                    <p>🏨 ${d.hotel} (${d.hotel_precio}€)</p>
                    <button class="btn" onclick="window.location='destino.html?slug=${d.slug}'" style="background-color: #ff851b; border:none; color:white; padding:10px; border-radius:8px; cursor:pointer;">
                        Ver detalles
                    </button>
                </div>`;
        }
    }).join('');
}

function setActive(id) {
    const btns = document.querySelectorAll('.toggle-vistas button');
    btns.forEach(b => b.classList.remove('active'));
    if (document.getElementById(id)) document.getElementById(id).classList.add('active');
}