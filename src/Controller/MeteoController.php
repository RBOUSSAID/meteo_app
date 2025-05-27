<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MeteoController extends AbstractController
{
    private HttpClientInterface $client;
    private string $apiKey;

    public function __construct(HttpClientInterface $client, string $apiKey)
    {
        $this->client = $client;
        $this->apiKey = $apiKey;
    }

    #[Route('/', name: 'app_meteo')]
    public function index(Request $request): Response
    {
        // Récupération ville depuis ?ville=... ou Paris par défaut
        $ville = $request->query->get('ville');

        // Si aucune ville n’est fournie (ex : première visite), fallback sur Paris
        if (!$ville || !preg_match('/^[a-zA-ZÀ-ÿ\s\-]+$/u', $ville)) {
            $ville = 'Paris';
        }


        try {
            $response = $this->client->request(
                'GET',
                "https://api.weatherapi.com/v1/forecast.json?key={$this->apiKey}&q={$ville}&days=3&lang=fr"
            );

            $data = $response->toArray();
        } catch (\Exception $e) {
            return $this->render('meteo/error.html.twig', [
                'message' => 'Impossible de récupérer les données météo.',
            ]);
        }

        return $this->render('meteo/index.html.twig', [
            'ville' => $ville,
            'ville_normalisee' => $data['location']['name'], // ← nom retourné par l'API
            'meteo' => $data['current'],
            'previsions' => $data['forecast']['forecastday'],
            'lat' => $data['location']['lat'],
            'lon' => $data['location']['lon'],
            'weather_api_key' => $this->apiKey, // Clé stockée dans services.yaml
        ]);
    }


    // src/Controller/ApiController.php
#[Route('/api/weather-suggestions', name: 'api_weather_suggestions', methods: ['GET'])]
public function getSuggestions(Request $request): JsonResponse
{
    $query = $request->query->get('q', '');
    $response = file_get_contents(
        "https://api.weatherapi.com/v1/search.json?key={$this->apiKey}&q={$query}"
    );
    return new JsonResponse(json_decode($response, true));
}
}
