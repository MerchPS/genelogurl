const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    console.log('Request:', req.method, req.url);
    console.log('Body:', req.body);
    next();
});

app.use(express.json());

app.post('/player/login/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/html/dashboard.html');
});

app.all('/player/growid/login/validate', (req, res) => {
    // Extracting data dari client
    const _token = req.body._token || '';
    const growId = req.body.growId || '';
    const password = req.body.password || '';
    const email = req.body.email || '';
    
    // Data dari client
    const protocol = req.body.protocol || '219';
    const game_version = req.body.game_version || '5.3';
    const fz = req.body.fz || '23512248';
    const cbits = req.body.cbits || '0';
    const player_age = req.body.player_age || '17';
    const GDPR = req.body.GDPR || '1';
    const category = req.body.category || '_-5100';
    const totalPlaytime = req.body.totalPlaytime || '0';
    const platformID = req.body.platformID || '0,1,1';
    const deviceVersion = req.body.deviceVersion || '0';
    const country = req.body.country || 'us';
    const rid = req.body.rid || '';
    const mac = req.body.mac || '';
    const hash = req.body.hash || '';
    const hash2 = req.body.hash2 || '';
    const fhash = req.body.fhash || '';
    const klv = req.body.klv || '';

    console.log('Login attempt:');
    console.log('- GrowID:', growId || 'GUEST');
    console.log('- Country:', country);
    console.log('- RID:', rid);
    console.log('- MAC:', mac);

    // Tentukan apakah ini guest login
    const isGuest = email === 'guest@gmail.com';
    
    // Buat data lengkap untuk enet server dengan data dari client
    let enetData = `_token=tankIDName|
tankIDPass|
requestedName|
f|1
protocol|${protocol}
game_version|${game_version}
fz|${fz}
cbits|${cbits}
player_age|${player_age}
GDPR|${GDPR}
FCMToken|
category|${category}
totalPlaytime|${totalPlaytime}
klv|${klv}
hash2|${hash2}
meta|name=GrowPlus&ip=127.0.0.1&port=17091&3rd=0
fhash|${fhash}
rid|${rid}
platformID|${platformID}
deviceVersion|${deviceVersion}
country|${country}
hash|${hash}
mac|${mac}
wk|6627EB819300208889070602986039AA&growId=${growId}&password=${password}&email=${email}`;

    // Encode data untuk token
    const token = Buffer.from(enetData).toString('base64');

    // Tentukan account type
    let accountType = isGuest ? 'guest' : 'growtopia';
    let message = isGuest ? 'Guest Account Validated.' : 'Account Validated.';

    console.log('Login successful - Account Type:', accountType);
    console.log('Enet data prepared with client data');

    res.send(
        `{"status":"success","message":"${message}","token":"${token}","url":"","accountType":"${accountType}"}`,
    );
});

app.post('/player/validate/close', function (req, res) {
    res.send('<script>window.close();</script>');
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(5000, function () {
    console.log('Listening on port 5000');
});
