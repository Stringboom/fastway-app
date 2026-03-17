<?php

declare(strict_types=1);

namespace Fastway\Controllers;

use Fastway\Http\Request;
use Fastway\Http\Response;
use Fastway\Services\FastwayApiClient;
use Fastway\Validation\Validator;

class QuoteController
{
    public function __construct(
        private readonly Request  $request,
        private readonly Response $response
    ) {}

    public function quote(): void
    {
        $suburb   = trim(strip_tags((string) $this->request->query('suburb',   '')));
        $postcode = trim(strip_tags((string) $this->request->query('postcode', '')));
        $weight   = trim((string) $this->request->query('weight', ''));
        $length   = trim((string) $this->request->query('length', ''));
        $width    = trim((string) $this->request->query('width',  ''));
        $height   = trim((string) $this->request->query('height', ''));

        $errors = Validator::validate([
            'suburb'   => [$suburb,   'required|alpha_space|min:2|max:100'],
            'postcode' => [$postcode, 'required|numeric|length:4'],
            'weight'   => [$weight,   'required|positive_float|max_value:30'],
        ]);

        if (!empty($errors)) {
            $this->response->error('Validation failed: ' . implode(' ', $errors), 422);
            return;
        }

        $dimL    = ($length !== '' && is_numeric($length) && (float) $length > 0) ? (float) $length : null;
        $dimW    = ($width  !== '' && is_numeric($width)  && (float) $width  > 0) ? (float) $width  : null;
        $dimH    = ($height !== '' && is_numeric($height) && (float) $height > 0) ? (float) $height : null;
        $hasDims = ($dimL !== null && $dimW !== null && $dimH !== null);

        try {
            $raw = (new FastwayApiClient())->getQuote($suburb, $postcode, (float) $weight,
                $hasDims ? $dimL : null, $hasDims ? $dimW : null, $hasDims ? $dimH : null);
        } catch (\RuntimeException $e) {
            error_log('[Quote] ' . $e->getMessage());
            $this->response->error($e->getMessage(), 503);
            return;
        }

        $result = $raw['result'] ?? [];

        if (!empty($result['multiple_regions'])) {
            $first = $result['regions'][0] ?? null;

            if ($first === null) {
                $this->response->error('No shipping services found for this destination.', 404);
                return;
            }

            try {
                $raw = (new FastwayApiClient())->getQuote($first['Suburb'], $first['DestPostcode'],
                    (float) $weight, $hasDims ? $dimL : null, $hasDims ? $dimW : null, $hasDims ? $dimH : null);
                $result = $raw['result'] ?? [];
            } catch (\RuntimeException $e) {
                error_log('[Quote retry] ' . $e->getMessage());
                $this->response->error($e->getMessage(), 503);
                return;
            }
        }

        $services = $result['services'] ?? [];

        if (empty($services)) {
            $this->response->error('No shipping services available for this destination.', 404);
            return;
        }

        $this->response->success([
            'suburb'                  => $suburb,
            'postcode'                => $postcode,
            'weight'                  => (float) $weight,
            'has_dimensions'          => $hasDims,
            'from'                    => $result['from']                    ?? null,
            'to'                      => $result['to']                      ?? null,
            'delivery_franchise'      => $result['delfranchise']            ?? null,
            'pickup_franchise'        => $result['pickfranchise']           ?? null,
            'delivery_timeframe_days' => $result['delivery_timeframe_days'] ?? null,
            'services'                => $services,
        ]);
    }
}
