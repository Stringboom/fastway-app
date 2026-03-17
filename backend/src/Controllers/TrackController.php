<?php

declare(strict_types=1);

namespace Fastway\Controllers;

use Fastway\Http\Request;
use Fastway\Http\Response;
use Fastway\Services\FastwayApiClient;
use Fastway\Validation\Validator;

class TrackController
{
    public function __construct(
        private readonly Request  $request,
        private readonly Response $response
    ) {}

    public function track(): void
    {
        $label  = trim((string) $this->request->query('label', ''));
        $errors = Validator::validate(['label' => [$label, 'required|alphanumeric|min:8|max:30']]);

        if (!empty($errors)) {
            $this->response->error('Invalid tracking number. ' . implode(' ', $errors), 422);
            return;
        }

        try {
            $raw = (new FastwayApiClient())->trackParcel($label);
        } catch (\RuntimeException $e) {
            error_log('[Track] ' . $e->getMessage());
            $this->response->error($e->getMessage(), 503);
            return;
        }

        $result = $raw['result'] ?? $raw;
        $scans  = $result['Scans'] ?? [];

        if (empty($result['LabelNumber']) && empty($scans)) {
            $this->response->error('No tracking information found. Please check the number and try again.', 404);
            return;
        }

        $latest = $scans[0] ?? [];

        $this->response->success([
            'label'          => $result['LabelNumber'] ?? $label,
            'current_status' => $latest['StatusDescription'] ?? $latest['Description'] ?? 'No status available',
            'scan_type'      => $latest['Type'] ?? '',
            'delivered_to'   => $result['DistributedTo']   ?? null,
            'delivered_date' => $result['DistributedDate'] ?? null,
            'signature'      => $result['Signature']       ?? null,
            'reference'      => $result['Reference']       ?? null,
            'scans'          => $scans,
        ]);
    }
}
