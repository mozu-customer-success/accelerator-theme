var sinon = require('sinon');
var assert = require('assert');
var merge = require('lodash.merge');
var Multipass = require('../');
var HomedirStorage = require('../homedir-storage');

var leeloo;
var storage;

function MockStorage() {
  var cacheObj = {};
  storage = {
    cacheObj: cacheObj,
    retrieve: sinon.spy(function(key, cb) {
      setImmediate(function() {
        cb(null, cacheObj[key]);
      });
    }),
    save: sinon.spy(function(key, val, cb) {
      cacheObj[key] = val;
      setImmediate(cb);
    })
  };
  leeloo = Multipass({}, storage);
}

var mockfs;
function MockFS(opts) {
  mockfs = {
    fileText: '',
    readFile: sinon.spy((opts && opts.firstRun) ? function() {
      callback(new Error('ENOENT'));
    } : function(filename, encoding, callback) {
      callback(mockfs.fileText)
    }),
    writeFile: sinon.spy(function(filename, contents, encoding, callback) {
      mockfs.fileText = contents;
      callback();
    })
  };
  return mockfs;
}

function fakeTicket(aT, opts) {
  var ticket = {
    accessToken: aT,
    accessTokenExpiration: new Date((new Date).getTime() + 30*60000).toISOString(),
    refreshToken: 'fakeRefreshToken',
  };
  var rte = new Date;
  if (opts && opts.expired) {
    rte.setTime(rte.getTime() - 1000)
  } else {
    rte.setDate(rte.getDate() + 1);
  }
  ticket.refreshTokenExpiration = rte.toISOString();
  return ticket;
}


describe('Multipass', function() {
  
  describe('validates calls with', function() {

    beforeEach(MockStorage);

    it("errors if you don't supply a context with an app key", function(done) {
      leeloo.get('developer', {}, function(err, ticket) {
        assert(!ticket, "Ticket supplied when it should be undefined");
        assert(err instanceof Error, "No error supplied");
        assert(err.message.match(/provided context must have/), "Error message not informative: " + err.message);
        done();
      });
    });

    
    it("errors if you don't supply a valid claim type", function(done) {
        leeloo.get('blorp', { appKey: '123' }, function(err, ticket) {
          assert(!ticket, "Ticket supplied when it should be undefined");
          assert(err instanceof Error, "No error supplied");
          assert(err.message.match(/^Unknown claim type/), "Error message not informative: " + err.message);
          done();
        });
    });

    it("errors if you try to save developer claims without developer info in the context", function(done) {
      leeloo.get('developer', { appKey: '123' }, function(err, ticket) {
        assert(!ticket, "Ticket supplied when it should be undefined");
        assert(err instanceof Error, "No error supplied");
        assert(err.message.match(/provided context must have a developer/), "Error message not informative: " + err.message);
        done();
      });
    });

    it("errors if you try to save adminuser claims without tenant and admin user info in the context", function(done) {
      leeloo.get('admin-user', { appKey: '123' }, function(err, ticket) {
        assert(!ticket, "Ticket supplied when it should be undefined");
        assert(err instanceof Error, "No error supplied");
        assert(err.message.match(/provided context must have a tenant/), "Error message not informative: " + err.message);
        done();
      });
    });
  });

  describe('stores tickets, including', function() {

    beforeEach(MockStorage);

    it("developer tickets", function(done) {
      var key = 'developer|||456|||5678|||dungbat@thomsdad.org';
      leeloo.set('developer', {
        appKey: '456',
        developerAccountId: 5678,
        developerAccount: {
          emailAddress: "dungbat@thomsdad.org"
        }
      }, 
      fakeTicket('dev123'), 
      function(err) {
        assert(storage.save.called, "storage save never called")
        assert(!err, "Error thrown");
        assert.equal(storage.cacheObj[key], storage.save.getCall(0).args[1], "Not saved at correct key: " + JSON.stringify(storage.cacheObj));
        assert(storage.cacheObj[key].accessToken === "dev123", "Ticket not saved at key");
        done();
      });
    });

    it("application tickets", function(done) {
      var key = 'application|||456';
      leeloo.set('application', {
        appKey: '456'
      }, 
      fakeTicket('app123'), 
      function(err) {
        assert(storage.save.called, "storage save never called")
        assert(!err, "Error thrown");
        assert.equal(storage.cacheObj[key], storage.save.getCall(0).args[1], "Not saved at correct key: " + JSON.stringify(storage.cacheObj));
        assert(storage.cacheObj[key].accessToken === "app123", "Ticket not saved at key");
        done();
      });
    });

    it("adminuser tickets", function(done) {
      var key = 'admin-user|||456|||5000|||durg@swan.org';
      leeloo.set('admin-user', {
        appKey: '456',
        tenant: 5000,
        adminUser: {
          emailAddress: 'durg@swan.org'
        }
      }, 
      fakeTicket('adminuser456'),
      function(err) {
        assert(storage.save.called, "storage save never called")
        assert(!err, "Error thrown");
        assert.equal(storage.cacheObj[key], storage.save.getCall(0).args[1], "Not saved at correct key: " + JSON.stringify(storage.cacheObj));
        assert(storage.cacheObj[key].accessToken === "adminuser456", "Ticket not saved at key");
        done();
      });
    });

  });

  describe('retrieves tickets, including', function() {

    beforeEach(function() {
      MockStorage();
      merge(storage.cacheObj, {
        'developer|||456|||5678|||dungbat@thomsdad.org': fakeTicket("dev789"),
        'application|||456': fakeTicket("app678"),
        'admin-user|||456|||5000|||durg@swan.org': fakeTicket("adminuser567")
      });
    });

    it("calling the callback with undefined for a nonexistent ticket", function(done) {
      leeloo.get('developer', { 
        appKey: '123', 
        developerAccountId: 1234, 
        developerAccount: { 
          emailAddress: "dingbat@jonsmom.org"
        }
      }, function(err, ticket) {
        assert(storage.retrieve.called, "storage retrieve never called");
        assert(!err, "Error thrown!");
        assert(ticket === undefined, "Ticket supplied, where'd this come from?");
        done();
      });
    });
    
    it('developer tickets', function(done) {
      leeloo.get('developer', {
        appKey: '456',
        developerAccountId: 5678,
        developerAccount: {
          emailAddress: 'dungbat@thomsdad.org'
        }
      }, function(err, ticket) {
        if (err) console.log(err);
        assert(ticket, "No ticket supplied!");
        assert(ticket.accessToken === "dev789", "Wrong ticket supplied!");
        done();
      });
    });

    it('application tickets', function(done) {
      leeloo.get('application', {
        appKey: '456'
      }, function(err, ticket) {
        assert.ifError(err);
        assert(ticket, "No ticket supplied!");
        assert(ticket.accessToken === "app678", "Wrong ticket supplied!");
        done();
      });
    });

    it('adminuser tickets', function(done) {
      leeloo.get('admin-user', {
        appKey: '456',
        tenant: 5000,
        adminUser: {
          emailAddress: 'durg@swan.org'
        }
      }, function(err, ticket) {
        assert.ifError(err);
        assert(ticket, "No ticket supplied!");
        assert(ticket.accessToken === "adminuser567", "Wrong ticket supplied!");
        done();
      });
    });

    it("not returning expired tickets", function(done) {
      var expiredTicket = fakeTicket('lol', { expired: true} );

      leeloo.set('application', {
        appKey: '777'
      }, expiredTicket, function() {
        leeloo.get('application', {
          appKey: '777'
        }, function(err, ticket) {
          assert(!ticket, "Expired ticket supplied!")
          done();
        })
      })

    });

  });

  describe("interacts with the filesystem, ", function() {

    beforeEach(function() {
      leeloo = Multipass({}, HomedirStorage(MockFS()));
    })

    it("by saving to your homedir after some time", function(done) {
      this.timeout(5000);
      var ticket = fakeTicket('dungbat');
      leeloo.set('developer', {
        appKey: '456',
        developerAccountId: 5678,
        developerAccount: {
          emailAddress: 'dungbat@thomsdad.org'
        }
      }, 
      ticket,
      function() {
        setTimeout(function() {
          var shouldBe = JSON.stringify({
            'developer|||456|||5678|||dungbat@thomsdad.org': ticket
          }, null, 2);
          assert(mockfs.fileText === shouldBe, "Saved file incorrect: " + mockfs.fileText + " should be " + shouldBe);
          done();
        }, 500);
      });
    });

    it("by stripping out expired tickets", function() {
      var ticket = fakeTicket('dungbat', { expired: true });
      leeloo.set('developer', {
        appKey: '456',
        developerAccountId: 5678,
        developerAccount: {
          emailAddress: 'dungbat@thomsdad.org'
        }
      }, 
      ticket,
      function() {
        setTimeout(function() {
          var shouldBe = '{}';
          assert(mockfs.fileText === shouldBe, "Saved file incorrect: " + mockfs.fileText + " should be " + shouldBe);
          done();
        }, 500);
      });
    });

  })

});
