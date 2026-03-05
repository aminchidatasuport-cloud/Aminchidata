/**
 * AminchiData - data.js
 * Buy Data page logic
 */

const DATA_PLANS = {
  MTN: {
    SME: [
      { id: 500, name: '500MB', size: '0.5 GB', validity: '7 days', price: 340 },
      { id: 583, name: '1GB', size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 7, name: '1GB', size: '1.0 GB', validity: '7 days', price: 780 },
      { id: 467, name: '1.5GB', size: '1.5 GB', validity: '7 days', price: 965 },
      { id: 501, name: '1GB', size: '1.0 GB', validity: '21-30 days', price: 500 },
      { id: 573, name: '2GB', size: '2.0 GB', validity: '21-30 days', price: 900 },
      { id: 572, name: '3GB', size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 8, name: '2GB', size: '2.0 GB', validity: '30 days', price: 1450 },
      { id: 538, name: '5GB', size: '5.0 GB', validity: '3 weeks', price: 1800 },
      { id: 44, name: '3.5GB', size: '3.5 GB', validity: '30 days', price: 2450 },
      { id: 219, name: '500MB', size: '500.0 MB', validity: '7 days', price: 485 },
      { id: 539, name: '20GB', size: '20.0 GB', validity: '30 days', price: 7300 },
    ],
    SME2: [
      { id: 590, name: '500MB', size: '0.5 GB', validity: '7 days', price: 340 },
      { id: 587, name: '1GB', size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 562, name: '1GB', size: '1.0 GB', validity: '21-30 days', price: 500 },
      { id: 509, name: '2.5GB', size: '2.5 GB', validity: '1 day', price: 740 },
      { id: 319, name: '1GB', size: '1.0 GB', validity: '7 days +5min', price: 780 },
      { id: 481, name: '2GB', size: '2.0 GB', validity: '14-21 days', price: 900 },
      { id: 314, name: '2GB', size: '2.0 GB', validity: '1 month', price: 1450 },
      { id: 465, name: '3.5GB', size: '3.5 GB', validity: '7 days', price: 1480 },
      { id: 482, name: '3GB', size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 503, name: '5GB', size: '5.0 GB', validity: '3 weeks', price: 1800 },
      { id: 310, name: '3.5GB', size: '3.5 GB', validity: '1 month', price: 2450 },
      { id: 466, name: '4.2GB', size: '4.2 GB', validity: '1 month', price: 2910 },
      { id: 308, name: '7GB', size: '7.0 GB', validity: '1 month', price: 3450 },
      { id: 315, name: '10GB', size: '10.0 GB', validity: '1 month', price: 4400 },
      { id: 512, name: '20GB', size: '20.0 GB', validity: '7 days', price: 4900 },
      { id: 463, name: '12.5GB', size: '12.5 GB', validity: '1 month', price: 5350 },
      { id: 464, name: '16.5GB', size: '16.5 GB', validity: '1 month', price: 6300 },
      { id: 635, name: '34GB', size: '34.0 GB', validity: '30 days', price: 9800 },
      { id: 473, name: '36GB', size: '36.0 GB', validity: '30 days', price: 10800 },
      { id: 474, name: '65GB', size: '65.0 GB', validity: '30 days', price: 15500 },
      { id: 475, name: '75GB', size: '75.0 GB', validity: '30 days', price: 17450 },
      { id: 506, name: '90GB', size: '90.0 GB', validity: '60 days', price: 24500 },
      { id: 476, name: '165GB', size: '165.0 GB', validity: '30 days', price: 35880 },
      { id: 504, name: '250GB', size: '250.0 GB', validity: '30 days', price: 53500 },
      { id: 576, name: '800GB', size: '800.0 GB', validity: '365 days', price: 123000 },
      { id: 616, name: '1GB', size: '1.0 GB', validity: '1 day (no sms)', price: 200 },
      { id: 637, name: '1GB', size: '1.0 GB', validity: '1 day', price: 220 },
      { id: 607, name: '1GB', size: '1.0 GB', validity: '3 days (social)', price: 291 },
      { id: 609, name: '2GB', size: '2.0 GB', validity: '7 days (TikTok)', price: 390 },
      { id: 623, name: '750MB', size: '750.0 MB', validity: '3 days +1hr YT/IG', price: 441 },
      { id: 518, name: '2.5GB', size: '2.5 GB', validity: '1 day', price: 520 },
      { id: 629, name: '3.5GB', size: '3.5 GB', validity: '1 day', price: 970 },
      { id: 631, name: '4GB', size: '4.0 GB', validity: '2 days', price: 1164 },
      { id: 611, name: '200MB', size: '200.0 MB', validity: '1 day (social)', price: 120 },
    ],
    GIFTING: [
      { id: 638, name: '1GB', size: '1.0 GB', validity: '1 day', price: 200 },
      { id: 614, name: '1GB', size: '1.0 GB', validity: '1 day', price: 220 },
      { id: 589, name: '500MB', size: '0.5 GB', validity: '7 days', price: 340 },
      { id: 586, name: '1GB', size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 408, name: '75MB', size: '75.0 MB', validity: '1 day', price: 80 },
      { id: 443, name: '110MB', size: '110.0 MB', validity: '1 day', price: 96 },
      { id: 610, name: '200MB', size: '200.0 MB', validity: '1 day (social)', price: 120 },
      { id: 445, name: '230MB', size: '230.0 MB', validity: '1 day', price: 195 },
      { id: 606, name: '1GB', size: '1.0 GB', validity: '3 days (social)', price: 291 },
      { id: 403, name: '1GB', size: '1.0 GB', validity: '1 day +5min', price: 485 },
      { id: 575, name: '1GB', size: '1.0 GB', validity: '21 days-monthly', price: 500 },
      { id: 617, name: '2.5GB', size: '2.5 GB', validity: '1 day', price: 520 },
      { id: 412, name: '1.5GB', size: '1.5 GB', validity: '2 days', price: 590 },
      { id: 622, name: '750MB', size: '750.0 MB', validity: '3 days +1hr YT/IG', price: 441 },
      { id: 510, name: '2.5GB', size: '2.5 GB', validity: '1 day', price: 740 },
      { id: 409, name: '2.5GB', size: '2.5 GB', validity: '1 day', price: 750 },
      { id: 410, name: '2GB', size: '2.0 GB', validity: '2 days', price: 750 },
      { id: 441, name: '1GB', size: '1.0 GB', validity: '7 days +25min', price: 785 },
      { id: 580, name: '2GB', size: '2.0 GB', validity: '21-30 days', price: 900 },
      { id: 378, name: '3.2GB', size: '3.2 GB', validity: '2 days', price: 970 },
      { id: 627, name: '3.5GB', size: '3.5 GB', validity: '1 day', price: 970 },
      { id: 630, name: '4GB', size: '4.0 GB', validity: '2 days', price: 1164 },
      { id: 571, name: '3GB', size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 451, name: '2GB', size: '2.0 GB', validity: '30 days', price: 1450 },
      { id: 633, name: '5.5GB', size: '5.5 GB', validity: '2 days', price: 1480 },
      { id: 570, name: '5GB', size: '5.0 GB', validity: '3 weeks', price: 1800 },
      { id: 404, name: '6GB', size: '6.0 GB', validity: '7 days', price: 2450 },
      { id: 453, name: '3.5GB', size: '3.5 GB', validity: '30 days', price: 2450 },
      { id: 419, name: '4.2GB', size: '4.2 GB', validity: '30 days +5min', price: 2910 },
      { id: 379, name: '11GB', size: '11.0 GB', validity: '7 days', price: 3450 },
      { id: 456, name: '7GB', size: '7.0 GB', validity: '30 days +2gb night', price: 3450 },
      { id: 420, name: '10GB', size: '10.0 GB', validity: '30 days +15min', price: 4450 },
      { id: 513, name: '20GB', size: '20.0 GB', validity: '7 days', price: 4900 },
      { id: 413, name: '11GB', size: '11.0 GB', validity: '30 days +25min', price: 5000 },
      { id: 414, name: '16.5GB', size: '16.5 GB', validity: '30 days +25min', price: 6480 },
      { id: 458, name: '20GB', size: '20.0 GB', validity: '30 days', price: 7300 },
      { id: 417, name: '25GB', size: '25.0 GB', validity: '30 days', price: 8950 },
      { id: 634, name: '34GB', size: '34.0 GB', validity: '30 days', price: 9800 },
      { id: 405, name: '75GB', size: '75.0 GB', validity: '30 days', price: 17500 },
      { id: 406, name: '200GB', size: '200.0 GB', validity: '60 days', price: 49500 },
      { id: 577, name: '800GB', size: '800.0 GB', validity: '365 days', price: 123000 },
      { id: 608, name: '2GB', size: '2.0 GB', validity: '7 days (TikTok)', price: 390 },
    ],
    'CORPORATE GIFTING': [
      { id: 497, name: '500MB', size: '500.0 MB', validity: '7 days', price: 340 },
      { id: 584, name: '1GB', size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 498, name: '1GB', size: '1.0 GB', validity: '21 days-monthly', price: 500 },
      { id: 479, name: '2GB', size: '2.0 GB', validity: '21-30 days', price: 900 },
      { id: 480, name: '3GB', size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 502, name: '5GB', size: '5.0 GB', validity: '3 weeks', price: 1800 },
    ],
    'DATA COUPONS': [
      { id: 639, name: '1GB', size: '1.0 GB', validity: '1 day', price: 200 },
      { id: 615, name: '1GB', size: '1.0 GB', validity: '1 day', price: 220 },
      { id: 591, name: '500MB', size: '0.5 GB', validity: '7 days', price: 340 },
      { id: 588, name: '1GB', size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 462, name: '75MB', size: '75.0 MB', validity: '1 day', price: 80 },
      { id: 444, name: '110MB', size: '110.0 MB', validity: '1 day', price: 96 },
      { id: 446, name: '230MB', size: '230.0 MB', validity: '1 day', price: 195 },
      { id: 624, name: '750MB', size: '750.0 MB', validity: '3 days +1hr YT/IG', price: 441 },
      { id: 429, name: '1GB', size: '1.0 GB', validity: '1 day +5min', price: 485 },
      { id: 574, name: '1GB', size: '1.0 GB', validity: '21-30 days', price: 500 },
      { id: 619, name: '2.5GB', size: '2.5 GB', validity: '1 day', price: 520 },
      { id: 430, name: '1.5GB', size: '1.5 GB', validity: '2 days', price: 590 },
      { id: 511, name: '2.5GB', size: '2.5 GB', validity: '1 day', price: 740 },
      { id: 431, name: '2GB', size: '2.0 GB', validity: '2 days', price: 750 },
      { id: 433, name: '2.5GB', size: '2.5 GB', validity: '1 day', price: 750 },
      { id: 442, name: '1GB', size: '1.0 GB', validity: '7 days +25min', price: 785 },
      { id: 432, name: '2.5GB', size: '2.5 GB', validity: '2 days', price: 900 },
      { id: 581, name: '2GB', size: '2.0 GB', validity: '14-21 days', price: 900 },
      { id: 343, name: '3.2GB', size: '3.2 GB', validity: '2 days', price: 970 },
      { id: 628, name: '3.5GB', size: '3.5 GB', validity: '1 day', price: 970 },
      { id: 632, name: '4GB', size: '4.0 GB', validity: '2 days', price: 1164 },
      { id: 582, name: '3GB', size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 452, name: '2GB', size: '2.0 GB', validity: '30 days', price: 1450 },
      { id: 579, name: '5GB', size: '5.0 GB', validity: '3 weeks', price: 1800 },
      { id: 434, name: '6GB', size: '6.0 GB', validity: '7 days', price: 2450 },
      { id: 454, name: '3.5GB', size: '3.5 GB', validity: '30 days', price: 2450 },
      { id: 438, name: '4.2GB', size: '4.2 GB', validity: '30 days +5min', price: 2950 },
      { id: 440, name: '11GB', size: '11.0 GB', validity: '7 days', price: 3450 },
      { id: 457, name: '7GB', size: '7.0 GB', validity: '30 days +2gb night', price: 3450 },
      { id: 407, name: '10GB', size: '10.0 GB', validity: '30 days +15min', price: 4450 },
      { id: 514, name: '20GB', size: '20.0 GB', validity: '7 days', price: 4900 },
      { id: 455, name: '16.5GB', size: '16.5 GB', validity: '30 days +10min', price: 6480 },
      { id: 416, name: '20GB', size: '20.0 GB', validity: '30 days', price: 7300 },
      { id: 459, name: '25GB', size: '25.0 GB', validity: '30 days', price: 8950 },
      { id: 636, name: '34GB', size: '34.0 GB', validity: '30 days', price: 9800 },
      { id: 507, name: '90GB', size: '90.0 GB', validity: '60 days', price: 24500 },
      { id: 505, name: '250GB', size: '250.0 GB', validity: '30 days', price: 53500 },
      { id: 578, name: '800GB', size: '800.0 GB', validity: '365 days', price: 123000 },
    ],
    'DATA SHARE': [
      { id: 566, name: '500MB', size: '500.0 MB', validity: '7 days', price: 340 },
      { id: 585, name: '1GB', size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 567, name: '1GB', size: '1.0 GB', validity: '21 days-monthly', price: 500 },
      { id: 568, name: '2GB', size: '2.0 GB', validity: '21-30 days', price: 900 },
      { id: 569, name: '3GB', size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 330, name: '5GB', size: '5.0 GB', validity: '3 weeks', price: 1800 },
    ],
  },
  Airtel: {
    GIFTING: [
      { id: 436, name: '150MB', size: '150.0 MB', validity: '1 day', price: 55 },
      { id: 556, name: '150MB', size: '150.0 MB', validity: '1 day', price: 55 },
      { id: 560, name: '300MB', size: '300.0 MB', validity: '2 days', price: 98 },
      { id: 558, name: '600MB', size: '600.0 MB', validity: '2 days', price: 196 },
      { id: 483, name: '1GB', size: '1.0 GB', validity: '3 days (social)', price: 292 },
      { id: 592, name: '1.5GB', size: '1.5 GB', validity: '1 day', price: 395 },
      { id: 598, name: '3.2GB', size: '3.2 GB', validity: '3 days', price: 490 },
      { id: 596, name: '2GB', size: '2.0 GB', validity: '2 days', price: 575 },
      { id: 552, name: '3GB', size: '3.0 GB', validity: '1 day', price: 735 },
      { id: 600, name: '6.5GB', size: '6.5 GB', validity: '7 days', price: 990 },
      { id: 594, name: '5GB', size: '5.0 GB', validity: '7 days', price: 1450 },
      { id: 602, name: '8GB', size: '8.0 GB', validity: '30 days', price: 1950 },
      { id: 427, name: '10GB', size: '10.0 GB', validity: '30 days', price: 2940 },
      { id: 485, name: '13GB', size: '13.0 GB', validity: '30 days (MIFI)', price: 49800 },
      { id: 604, name: '60GB', size: '60.0 GB', validity: '60 days', price: 97000 },
      { id: 487, name: '35GB', size: '35.0 GB', validity: '30 days (MIFI)', price: 99500 },
      { id: 489, name: '60GB', size: '60.0 GB', validity: '30 days (MIFI)', price: 1490000 },
    ],
    SME: [
      { id: 437, name: '150MB', size: '150.0 MB', validity: '1 day', price: 55 },
      { id: 557, name: '150MB', size: '150.0 MB', validity: '1 day', price: 55 },
      { id: 561, name: '300MB', size: '300.0 MB', validity: '2 days', price: 98 },
      { id: 559, name: '600MB', size: '600.0 MB', validity: '2 days', price: 196 },
      { id: 484, name: '1GB', size: '1.0 GB', validity: '3 days (social)', price: 292 },
      { id: 593, name: '1.5GB', size: '1.5 GB', validity: '1 day', price: 395 },
      { id: 599, name: '3.2GB', size: '3.2 GB', validity: '3 days', price: 490 },
      { id: 597, name: '2GB', size: '2.0 GB', validity: '2 days', price: 575 },
      { id: 553, name: '3GB', size: '3.0 GB', validity: '2 days', price: 735 },
      { id: 601, name: '6.5GB', size: '6.5 GB', validity: '7 days', price: 990 },
      { id: 595, name: '5GB', size: '5.0 GB', validity: '7 days', price: 1460 },
      { id: 603, name: '8GB', size: '8.0 GB', validity: '30 days', price: 1950 },
      { id: 428, name: '10GB', size: '10.0 GB', validity: '30 days', price: 2940 },
      { id: 486, name: '13GB', size: '13.0 GB', validity: '30 days (MIFI)', price: 49800 },
      { id: 605, name: '60GB', size: '60.0 GB', validity: '60 days', price: 97000 },
      { id: 488, name: '35GB', size: '35.0 GB', validity: '30 days (MIFI)', price: 99500 },
      { id: 490, name: '60GB', size: '60.0 GB', validity: '30 days (MIFI)', price: 14900 },
    ],
    'CORPORATE GIFTING': [
      { id: 525, name: '75MB', size: '75.0 MB', validity: '1 day', price: 75 },
      { id: 526, name: '100MB', size: '100.0 MB', validity: '1 day', price: 100 },
      { id: 527, name: '200MB', size: '200.0 MB', validity: '2 days', price: 200 },
      { id: 528, name: '300MB', size: '300.0 MB', validity: '2 days', price: 298 },
      { id: 515, name: '500MB', size: '500.0 MB', validity: '7 days', price: 490 },
      { id: 516, name: '1GB', size: '1.0 GB', validity: '7 days', price: 784 },
      { id: 517, name: '2GB', size: '2.0 GB', validity: '30 days', price: 1450 },
      { id: 518, name: '3GB', size: '3.0 GB', validity: '30 days', price: 1950 },
      { id: 519, name: '4GB', size: '4.0 GB', validity: '30 days', price: 2460 },
      { id: 520, name: '8GB', size: '8.0 GB', validity: '30 days', price: 2950 },
      { id: 521, name: '10GB', size: '10.0 GB', validity: '30 days', price: 3910 },
      { id: 522, name: '13GB', size: '13.0 GB', validity: '30 days', price: 4900 },
      { id: 523, name: '18GB', size: '18.0 GB', validity: '30 days', price: 5870 },
      { id: 524, name: '25GB', size: '25.0 GB', validity: '30 days', price: 7820 },
      { id: 529, name: '35GB', size: '35.0 GB', validity: '30 days', price: 97500 },
      { id: 530, name: '60GB', size: '60.0 GB', validity: '30 days', price: 14600 },
      { id: 535, name: '100GB', size: '100.0 GB', validity: '30 days', price: 19500 },
    ],
  },
  Glo: {
    GIFTING: [
      { id: 351, name: '1.5GB', size: '1.5 GB', validity: '1 day (Awoof)', price: 295 },
      { id: 352, name: '2.5GB', size: '2.5 GB', validity: '2 days', price: 485 },
      { id: 546, name: '3.5GB', size: '3.5 GB', validity: '7 days', price: 1000 },
      { id: 354, name: '10GB', size: '10.0 GB', validity: '7 days (Awoof)', price: 1950 },
      { id: 548, name: '8.5GB', size: '8.5 GB', validity: '7 days', price: 2000 },
      { id: 550, name: '20.5GB', size: '20.5 GB', validity: '7 days', price: 4850 },
    ],
    SME: [
      { id: 369, name: '1.5GB', size: '1.5 GB', validity: '1 day', price: 295 },
      { id: 370, name: '2.5GB', size: '2.5 GB', validity: '2 days', price: 485 },
      { id: 547, name: '3.5GB', size: '3.5 GB', validity: '7 days', price: 1000 },
      { id: 371, name: '10GB', size: '10.0 GB', validity: '7 days', price: 1950 },
      { id: 549, name: '8.5GB', size: '8.5 GB', validity: '7 days', price: 2000 },
      { id: 551, name: '20.5GB', size: '20.5 GB', validity: '7 days', price: 4850 },
    ],
    'CORPORATE GIFTING': [
      { id: 291, name: '200MB', size: '200.0 MB', validity: '30 days', price: 84 },
      { id: 290, name: '500MB', size: '500.0 MB', validity: '30 days', price: 199 },
      { id: 564, name: '1GB', size: '1.0 GB', validity: '3 days', price: 245 },
      { id: 563, name: '1GB', size: '1.0 GB', validity: '7 days', price: 280 },
      { id: 285, name: '1GB', size: '1.0 GB', validity: '30 days', price: 399 },
      { id: 621, name: '3GB', size: '3.0 GB', validity: '3 days', price: 720 },
      { id: 286, name: '2GB', size: '2.0 GB', validity: '30 days', price: 798 },
      { id: 620, name: '3GB', size: '3.0 GB', validity: '7 days', price: 850 },
      { id: 287, name: '3GB', size: '3.0 GB', validity: '30 days', price: 1199 },
      { id: 625, name: '5GB', size: '5.0 GB', validity: '3 days', price: 1200 },
      { id: 626, name: '5GB', size: '5.0 GB', validity: '7 days', price: 1460 },
      { id: 288, name: '5GB', size: '5.0 GB', validity: '30 days', price: 1998 },
      { id: 289, name: '10GB', size: '10.0 GB', validity: '30 days', price: 3990 },
    ],
  },
  '9mobile': {
    GIFTING: [
      { id: 269, name: '25MB', size: '25.0 MB', validity: '1 day', price: 46 },
      { id: 270, name: '650MB', size: '650.0 MB', validity: '1 day', price: 175 },
      { id: 182, name: '500MB', size: '500.0 MB', validity: '30 days', price: 425 },
      { id: 272, name: '2GB', size: '2.0 GB', validity: '3 days', price: 425 },
      { id: 183, name: '1.5GB', size: '1.5 GB', validity: '30 days', price: 850 },
      { id: 184, name: '2GB', size: '2.0 GB', validity: '30 days', price: 1020 },
      { id: 273, name: '7GB', size: '7.0 GB', validity: '7 days', price: 1275 },
      { id: 185, name: '3GB', size: '3.0 GB', validity: '30 days', price: 1275 },
      { id: 186, name: '4.5GB', size: '4.5 GB', validity: '30 days', price: 1700 },
      { id: 187, name: '11GB', size: '11.0 GB', validity: '30 days', price: 3400 },
      { id: 188, name: '15GB', size: '15.0 GB', validity: '30 days', price: 4200 },
      { id: 189, name: '40GB', size: '40.0 GB', validity: '30 days', price: 8500 },
      { id: 262, name: '75GB', size: '75.0 GB', validity: '1 month', price: 12750 },
    ],
    SME: [
      { id: 248, name: '1GB', size: '1.0 GB', validity: '1 month', price: 220 },
      { id: 249, name: '1.5GB', size: '1.5 GB', validity: '1 month', price: 330 },
      { id: 250, name: '2GB', size: '2.0 GB', validity: '1 month', price: 720 },
      { id: 251, name: '3GB', size: '3.0 GB', validity: '1 month', price: 660 },
      { id: 252, name: '4GB', size: '4.0 GB', validity: '1 month', price: 880 },
      { id: 253, name: '5GB', size: '5.0 GB', validity: '1 month', price: 1100 },
      { id: 304, name: '4.5GB', size: '4.5 GB', validity: '30 days', price: 980 },
      { id: 292, name: '10GB', size: '10.0 GB', validity: '30 days', price: 2200 },
    ],
    'CORPORATE GIFTING': [
      { id: 305, name: '25MB', size: '25.0 MB', validity: '30 days', price: 25 },
      { id: 302, name: '500MB', size: '500.0 MB', validity: '30 days', price: 240 },
      { id: 296, name: '1GB', size: '1.0 GB', validity: '30 days', price: 480 },
      { id: 298, name: '1.5GB', size: '1.5 GB', validity: '30 days', price: 720 },
      { id: 297, name: '2GB', size: '2.0 GB', validity: '30 days', price: 960 },
      { id: 299, name: '3GB', size: '3.0 GB', validity: '30 days', price: 1440 },
      { id: 303, name: '4GB', size: '4.0 GB', validity: '30 days', price: 1920 },
      { id: 300, name: '5GB', size: '5.0 GB', validity: '30 days', price: 2400 },
      { id: 301, name: '10GB', size: '10.0 GB', validity: '30 days', price: 4800 },
    ],
  },
};

const NETWORK_COLORS = {
  MTN: '#fbbf24',
  Airtel: '#ef4444',
  Glo: '#22c55e',
  '9mobile': '#10b981',
};

let selectedNetwork = null;
let selectedPlanType = null;
let selectedPlan = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  initNetworkButtons();
  initForm();
  updateSummary();
  initSidebar();
  initLogout();
});

function initNetworkButtons() {
  const container = document.getElementById('network-buttons');
  if (!container) return;

  Object.keys(DATA_PLANS).forEach(network => {
    const btn = container.querySelector(`[data-network="${network}"]`);
    if (btn) {
      btn.addEventListener('click', () => selectNetwork(network));
    }
  });
}

function selectNetwork(network) {
  selectedNetwork = network;
  selectedPlanType = null;
  selectedPlan = null;

  // Update button styles
  document.querySelectorAll('[data-network]').forEach(btn => {
    btn.classList.remove('selected');
  });
  const btn = document.querySelector(`[data-network="${network}"]`);
  if (btn) btn.classList.add('selected');

  // Render plan type buttons
  renderPlanTypes(network);

  // Hide plans section until a plan type is selected
  const plansSection = document.getElementById('plans-section');
  if (plansSection) plansSection.classList.add('hidden');

  updateSummary();
}

function renderPlanTypes(network) {
  const container = document.getElementById('plan-type-buttons');
  const section = document.getElementById('plan-type-section');
  if (!container) return;

  const networkPlans = DATA_PLANS[network] || {};
  const planTypes = Object.keys(networkPlans);

  container.innerHTML = planTypes.map(type => `
    <button type="button" data-plan-type="${type}" class="plan-type-btn px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-sm font-medium text-slate-300 transition-all">
      ${type}
    </button>`).join('');

  if (section) section.classList.remove('hidden');

  container.querySelectorAll('[data-plan-type]').forEach(btn => {
    btn.addEventListener('click', () => selectPlanType(btn.dataset.planType));
  });
}

function selectPlanType(planType) {
  selectedPlanType = planType;
  selectedPlan = null;

  // Update plan type button styles
  document.querySelectorAll('[data-plan-type]').forEach(btn => {
    btn.classList.remove('selected', 'bg-green-500/20', 'border-green-500', 'text-green-400');
  });
  const btn = document.querySelector(`[data-plan-type="${planType}"]`);
  if (btn) {
    btn.classList.add('selected', 'bg-green-500/20', 'border-green-500', 'text-green-400');
  }

  // Render plan cards
  renderPlans(selectedNetwork, planType);
  updateSummary();
}

function renderPlans(network, planType) {
  const container = document.getElementById('plans-container');
  const plansSection = document.getElementById('plans-section');
  if (!container) return;

  const networkPlans = DATA_PLANS[network] || {};
  const plans = networkPlans[planType] || [];

  container.innerHTML = plans.map(plan => `
    <div class="plan-card" data-plan-id="${plan.id}" data-price="${plan.price}" data-size="${plan.size}" data-validity="${plan.validity}">
      <div class="text-lg font-bold text-white">${plan.size}</div>
      <div class="text-xs text-slate-400 mt-0.5">${plan.validity}</div>
      <div class="text-green-400 font-bold mt-2 text-sm">${formatCurrency(plan.price)}</div>
    </div>`).join('');

  if (plansSection) plansSection.classList.remove('hidden');

  container.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPlan = {
        id: parseInt(card.dataset.planId, 10),
        name: card.dataset.size,
        price: parseFloat(card.dataset.price),
      };
      updateSummary();
    });
  });
}

function updateSummary() {
  const networkEl  = document.getElementById('summary-network');
  const planTypeEl = document.getElementById('summary-plan-type');
  const planEl     = document.getElementById('summary-plan');
  const amountEl   = document.getElementById('summary-amount');
  const buyBtn     = document.getElementById('buy-btn');

  if (networkEl)  networkEl.textContent  = selectedNetwork || '—';
  if (planTypeEl) planTypeEl.textContent  = selectedPlanType || '—';
  if (planEl)     planEl.textContent     = selectedPlan ? selectedPlan.name : '—';
  if (amountEl)   amountEl.textContent   = selectedPlan ? formatCurrency(selectedPlan.price) : '₦0.00';
  if (buyBtn)     buyBtn.disabled        = !(selectedNetwork && selectedPlan);
}

function initForm() {
  const form = document.getElementById('data-form');
  if (!form) return;

  const phoneInput = document.getElementById('phone-number');
  const buyBtn     = document.getElementById('buy-btn');

  if (phoneInput) {
    phoneInput.addEventListener('blur', () => validateField(phoneInput, { required: true, phone: true }));
    phoneInput.addEventListener('input', clearFieldError.bind(null, phoneInput));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedNetwork) { Toast.show('Please select a network.', 'warning'); return; }
    if (!selectedPlan)    { Toast.show('Please select a data plan.', 'warning'); return; }

    const phoneOk = validateField(phoneInput, { required: true, phone: true });
    if (!phoneOk) return;

    const balance = getWalletBalance();
    if (balance < selectedPlan.price) {
      Toast.show(`Insufficient wallet balance. Current balance: ${formatCurrency(balance)}`, 'error');
      return;
    }

    const confirmed = await Modal.confirm({
      title: 'Confirm Purchase',
      message: `Buy <strong>${selectedPlan.name}</strong> data for <strong>${phoneInput.value}</strong> on <strong>${selectedNetwork}</strong> for <strong>${formatCurrency(selectedPlan.price)}</strong>?`,
      confirmText: 'Buy Now',
    });

    if (!confirmed) return;

    setButtonLoading(buyBtn, true);

    try {
      const result = await API.post('api/data.php', {
        network: selectedNetwork,
        plan_name: selectedPlan.name,
        plan_id: selectedPlan.id,
        price: selectedPlan.price,
        phone: phoneInput.value,
      });

      if (result.error) {
        setButtonLoading(buyBtn, false);
        Toast.show(result.error, 'error');
        return;
      }

      setButtonLoading(buyBtn, false);
      Toast.show(result.message || `${selectedNetwork} ${selectedPlan.name} data sent to ${phoneInput.value} successfully!`, 'success');
    } catch {
      setButtonLoading(buyBtn, false);
      Toast.show('Network error. Please try again.', 'error');
      return;
    }

    // Reset form
    form.reset();
    selectedPlan = null;
    selectedPlanType = null;
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('[data-network]').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('[data-plan-type]').forEach(b => {
      b.classList.remove('selected', 'bg-green-500/20', 'border-green-500', 'text-green-400');
    });
    selectedNetwork = null;
    const plansSection = document.getElementById('plans-section');
    if (plansSection) plansSection.classList.add('hidden');
    const planTypeSection = document.getElementById('plan-type-section');
    if (planTypeSection) planTypeSection.classList.add('hidden');
    updateSummary();
  });
}

function initSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('hidden');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('open');
      overlay.classList.add('hidden');
    });
  }
}

function initLogout() {
  const btn = document.getElementById('logout-btn');
  const mob = document.getElementById('logout-btn-mobile');
  [btn, mob].forEach(b => { if (b) b.addEventListener('click', () => Auth.logout()); });
}
