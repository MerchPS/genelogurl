const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimiter = require('express-rate-limit');
const compression = require('compression');
const { enc, dec } = require('./utils/base64');
const { replace_from, cv_json } = require('./utils/utility');

app.use(compression({
    level: 5,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100, headers: true }));

app.all('/player/login/dashboard', function (req, res) {
    const tData = {};
    
    try {
        const uData = JSON.stringify(req.body).split('"')[1].split('\\n');
        for (let i = 0; i < uData.length - 1; i++) {
            const d = uData[i].split('|');
            tData[d[0]] = d[1];
        }
    } catch (error) {
        console.log(`Warning: ${error}`);
    }
    
    const formattedData = cv_json(tData);
    res.render(__dirname + '/public/html/dashboard.ejs', { data: formattedData });
});

app.post('/player/growid/checktoken', (req, res) => {
    const { refreshToken, clientData } = req.body;
    
    if (!refreshToken || !clientData || !req.query.valKey) {
        return res.status(400).send(`{"status":"error","message":"Invalid data"}`);
    }

    const refresh_token = dec(refreshToken);
    let modified_token = refresh_token.replace(/_token=.*?(&|$)/, `_token=${refreshToken}$1`);
    modified_token = modified_token + "&from=session"
    const finalToken = enc(modified_token)

    res.send(`{"status":"success","message":"Account Validated.","token":"${finalToken}","url":"","accountType":"growtopia"}`);
});

app.all('/player/growid/login/validate', (req, res) => {
    const { _token, growId, password } = req.body;

    // hanya encode _token saja
    const token_encoded = Buffer.from(_token).toString('base64');

    // string final tanpa encode ulang
    const str = `_token=${token_encoded}&growId=${growId}&password=${password}`;

    res.send(
        `{"status":"success","message":"Account Validated.","token":"${str}","url":"","accountType":"growtopia"}`
    );
});


app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(5000, function () {
    console.log('Listening on port 5000');
});
