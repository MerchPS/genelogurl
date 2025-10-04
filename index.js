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
    // Extracting data from the request body
    const _token = req.body._token || '';
    const growId = req.body.growId || '';
    const password = req.body.password || '';
    const email = req.body.email || '';

    console.log('Login attempt:');
    console.log('- GrowID:', growId || 'EMPTY');
    console.log('- Password:', password ? '***' : 'EMPTY');
    console.log('- Email:', email || 'NOT PROVIDED');

    // Buat token data
    let tokenData = `_token=${_token}&growId=${growId}&password=${password}`;
    
    // Jika ada email, tambahkan ke token (untuk guest)
    if (email) {
        tokenData += `&email=${email}`;
    }

    const token = Buffer.from(tokenData).toString('base64');

    // Tentukan account type berdasarkan email
    let accountType = 'growtopia';
    let message = 'Account Validated.';
    
    if (email === 'guest@gmail.com') {
        accountType = 'guest';
        message = 'Guest Account Validated.';
    }

    console.log('Login successful - Account Type:', accountType);

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
