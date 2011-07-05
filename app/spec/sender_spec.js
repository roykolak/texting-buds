require('../lib/sender');

describe('Sender', function() {
  var sender, client, number;

  beforeEach(function() {
    number = '805-769-8255';
    client = {sendSms: jasmine.createSpy()};
    sender = new Sender(client);
    spyOn(sender, 'send').andCallThrough();
  });

  describe('#send', function() {
    it('calls the client with the number and message', function() {
      var number = '333-444-5555',
          message = 'hello';
      sender.send(number, message);
      expect(client.sendSms).toHaveBeenCalledWith(number, message, null, jasmine.any(Function));
    });
  });

  describe('#statusSms', function() {
    it('sends the system status to the number passed', function() {
      var buddies = 10;
      sender.statusSms(number, buddies);
      expect(sender.send).toHaveBeenCalledWith(number, buddies + sender.messages.status);
    });
  });

  describe('#BannedSms', function() {
    it('sends the "banned" SMS to the number passed', function() {
      sender.bannedSms(number);
      expect(sender.send).toHaveBeenCalledWith(number, sender.messages.banned);
    });
  });

  describe('#unassignedBuddySms', function() {
    it('sends the "unassigned buddy" SMS to the number passed', function() {
      sender.unassignedBuddySms(number);
      expect(sender.send).toHaveBeenCalledWith(number, sender.messages.unassignedBuddy);
    });
  });

  describe('#watingForBuddySms', function() {
    it('sends the "waiting for buddy" SMS to the number passed', function() {
      sender.waitingForBuddySms(number);
      expect(sender.send).toHaveBeenCalledWith(number, sender.messages.waitingForBuddy);
    });
  });

  describe("#meetYourNewBuddySms", function() {
    it('sends the "meet your new buddy" SMS to the number passed', function() {
      sender.meetYourNewBuddySms(number);
      expect(sender.send).toHaveBeenCalledWith(number, sender.messages.meetYourNewBuddy);
    });
  });

  describe('#helpSms', function() {
    it('sends the "help" SMS to the number passed', function() {
      sender.helpSms(number);
      expect(sender.send).toHaveBeenCalledWith(number, sender.messages.help);
    });
  });

  describe('#rejectionSms', function() {
    it('sends the "rejection" SMS to the number passed', function() {
      sender.rejectionSms(number);
      expect(sender.send).toHaveBeenCalledWith(number, sender.messages.rejection);
    });
  });

  describe('#goodbyeSms', function() {
    it('sends the "goodbye" SMS to the number passed', function() {
      sender.goodbyeSms(number);
      expect(sender.send).toHaveBeenCalledWith(number, sender.messages.goodbye);
    });
  });

  describe('#blockerSms', function() {
    it('sends the "blocker" SMS to the number passed', function() {
      sender.blockerSms(number);
      expect(sender.send).toHaveBeenCalledWith(number, sender.messages.blocker);
    });
  });

  describe('#blockereSms', function() {
    it('sends the "blockee" SMS to the number passed', function() {
      sender.blockeeSms(number);
      expect(sender.send).toHaveBeenCalledWith(number, sender.messages.blockee);
    });
  });
});
