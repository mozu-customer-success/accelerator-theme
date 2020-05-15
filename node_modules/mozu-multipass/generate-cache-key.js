var assert = require('assert');
var delimiter = "|||";

var contextSerializeStrategies = {
  'developer': function(context) {
    assert(context.developerAccount && context.developerAccount.emailAddress, "In order to retrieve a developer auth ticket, the provided context must have a developerAccount.emailAddress.");
    return ['developer',context.appKey,context.developerAccountId || 'all',context.developerAccount.emailAddress].join(delimiter);
  },
  'application': function(context) {
    return ['application',context.appKey].join(delimiter)
  },
  'admin-user': function(context) {
    assert(context.tenant && context.adminUser && context.adminUser.emailAddress, "In order to retrieve an admin-user auth ticket, the provided context must have a tenant and an adminUser.emailAddress.");
    return ['admin-user',context.appKey,context.tenant,context.adminUser.emailAddress].join(delimiter)
  }
}

var generateCacheKey = module.exports = function(claimType, context) {
  assert(claimType in contextSerializeStrategies, "Unknown claim type " + claimType);
  return contextSerializeStrategies[claimType](context);
}
