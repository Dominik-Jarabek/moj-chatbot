let map;
let markers = [];

function initMap(lat = 50.0755, lng = 14.4378, zoom = 13) {
  if (map) {
    map.remove();
  }

  map = L.map('map').setView([lat, lng], zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap přispěvatelé'
  }).addTo(map);
}

function showMarkers(places) {
  markers.forEach(marker => marker.remove());
  markers = [];

  places.forEach(place => {
    const loc = place.geometry.location;
    const marker = L.marker([loc.lat, loc.lng])
      .addTo(map)
      .bindPopup(`<strong>${place.name}</strong><br>${place.vicinity || 'adresa neznámá'}`);
    markers.push(marker);
  });

  if (places.length) {
    const first = places[0].geometry.location;
    map.setView([first.lat, first.lng], 13);
  }
}

document.getElementById('searchBtn').addEventListener('click', async () => {
  const category = document.getElementById('category').value;
  console.log("🔎 Zvolená kategorie:", category);

  const cityInput = document.getElementById('city');
  const city = cityInput.value.trim();
  const results = document.getElementById('results');
  results.innerHTML = '';

  if (!city) {
    results.innerHTML = '<p>Zadejte město.</p>';
    return;
  }
  const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3333'
  : 'https://moj-chatbot.onrender.com';

  try {
    const response = await fetch(`${BASE_URL}/api/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, category })
    });

    const data = await response.json();

    if (!response.ok) {
      results.innerHTML = `<p>Chyba: ${data.error}</p>`;
      return;
    }

    if (data.length === 0) {
      results.innerHTML = `<p>Žádná místa v kategorii "${category}" nebyla nalezena pro "${city}".</p>`;
      return;
    }

    data.forEach(place => {
  const div = document.createElement('div');
  div.className = 'place-item';
  div.innerHTML = `
    <strong>${place.name}</strong><br>
    <span class="icon">📍</span> ${place.vicinity || 'Adresa neuvedena'}<br>
    <span class="icon">⭐</span> ${place.rating || 'Nehodnoceno'}
  `;
  
  results.appendChild(div); 
});

    const first = data[0]?.geometry?.location;
    if (first) initMap(first.lat, first.lng);
    showMarkers(data);

    cityInput.value = '';

  } catch (error) {
    console.error(error);
    results.innerHTML = `<p>Došlo k chybě při načítání.</p>`;
  }
});

document.getElementById('locationBtn').addEventListener('click', () => {
  const category = document.getElementById('category').value;
  console.log("📍 Hledání podle polohy, kategorie:", category);

  const results = document.getElementById('results');
  results.innerHTML = 'Načítám polohu...';

  if (!navigator.geolocation) {
    results.innerHTML = '<p>Geolokace není podporována vaším prohlížečem.</p>';
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    try {
      const response = await fetch(`${BASE_URL}/api/places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, category })
      });


      const data = await response.json();
      results.innerHTML = '';

      if (!response.ok) {
        results.innerHTML = `<p>Chyba: ${data.error}</p>`;
        return;
      }

      if (data.length === 0) {
        results.innerHTML = `<p>Ve vašem okolí nebyla nalezena žádná místa v kategorii "${category}".</p>`;
        return;
      }

      data.sort((a, b) => a.distance - b.distance);

      data.forEach(place => {
        const div = document.createElement('div');
        div.className = 'place-item';
        div.innerHTML = `
          <strong>${place.name}</strong><br>
          📍 ${place.vicinity || 'Adresa neuvedena'}<br>
          ⭐️ ${place.rating || 'Nehodnoceno'}<br>
          📏 ${(place.distance / 1000).toFixed(2)} km
        `;
        results.appendChild(div);
      });

      initMap(lat, lng);
      showMarkers(data);

    } catch (error) {
      console.error(error);
      results.innerHTML = `<p>Došlo k chybě při načítání.</p>`;
    }
  }, () => {
    results.innerHTML = '<p>Nepodařilo se získat polohu.</p>';
  });
});

document.getElementById('city').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('searchBtn').click();
    document.getElementById('city').value = '';
  }
});
