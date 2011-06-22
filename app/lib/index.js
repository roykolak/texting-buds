require('./sender');
require('./store');
require('./texting_buds');
var sys = require('sys');
var TwilioClient = require('twilio').Client;

var apiKey = 'AC817a0bff576c4274fd12710cee1ef6b9',
    authKey = '8849668d090659eb027ec07c93d89d2d',
    phone = '+16305998662',
    dev = {
      port: 9092,
      host: '67.175.132.120'
    },
    prod = {
      port: 3000,
      host: 'textingbuds.com'
    };

var twilioClient = new TwilioClient(apiKey, authKey, dev.host, { port:dev.port, basePath:'/sms'});
phone = twilioClient.getPhoneNumber(phone);

var redis = require('redis'),
    client = redis.createClient();

client.on('error', function(error) {
  console.log(error);
});

var sender = new Sender(phone);
var store = new Store(redis);
var textingBuds = new TextingBuds();

phone.setup(function() {
  phone.on('incomingSms', function(params, res) {
    textingBuds.react(params);
  });
});
