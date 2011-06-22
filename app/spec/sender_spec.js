require('../lib/sender');

describe('Sender', function() {
  var sender, smsSpy, number;

  beforeEach(function() {
    number = '805-769-8255';
    smsSpy = jasmine.createSpy();
    sender = new Sender(smsSpy);
  });

  describe('#BannedSms', function() {
    it('sends the "banned" SMS to the number passed', function() {
      sender.bannedSms(number);
      expect(smsSpy).toHaveBeenCalledWith(number, sender.messages.banned);
    });
  });

  describe('#unassignedBuddySms', function() {
    it('sends the "unassigned buddy" SMS to the number passed', function() {
      sender.unassignedBuddySms(number);
      expect(smsSpy).toHaveBeenCalledWith(number, sender.messages.unassignedBuddy);
    });
  });

  describe('#watingForBuddySms', function() {
    it('sends the "waiting for buddy" SMS to the number passed', function() {
      sender.waitingForBuddySms(number);
      expect(smsSpy).toHaveBeenCalledWith(number, sender.messages.waitingForBuddy);
    });
  });

  describe("#meetYourNewBuddySms", function() {
    it('sends the "meet your new buddy" SMS to the number passed', function() {
      sender.meetYourNewBuddySms(number);
      expect(smsSpy).toHaveBeenCalledWith(number, sender.messages.meetYourNewBuddy);
    });
  });

  describe('#helpSms', function() {
    it('sends the "help" SMS to the number passed', function() {
      sender.helpSms(number);
      expect(smsSpy).toHaveBeenCalledWith(number, sender.messages.help);
    });
  });

  describe('#rejectionSms', function() {
    it('sends the "rejection" SMS to the number passed', function() {
      sender.rejectionSms(number);
      expect(smsSpy).toHaveBeenCalledWith(number, sender.messages.rejection);
    });
  });

  describe('#goodbyeSms', function() {
    it('sends the "goodbye" SMS to the number passed', function() {
      sender.goodbyeSms(number);
      expect(smsSpy).toHaveBeenCalledWith(number, sender.messages.goodbye);
    });
  });

  describe('#blockerSms', function() {
    it('sends the "blocker" SMS to the number passed', function() {
      sender.blockerSms(number);
      expect(smsSpy).toHaveBeenCalledWith(number, sender.messages.blocker);
    });
  });

  describe('#blockereSms', function() {
    it('sends the "blockee" SMS to the number passed', function() {
      sender.blockeeSms(number);
      expect(smsSpy).toHaveBeenCalledWith(number, sender.messages.blockee);
    });
  });
});
