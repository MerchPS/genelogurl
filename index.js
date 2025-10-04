const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: 'growtopia-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(function (req, res, next) {
    console.log('Request:', req.method, req.url);
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
});

// Store active sessions
const activeSessions = new Map();

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/player/login/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
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

    // Tentukan apakah ini guest login
    const isGuest = email === 'guest@gmail.com';
    
    // Buat session data
    const sessionData = {
        growId: growId || 'GUEST',
        email: email,
        accountType: isGuest ? 'guest' : 'growtopia',
        loginTime: new Date(),
        protocol: protocol,
        game_version: game_version,
        country: country,
        rid: rid,
        mac: mac
    };

    // Simpan session
    req.session.userData = sessionData;
    activeSessions.set(req.sessionID, sessionData);

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
    console.log('Session created:', req.sessionID);

    res.send(
        `{"status":"success","message":"${message}","token":"${token}","url":"","accountType":"${accountType}","sessionId":"${req.sessionID}"}`,
    );
});

// Endpoint untuk check session
app.get('/player/session/check', (req, res) => {
    if (req.session.userData && activeSessions.has(req.sessionID)) {
        res.json({
            status: 'success',
            message: 'Session is active',
            userData: req.session.userData
        });
    } else {
        res.json({
            status: 'error',
            message: 'No active session'
        });
    }
});

// Endpoint untuk logout
app.post('/player/logout', (req, res) => {
    const sessionId = req.body.sessionId || req.sessionID;
    
    // Hapus session
    activeSessions.delete(sessionId);
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        console.log('Session destroyed:', sessionId);
    });
    
    res.json({
        status: 'success',
        message: 'Logged out successfully'
    });
});

// Endpoint untuk get semua active sessions (for debugging)
app.get('/player/sessions', (req, res) => {
    res.json({
        totalSessions: activeSessions.size,
        sessions: Array.from(activeSessions.entries())
    });
});

app.post('/player/validate/close', function (req, res) {
    res.send('<script>window.close();</script>');
});

// Handle 404 - Redirect ke dashboard jika session ada
app.use(function(req, res, next) {
    if (req.session.userData && activeSessions.has(req.sessionID)) {
        // Jika ada session aktif, redirect ke dashboard
        res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
    } else {
        // Jika tidak ada session, kirim 404
        res.status(404).send('Page not found');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
    console.log('Listening on port ' + PORT);
    console.log('Session system activated');
});
