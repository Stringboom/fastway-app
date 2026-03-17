<?php

declare(strict_types=1);

namespace Fastway\Services;

use RuntimeException;

class FastwayApiClient
{
    private const COUNTRY_CODE_SA = 24;

    private string $baseUrl;
    private string $apiKey;
    private string $rfCode;

    public function __construct()
    {
        $this->baseUrl = rtrim(getenv('FASTWAY_API_BASE') ?: 'https://sa.api.fastway.org/latest', '/');
        $this->apiKey  = getenv('FASTWAY_API_KEY') ?: '';
        $this->rfCode  = getenv('FASTWAY_RFC_CODE') ?: 'JNB';

        if (empty($this->apiKey)) {
            throw new RuntimeException('FASTWAY_API_KEY is not configured.');
        }
    }

    public function trackParcel(string $label): array
    {
        return $this->get('/tracktrace/detail/' . rawurlencode($label) . '/' . self::COUNTRY_CODE_SA);
    }

    public function getQuote(
        string $suburb,
        string $postcode,
        float  $weight,
        ?float $length = null,
        ?float $width  = null,
        ?float $height = null
    ): array {
        $params = [
            'RFCode'               => $this->rfCode,
            'Suburb'               => $suburb,
            'DestPostcode'         => $postcode,
            'WeightInKg'           => $weight,
            'AllowMultipleRegions' => 'true',
        ];

        if ($length !== null && $width !== null && $height !== null) {
            $params['LengthInCm'] = $length;
            $params['WidthInCm']  = $width;
            $params['HeightInCm'] = $height;
        }

        return $this->get('/psc/lookup?' . http_build_query($params));
    }

    public function listSuburbs(string $term): array
    {
        return $this->get('/psc/listdeliverysuburbs/' . $this->rfCode . '/' . rawurlencode($term));
    }

    private function get(string $path): array
    {
        $sep = str_contains($path, '?') ? '&' : '?';
        $url = $this->baseUrl . $path . $sep . 'api_key=' . urlencode($this->apiKey);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_HTTPHEADER     => ['Accept: application/json'],
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 3,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $body     = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        if ($curlErr) {
            throw new RuntimeException("Network error: {$curlErr}");
        }
        if ($httpCode === 0) {
            throw new RuntimeException('No response from Fastway API — check your connection.');
        }
        if ($httpCode >= 500) {
            throw new RuntimeException("Fastway API unavailable (HTTP {$httpCode}). Please try again shortly.");
        }

        $data = json_decode($body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('Unexpected response from Fastway API.');
        }

        return $data ?? [];
    }
}
