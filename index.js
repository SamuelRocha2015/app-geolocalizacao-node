var restify = require('restify');

var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyAZZeZJDkwgrAcpllB16Y_YMXd2syD1BZM',
    Promise: Promise // 'Promise' is the native constructor.
  });


const knex = require('knex')({
    client: 'mysql',
    connection: {
        host:'codeshouse.com.br',
        user:'codes475_admin',
        password:'Admin@ti',
        database:'codes475_desenv'
    }
});

const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/all', function (req, res, next) {
    knex('curso_places').then((dados)=>{
        res.send(dados);
    }, next);

    return next();
});

server.post('/geocode', function (req, res, next) {
    const {lat, lng} = req.body;
    
    googleMapsClient.reverseGeocode({latlng: [lat,lng]}).asPromise()
    .then((response) => {

        const address = response.json.results[0].formatted_address;
        const place_id = response.json.results[0].place_id;
        const image = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=300x300&sensor=false`;
        
        knex('curso_places')
        .insert({place_id, address, image})
        .then(() => {
            res.send({address, image});
        }, next)

        })
        .catch((err) => {
            res.send(err);
        });
});    

server.get(/\/(.*)?.*/,restify.plugins.serveStatic({
    directory: './dist',
    default: 'index.html',
}));

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});