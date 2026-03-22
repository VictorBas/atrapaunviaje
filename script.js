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


