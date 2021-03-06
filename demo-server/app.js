/**
 * Created by psparks on 12/31/2015.
 */
var express = require("../node_modules/express");
var app = express();
var path = require("path");

var jsonServer = require('../node_modules/json-server');
var server = jsonServer.create();
var router = jsonServer.router('demo-server/db.json');

//auth
var cookieParser = require('../node_modules/cookie-parser');
var session = require('../node_modules/express-session');
//endauth

server.use(cookieParser("security", { "path": "/" }));
app.use(cookieParser("security", { "path": "/" }));

server.use(function (req, res, next) {

    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
    res.setHeader("Access-Control-Expose-Headers", "Access-Control-Allow-Origin");
    res.setHeader("Access-Control-Allow-Headers",
        "X-Custom-Header,X-Requested-With,X-Prototype-Version,Content-Type,Cache-Control,Pragma,Origin,content-type");

    if (!req.signedCookies.usersession && req._parsedUrl.pathname != "/auth/login" && req.method != "OPTIONS") {
        res.redirect("http://localhost:8080/app/pages/auth/auth.html");
    }
    else {
        next();
    }
});

server.post('/auth/login', function (req, res) {
    var users = router.db.object.users;
    var username = req.query.username;
    var password = req.query.password;
    for (var i = 0; i <= users.length - 1; i++) {
        if (users[i].username == username && users[i].password == password) {
            res.cookie('usersession', users[i].id, { maxAge: 9000000, httpOnly: false, signed: true });
            res.send(JSON.stringify({ success: true }));
            return;
        }
    }
    res.send(JSON.stringify({ success: false, error: 'Wrong username or password' }));
});

app.get('/', function (req, res) {
    if (req.signedCookies.usersession) {
        res.redirect('app/pages/auth/auth.html');
    }
    else {
        res.sendFile(path.join(__dirname + '/../app/index.html'));
    }
});

app.get('/auth/logout', function(req, res) {
    res.clearCookie('usersession');
    res.redirect('/app/pages/auth/auth.html');
});
app.use(express.static(path.join(__dirname, '../')));
var http = require('http').Server(app);
http.listen(8080);

server.use(jsonServer.defaults);
server.use(router);
server.listen(5000);