<?php
/**
 * AminchiData - Application Configuration
 * Contains app settings, payment gateway keys, and API credentials.
 */

return [
    'name'     => 'AminchiData',
    'url'      => getenv('APP_URL') ?: 'http://localhost',
    'debug'    => (bool)(getenv('APP_DEBUG') ?: false),
    'timezone' => 'Africa/Lagos',

    // Session settings
    'session' => [
        'lifetime' => 120, // minutes
        'name'     => 'aminchidata_session',
    ],

    // Payment Gateway – Paystack (https://paystack.com)
    'paystack' => [
        'public_key' => getenv('PAYSTACK_PUBLIC_KEY') ?: '',
        'secret_key' => getenv('PAYSTACK_SECRET_KEY') ?: '',
        'base_url'   => 'https://api.paystack.co',
    ],

    // Payment Gateway – Flutterwave (https://flutterwave.com)
    'flutterwave' => [
        'public_key' => getenv('FLW_PUBLIC_KEY') ?: '',
        'secret_key' => getenv('FLW_SECRET_KEY') ?: '',
        'base_url'   => 'https://api.flutterwave.com/v3',
    ],

    // VTU API Provider (e.g. VTpass, SMEPlug, etc.)
    'vtu_api' => [
        'base_url' => getenv('VTU_API_URL') ?: '',
        'api_key'  => getenv('VTU_API_KEY') ?: '',
        'secret'   => getenv('VTU_API_SECRET') ?: '',
    ],

    // Katpay Virtual Account (https://katpay.co)
    'katpay' => [
        'api_key'     => getenv('KATPAY_API_KEY')     ?: 'pk_live_uCqPx30OJ8B7zX3OILvO68GfhmQAzQQUtvEfYt6LE8EtnPxTBqVN3EnsyakByIdd',
        'api_secret'  => getenv('KATPAY_API_SECRET')  ?: 'eyJpdiI6ImxOMjBCNDJZVDJRZ2loMlk5QXlBT1E9PSIsInZhbHVlIjoiaTlSdVVhQmdaVlBDdkY0TkZ3U1JILzh5eEwwVk1YQnQ1Q3JVK2Y0V0Q3UkdzU3lGZlBsVUNhTVpLRTBRVnI3My9YQlNock1PbklqNUdWbThjaVNPMnNiYzk2YkpsTU9uZW5BQTIzRmRPNVJ5ZGU1NUpDd3JlTXFmQm5Ra3Myd1giLCJtYWMiOiI5YzlmMzIwN2Y5N2FhNWY0MDIxNjE1M2Y5MjRiYmU5ODgxZGEzZWE0NWRkM2I1MTFlOTYwODQ3MTcyMGRhZDFlIiwidGFnIjoiIn0=',
        'merchant_id' => getenv('KATPAY_MERCHANT_ID') ?: 'KAT6864100503',
        'base_url'    => 'https://api.katpay.co/v1',
        'bank_codes'  => ['PALMPAY'],
    ],

    // Default wallet balance for new users (Naira)
    'default_wallet_balance' => 500.00,
];
