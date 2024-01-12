const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors');
const { auth, requiresAuth } = require('express-openid-connect');
const { ResponseWrapper, InternalErrorWrapper } = require('./api/index');
var proc = require('child_process');


const port = 5000

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: 'NOT_FOR_PRODUCTION_USE',
  baseURL: 'http://localhost:5000',
  clientID: 'e0seBXBWGNiWUK4q2f1R3ftd20NNUiko',
  issuerBaseURL: 'https://dev-zguema68lbscyxzk.us.auth0.com'
};

app.use(cors());
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(auth(authConfig));
app.set('view engine', 'ejs');

// API endpoints
app.use("/api", require("./api/index").router)
app.use("/api/locations", require("./api/locations"))
app.use("/api/maintainers", require("./api/maintainers"))

app.route('/list')
  .get((request, response) => {
    if (request.oidc.isAuthenticated()) {
      response.json({
        "/": 'Index of this API', "loggedIn": true
      })
    } else {
      response.json({
        "/": 'Index of this API', "/locations": "Locations of free drinking water",
        "/maintainers": "Maintainers of locations", "/reference": "Reference for this API",
        "loggedIn": false
      })
    }
  })

// HTML endpoints
app.get('/', (request, response) => {
  response.render('home', { loggedIn: request.oidc.isAuthenticated() });
})

app.get('/profile', requiresAuth(), (request, response) => {
  response.render('profile', { user: request.oidc.user });
})

// Refresh endpoint
app.get('/refresh', requiresAuth(), (request, response) => {
  proc.exec('../scripts/export.sh',
    (error, stdout, stderr) => {
      if (error !== null) {
        console.log(`process exec error: ${error}`);
        response.status(500).json(InternalErrorWrapper);
      } else {
        response.redirect('/');
      }
    });
})

// Other endpoints
app.use((request, response, next) => {
  response.status(404).json(new ResponseWrapper("Not Found", "Endpoint does not exist.", null));
})

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}.`)
})
