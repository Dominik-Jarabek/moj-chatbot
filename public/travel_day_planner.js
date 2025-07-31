document.getElementById('searchBtn').addEventListener('click', async () => {
  const city = document.getElementById('city').value.trim();
  const results = document.getElementById('results');
  results.innerHTML = '';

  if (!city) {
    results.innerHTML = '<p>Zadejte město.</p>';
    return;
  }

  try {
    const response = await fetch('http://localhost:3333/api/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ city })
    });

    const data = await response.json();

    if (!response.ok) {
      results.innerHTML = `<p>Chyba: ${data.error}</p>`;
      return;
    }

    if (data.length === 0) {
      results.innerHTML = `<p>Žádná zajímavá místa pro "${city}" nebyla nalezena.</p>`;
      return;
    }

    data.forEach(place => {
      const div = document.createElement('div');
      div.className = 'place-item';
      div.innerHTML = `
        <strong>${place.name}</strong><br>
        📍 ${place.vicinity || 'Adresa neuvedena'}<br>
        ⭐️ ${place.rating || 'Nehodnoceno'}
      `;
      results.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    results.innerHTML = `<p>Došlo k chybě při načítání.</p>`;
  }
});

document.getElementById('locationBtn').addEventListener('click', () => {
  const results = document.getElementById('results');
  results.innerHTML = 'Načítám polohu...';

  if (!navigator.geolocation) {
    results.innerHTML = '<p>Geolokace není podporována vaším prohlížečem.</p>';
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    console.log("Odesílám polohu:", lat, lng);

    try {
      const response = await fetch('http://localhost:3333/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lng })
      });

      const data = await response.json();
      results.innerHTML = '';

      if (!response.ok) {
        results.innerHTML = `<p>Chyba: ${data.error}</p>`;
        return;
      }

      if (data.length === 0) {
        results.innerHTML = `<p>Ve vašem okolí nebyla nalezena žádná zajímavá místa.</p>`;
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

    } catch (error) {
      console.error(error);
      results.innerHTML = `<p>Došlo k chybě při načítání.</p>`;
    }
  }, () => {
    results.innerHTML = '<p>Nepodařilo se získat polohu.</p>';
  
  });
});