require('./sender');
require('./store');
require('./texting_buds');
require('./settings');

var sys = require('sys'),
    TwilioClient = require('twilio').Client,
    redis = require('redis').createClient();

var settings = new Settings('dev');

var twilioClient = new TwilioClient(settings.apiKey, settings.authKey, settings.host, { port:settings.port, basePath:'/sms'}),
    twilio = twilioClient.getPhoneNumber(settings.phone);

redis.select(1, function() {
  var textingBuds = new TextingBuds(new Sender(twilio), new Store(redis));

  twilio.setup(function() {
    twilio.on('incomingSms', function(params, res) {
      textingBuds.route(params);
    });
  });
});
