Settings = function(environment) {
  if(environment != 'prod') {
    environment = 'dev';
  }

  var settings = Settings.global;
  settings.port = Settings[environment].port;
  settings.host = Settings[environment].host;

  return settings;
};

Settings.global = {
  apiKey: 'AC817a0bff576c4274fd12710cee1ef6b9',
  authKey: '8849668d090659eb027ec07c93d89d2d',
  phone: '+16305998662'
};

Settings.dev = {
  port: 9092,
  host: '67.175.132.120'
};

Settings.prod = {
  port: 3000,
  host: 'textingbuds.com'
};
