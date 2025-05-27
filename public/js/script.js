  document.addEventListener('DOMContentLoaded', () => {
        const carte = document.getElementById('carte');
        const lat = parseFloat(carte.dataset.lat);
        const lon = parseFloat(carte.dataset.lon);
        const ville = carte.dataset.ville;

        const map = L.map('carte').setView([lat, lon], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Affiche un marqueur avec le nom de la ville
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`📍 ${ville}`)
            .openPopup();
    });


document.addEventListener('DOMContentLoaded', () => {
    const villeInput = document.getElementById('ville-input');
    const suggestionsBox = document.getElementById('suggestions');

    let debounceTimer;

    villeInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();

        if (searchTerm.length < 2) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/weather-suggestions?q=${encodeURIComponent(searchTerm)}`);

                if (!response.ok) {
                    throw new Error('Erreur réseau ou serveur');
                }

                const cities = await response.json();
                console.log('Suggestions reçues :', cities);

                if (cities.length > 0) {
                    suggestionsBox.innerHTML = cities
                        .map(city => `
                            <div class="suggestion-item" data-city="${city.name}">
                                ${city.name}${city.region ? `, ${city.region}` : ''} (${city.country})
                            </div>
                        `)
                        .join('');
                } else {
                    suggestionsBox.innerHTML = '<div class="suggestion-item">Aucun résultat</div>';
                }

                suggestionsBox.style.display = 'block';
            } catch (error) {
                console.error("Erreur lors de la récupération des suggestions :", error);
                suggestionsBox.innerHTML = '<div class="suggestion-item">Service indisponible</div>';
                suggestionsBox.style.display = 'block';
            }
        }, 300);
    });

    suggestionsBox.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
            villeInput.value = e.target.getAttribute('data-city');
            suggestionsBox.style.display = 'none';
            document.querySelector('.search-form').submit();
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== villeInput && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('ville') && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://api.weatherapi.com/v1/search.json?key={{ weather_api_key }}&q=${latitude},${longitude}`);
                const data = await response.json();

                if (data.length > 0) {
                    const ville = data[0].name;
                    window.location.href = `/?ville=${encodeURIComponent(ville)}`;
                }
            } catch (err) {
                console.error("Erreur de géolocalisation météo", err);
            }
        }, (error) => {
            console.warn("Géolocalisation refusée ou échouée", error);
        });
    }
});