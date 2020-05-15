var test = require('tape');

test('library loads without errors', function(assert) {
  var metadata;
  assert.plan(4);
  try {
    metadata = require('../');
    assert.ok(metadata.actionDefinitions, 'actionDefinitions present');
    assert.ok(metadata.environments, 'environments present');
    assert.ok(metadata.themes, 'themes present');
    assert.ok(metadata.getActionDefinitions, 'getActionDefinitions present');
  } catch(e) {
    assert.fail(e);
  }
})
