<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class AppExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('jour_fr', [$this, 'jourFrancais']),
        ];
    }

    public function jourFrancais(string $date): string
    {
        $jours = [
            'Monday' => 'Lundi',
            'Tuesday' => 'Mardi',
            'Wednesday' => 'Mercredi',
            'Thursday' => 'Jeudi',
            'Friday' => 'Vendredi',
            'Saturday' => 'Samedi',
            'Sunday' => 'Dimanche',
        ];

        $englishDay = date('l', strtotime($date));
        return $jours[$englishDay] ?? $englishDay;
    }
}
