<?php
/**
 * AminchiData - AlrahuzData API Client
 * Centralized client for calling the alrahuzdata.com.ng provider API.
 *
 * API Documentation: https://alrahuzdata.com.ng/documentation/
 * Authorization: API Key passed via "Authorization" header.
 */

/**
 * Send a request to the AlrahuzData API.
 *
 * @param string $method   HTTP method (GET or POST).
 * @param string $endpoint API endpoint path (e.g. "/api/data/").
 * @param array  $data     Request body for POST, or query parameters for GET.
 * @return array Decoded JSON response from the API.
 */
function alrahuzRequest(string $method, string $endpoint, array $data = []): array
{
    $config = require __DIR__ . '/../config/app.php';
    $baseUrl = rtrim($config['alrahuzdata']['base_url'], '/');
    $apiToken = $config['alrahuzdata']['api_token'];

    $url = $baseUrl . '/' . ltrim($endpoint, '/');

    $headers = [
        'Authorization: Token ' . $apiToken,
        'Accept: application/json',
    ];

    $ch = curl_init();

    if (strtoupper($method) === 'GET') {
        if (!empty($data)) {
            $url .= '?' . http_build_query($data);
        }
        curl_setopt($ch, CURLOPT_HTTPGET, true);
    } else {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $headers[] = 'Content-Type: application/json';
    }

    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 60,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return ['error' => 'Connection error: ' . $error, 'http_code' => 0];
    }

    $decoded = json_decode($response, true);
    if ($decoded === null) {
        return ['error' => 'Invalid response from provider.', 'http_code' => $httpCode, 'raw' => $response];
    }

    $decoded['http_code'] = $httpCode;
    return $decoded;
}

// ---------------------------------------------------------------------------
// User / Account
// ---------------------------------------------------------------------------

/**
 * Check authenticated user details on AlrahuzData.
 */
function alrahuzCheckUser(): array
{
    return alrahuzRequest('GET', '/api/user/');
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/**
 * Buy a data bundle via AlrahuzData.
 *
 * @param int    $network  Network ID (1=MTN, 2=Glo, 3=9mobile, 4=Airtel).
 * @param string $phone    Recipient phone number.
 * @param int    $planId   Data plan ID from the provider.
 * @return array
 */
function alrahuzBuyData(int $network, string $phone, int $planId): array
{
    return alrahuzRequest('POST', '/api/data/', [
        'network'      => $network,
        'mobile_number' => $phone,
        'plan'         => $planId,
        'Ported_number' => true,
    ]);
}

/**
 * Get all data transactions.
 */
function alrahuzGetDataTransactions(): array
{
    return alrahuzRequest('GET', '/api/data/');
}

/**
 * Query a specific data transaction.
 */
function alrahuzQueryDataTransaction(string $transactionId): array
{
    return alrahuzRequest('GET', '/api/data/' . urlencode($transactionId));
}

// ---------------------------------------------------------------------------
// Airtime
// ---------------------------------------------------------------------------

/**
 * Buy airtime top-up via AlrahuzData.
 *
 * @param int    $network  Network ID (1=MTN, 2=Glo, 3=9mobile, 4=Airtel).
 * @param string $phone    Recipient phone number.
 * @param int    $amount   Amount in Naira.
 * @return array
 */
function alrahuzBuyAirtime(int $network, string $phone, int $amount): array
{
    return alrahuzRequest('POST', '/api/topup/', [
        'network'       => $network,
        'mobile_number' => $phone,
        'amount'        => $amount,
        'Ported_number' => true,
        'airtime_type'  => 'VTU',
    ]);
}

/**
 * Get all airtime transactions.
 */
function alrahuzGetAirtimeTransactions(): array
{
    return alrahuzRequest('GET', '/api/topup/');
}

/**
 * Query a specific airtime transaction.
 */
function alrahuzQueryAirtimeTransaction(string $transactionId): array
{
    return alrahuzRequest('GET', '/api/topup/' . urlencode($transactionId));
}

// ---------------------------------------------------------------------------
// Education Pins (WAEC / NECO / NABTEB)
// ---------------------------------------------------------------------------

/**
 * Purchase an education PIN (result checker).
 *
 * @param int $examType  Exam type ID (1=WAEC, 2=NECO, 3=NABTEB).
 * @param int $quantity  Number of pins.
 * @return array
 */
function alrahuzBuyEducationPin(int $examType, int $quantity = 1): array
{
    return alrahuzRequest('POST', '/api/education/', [
        'exam_type' => $examType,
        'quantity'  => $quantity,
    ]);
}

// ---------------------------------------------------------------------------
// Electricity
// ---------------------------------------------------------------------------

/**
 * Validate a meter number.
 *
 * @param string $meterNumber The meter number to validate.
 * @param string $disco       Distribution company identifier.
 * @param string $meterType   "prepaid" or "postpaid".
 * @return array
 */
function alrahuzValidateMeter(string $meterNumber, string $disco, string $meterType): array
{
    return alrahuzRequest('GET', '/api/validatemeter/', [
        'meter_number' => $meterNumber,
        'disco'        => $disco,
        'meter_type'   => $meterType,
    ]);
}

/**
 * Buy electricity (bill payment).
 *
 * @param string $disco       Distribution company identifier.
 * @param string $meterNumber The meter number.
 * @param string $meterType   "prepaid" or "postpaid".
 * @param int    $amount      Amount in Naira.
 * @return array
 */
function alrahuzBuyElectricity(string $disco, string $meterNumber, string $meterType, int $amount): array
{
    return alrahuzRequest('POST', '/api/billpayment/', [
        'disco_name'   => $disco,
        'meter_number' => $meterNumber,
        'meter_type'   => $meterType,
        'amount'       => $amount,
    ]);
}

/**
 * Get all electricity/bill payment transactions.
 */
function alrahuzGetBillTransactions(): array
{
    return alrahuzRequest('GET', '/api/billpayment/');
}

/**
 * Query a specific bill payment transaction.
 */
function alrahuzQueryBillTransaction(string $transactionId): array
{
    return alrahuzRequest('GET', '/api/billpayment/' . urlencode($transactionId));
}

// ---------------------------------------------------------------------------
// Cable TV Subscription (DSTV, GOTV, Startimes)
// ---------------------------------------------------------------------------

/**
 * Validate an IUC (decoder) number.
 *
 * @param string $iucNumber   The decoder/smartcard number.
 * @param string $cableProvider Cable provider identifier (e.g. "dstv", "gotv", "startimes").
 * @return array
 */
function alrahuzValidateIUC(string $iucNumber, string $cableProvider): array
{
    return alrahuzRequest('GET', '/api/validateiuc/', [
        'smart_card_number' => $iucNumber,
        'cablename'         => $cableProvider,
    ]);
}

/**
 * Buy a cable TV subscription.
 *
 * @param string $cableProvider Cable provider identifier.
 * @param string $iucNumber     The decoder/smartcard number.
 * @param int    $planId        Cable plan ID from the provider.
 * @return array
 */
function alrahuzBuyCable(string $cableProvider, string $iucNumber, int $planId): array
{
    return alrahuzRequest('POST', '/api/cablesub/', [
        'cablename'         => $cableProvider,
        'smart_card_number' => $iucNumber,
        'cableplan'         => $planId,
    ]);
}

/**
 * Get all cable TV subscription transactions.
 */
function alrahuzGetCableTransactions(): array
{
    return alrahuzRequest('GET', '/api/cablesub/');
}

/**
 * Query a specific cable TV subscription transaction.
 */
function alrahuzQueryCableTransaction(string $transactionId): array
{
    return alrahuzRequest('GET', '/api/cablesub/' . urlencode($transactionId));
}
