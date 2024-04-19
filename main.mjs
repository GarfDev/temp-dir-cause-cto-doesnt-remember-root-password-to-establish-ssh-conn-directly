import WebSocket from 'ws';
import { genRandomUUID, genRandomId, byteArrayToHex } from './utils/util.mjs';
import { compress, decompress, decompress1 } from './utils/crypto.obfuscated.mjs';
import express from 'express';
import {SocksProxyAgent} from 'socks-proxy-agent';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    let proxy = req.query.proxy;

     if (!username || !password) {
         res.send('username or password is empty');
         return;
     }

    let user = genRandomUUID();
    // const captcha = '2b2ab3d8913b5c92a2b7c5b';

    const config = {
        handshakeTimeout: 5000,
    };
    if (proxy) {
        proxy = proxy.replace('socks5://', '');
        const agent = new SocksProxyAgent(`socks5://${proxy}`, {
            timeout: 5000,
        });
        config.agent = agent;
    }
    
    const url = 'wss://dyn.keepa.com/apps/cloud/'
    const params = {
        app: 'angular',
        version: '2.0',
        ua: 'KeepaMobile/2.5.0 Mozilla/5.0 (Linux; Android 11; M2102J20SG Build/RQ3A.210905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.159 Mobile Safari/537.36',
    };
    const queryString = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');

    const ws = new WebSocket(`${url}?${queryString}`, config);

    ws.on('open', function open() {});

    ws.on('close', function close() {
        // res.send('disconnected');
    });

    ws.on('error', function error(err) {
        // console.error(err);
    });

    const output = {};
    let counter = 0;
    ws.on('message', function message(data) {
        counter += 1;

        const d = JSON.parse(decompress(data));

        if (counter === 1) {
            ws.send(compress({
                path: 'user/session',
                type: 'login',
                version: 3,
                username: username,
                password: password,
                id: genRandomId(),
                user: user,
            }));
        }

        if (counter === 2) {
            if (d?.error) {
                res.json({
                    error: d.error,
                });
                ws.close();
                return;
            }

            user = d?.token;
            if (!user) {
                res.json({
                    error: 'invalid token',
                });
                ws.close();
                return;
            }
            output.token = user;

            ws.send(compress({
                path: 'service/stripe',
                type: 'offers',
                includeData: true,
                dashboard: 'data',
                id: genRandomId(),
                version: 3,
                user: user,
            }));
        }

        if (counter === 3) {
            res.json(d);
            ws.close();
        }
    });
});

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});