document.getElementById('searchBtn').addEventListener('click', async () => {
  const city = document.getElementById('city').value.trim();
  const results = document.getElementById('results');
  results.innerHTML = '';

  if (!city) {
    results.innerHTML = '<p>Zadejte město.</p>';
    return;
  }

  try {
    const response = await fetch('/api/places', {
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

