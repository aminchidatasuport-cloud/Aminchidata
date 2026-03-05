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

    // AlrahuzData VTU API Provider (https://alrahuzdata.com.ng/documentation/)
    'alrahuzdata' => [
        'base_url'  => getenv('ALRAHUZDATA_BASE_URL') ?: 'https://alrahuzdata.com.ng',
        'api_token' => getenv('ALRAHUZDATA_API_TOKEN') ?: '',
    ],

    // Default wallet balance for new users (Naira)
    'default_wallet_balance' => 500.00,
];
