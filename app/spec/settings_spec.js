require ('../lib/settings');

describe('Settings', function() {
  describe('#initialize', function() {
    var sharedSettings;

    beforeEach(function() {
      sharedSettings = {
        apiKey: Settings.global.apiKey,
        authKey: Settings.global.authKey,
        phone: Settings.global.phone
      };
    });

    it('returns the development settings when passed "dev"', function() {
      sharedSettings.port = Settings.dev.port;
      sharedSettings.host = Settings.dev.host;
      expect(new Settings('dev')).toEqual(sharedSettings);
    });

    it('returns the production settings when passed "prod"', function() {
      sharedSettings.port = Settings.prod.port;
      sharedSettings.host = Settings.prod.host;
      expect(new Settings('prod')).toEqual(sharedSettings);
    });
  });
});
