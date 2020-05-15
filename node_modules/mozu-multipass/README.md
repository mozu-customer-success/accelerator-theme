# Mozu Multipass

![](multipass.jpg)

```js
var Multipass = require('mozu-multipass');
var MozuNodeSDK = require('mozu-node-sdk');
var client = MozuNodeSDK.client(null, { plugins: [Multipass] })
```

The above gives you a Mozu Node SDK client that stores all its authentication tickets persistently in your home directory. This speeds up access, helps you avoid storing plaintext passwords, and in the best of circumstances, will ask you for your password maximum once every twenty-four hours.

It implements an API that the Mozu Node SDK will accept as an `authenticationStorage` parameter in the second argument to `MozuNodeSDK.client()`. The SDK's default `authenticationStorage` is in-memory, and does not persist between sessions or get shared between processes. Multipass fixes this by reimplementing the `get` and `set` methods with a backing store in your home directory, a file called `.mozu.authentication-cache.json`. This is invisible to the SDK and they work perfectly together. They're newlyweds. Just met. You know how it is. They bumped into each other, sparks happen.


### Methods
Don't use these directly. They're here for illustrative purposes. They should plug into the SDK.

#### Get
```js
// Three types of claim: developer, admin-user, application
// All require an app key in the context.
// developer requires a developerAccountId and developerAccount.emailAddress.
// admin-user requires a tenant and adminUser.emailAddress
multipass.get('developer', client.context, function(err, ticket) {
    // if no valid ticket exists, `ticket` will simply be undefined
});
```

#### Set
```js
multipass.set('admin-user', client.context, ticket, function(err) {

});
```

#### Remove (optional extension)
```js
multipass.remove('admin-user', client.context, function(err) {

});
```

### Example Extension

You can extend Multipass easily, using regular old JavaScript techniques, to add cool features. Here's one that uses [Inquirer](https://github.com/SBoudrias/inquirer) to prompt for a developer password when it's time to get a developer ticket.

```js
var Multipass = require('mozu-multipass');
var inquirer = require('inquirer');
function PromptingPass(client) {
  var proto = Multipass(client);
  var promptingPass = Object.create(proto);
  promptingPass.get = function(claimtype, context, callback) {
    return proto.get.call(this, claimtype, context, function(err, ticket) {
      if (claimtype === "developer" && !ticket && !context.developerAccount.password) {
        process.stdout.write('\u0007'); // ding!
        inquirer.prompt([{
          type: 'password',
          name: 'password',
          message: 'Developer password for ' + context.developerAccount.emailAddress + ':',
          validate: function(str) {
            return !!str;
          }
        }], function(answers) {
          context.developerAccount.password = answers.password;
          callback(null, null);
        });
      } else {
        callback(null, ticket);
      }
    });
  };
  return client.authenticationStorage = promptingPass;
};

var promptingClient = require('mozu-node-sdk').client(null, {
  plugins: [PromptingPass]
});
```
