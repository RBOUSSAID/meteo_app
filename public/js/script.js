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

    // Délai pour éviter trop de requêtes (debounce)
    let debounceTimer;

    // Écoute la saisie de l'utilisateur
    villeInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.trim();

        // On ignore si moins de 2 caractères
        if (searchTerm.length < 2) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
            return;
        }

        // On attend 300ms après la dernière frappe
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            try {
                // 1. Appel à WeatherAPI pour les suggestions
                const response = await fetch(`/api/weather-suggestions?q=${encodeURIComponent(searchTerm)}`)
                    .then(response => response.json())
                    .then(data => console.log(data));
                const cities = await response.json();

                // 2. Affichage des suggestions
                if (cities.length > 0) {
                    suggestionsBox.innerHTML = cities
                        .map(city => `
                            <div class="suggestion-item" data-city="${city.name}">
                                ${city.name}${city.region ? `, ${city.region}` : ''} (${city.country})
                            </div>
                        `)
                        .join('');
                    suggestionsBox.style.display = 'block';
                } else {
                    suggestionsBox.innerHTML = '<div class="suggestion-item">Aucun résultat</div>';
                    suggestionsBox.style.display = 'block';
                }
            } catch (error) {
                console.error("Erreur API :", error);
                suggestionsBox.innerHTML = '<div class="suggestion-item">Service indisponible</div>';
                suggestionsBox.style.display = 'block';
            }
        }, 300);
    });

    // 3. Clic sur une suggestion → remplit le champ
    suggestionsBox.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
            villeInput.value = e.target.getAttribute('data-city'); // Format parfait pour WeatherAPI
            suggestionsBox.style.display = 'none';
            // Optionnel : Soumission auto du formulaire
            document.querySelector('.search-form').submit();
        }
    });

    // 4. Cacher les suggestions si clic ailleurs
    document.addEventListener('click', (e) => {
        if (e.target !== villeInput) {
            suggestionsBox.style.display = 'none';
        }
    });
});



    