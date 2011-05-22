var express = require('sys'),
    TwilioClient = require('twilio').Client,
    redis = require('redis'),
    client = redis.createClient();

var apiKey = "AC817a0bff576c4274fd12710cee1ef6b9",
    authKey = "8849668d090659eb027ec07c93d89d2d";

var twilio = new TwilioClient(apiKey, authKey, 'textingbuds.com', { port:3000, basePath:'/sms'}),
    phone = twilio.getPhoneNumber('+16305998662');

function sms(to, message) {
  phone.sendSms(to, message, null, function() {
    console.log(to + ':"' + message + '"');
  });
}

function buddyKey(number) {
  return 'phone:' + number + ':buddy';
}

phone.setup(function() {
  phone.on('incomingSms', function(params, res) {
    var person = params.From;
    var body = params.Body;

    if(body.match(/@start/)) {
      client.lrange('buddies', 0, -1, function(err, buddies) {
        if(buddies.length === 0) {
          sms(person, "I'm tracking down a random buddy for you, I'll let you know when I found one.");
          client.rpush('buddies', person);
        } else {
          client.lpop('buddies', function(err, buddy) {
            client.set(buddyKey(person), buddy);
            client.set(buddyKey(buddy), person);
            [person, buddy].forEach(function(number) {
              sms(number, "Meet your new texting buddy! Start texting by replying to this message. Text @stop to end it.");
            });
          });
        }
      });
    } else if(body.match(/@stop/)) {
      client.get(buddyKey(person), function(err, buddy) {
        sms(person, "Sorry the buddy didn't work out :(. Want a new one? Text @start.");
        sms(buddy, "Looks like your buddy wanted to stop chatting. Text @start for a new buddy.");
        [person, buddy].forEach(function(number) {
          client.del(buddyKey(number));
        });
      });
    } else {
      client.get(buddyKey(person), function(err, buddy) {
        if(buddy === null) {
          sms(person, "Text @start to get a random buddy.");
        } else {
          sms(buddy, body);
        }
      });
    }
  });
});
