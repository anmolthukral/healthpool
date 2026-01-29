// Minimal Lynx-like page using plain JS and DOM (adapt to actual Lynx syntax if needed)

async function fetchHospitals(lat, lon, radius = 2000) {
  const q = `[out:json];(node[amenity=hospital](around:${radius},${lat},${lon});way[amenity=hospital](around:${radius},${lat},${lon});relation[amenity=hospital](around:${radius},${lat},${lon}););out center;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Overpass request failed');
  const data = await res.json();
  return data.elements || [];
}

function formatList(items) {
  return items
    .map((e) => {
      const name = (e.tags && (e.tags.name || e.tags.official_name)) || 'Unnamed Hospital';
      const lat = e.lat ?? (e.center && e.center.lat);
      const lon = e.lon ?? (e.center && e.center.lon);
      const addr = e.tags && (e.tags['addr:full'] || e.tags['addr:street'] || e.tags['addr:housenumber']) || '';
      return `<li><strong>${name}</strong>${addr ? ' — ' + addr : ''}<br/><small>${lat ? lat.toFixed(5) : ''}${lon ? ', ' + lon.toFixed(5) : ''}</small></li>`;
    })
    .join('');
}

function init() {
  const status = document.getElementById('status');
  const list = document.getElementById('hospitals');

  if (!navigator.geolocation) {
    status.textContent = 'Geolocation not supported.';
    return;
  }

  status.textContent = 'Requesting location...';
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      status.textContent = `Got location: ${lat.toFixed(4)}, ${lon.toFixed(4)} — searching nearby hospitals...`;
      try {
        const els = await fetchHospitals(lat, lon);
        if (!els.length) {
          list.innerHTML = '<li>No hospitals found nearby</li>';
        } else {
          list.innerHTML = formatList(els);
        }
        status.textContent = `Found ${els.length} result(s)`;
      } catch (err) {
        status.textContent = 'Error: ' + err.message;
      }
    },
    (err) => {
      status.textContent = 'Location error: ' + err.message;
    }
  );
}

window.addEventListener('DOMContentLoaded', init);
