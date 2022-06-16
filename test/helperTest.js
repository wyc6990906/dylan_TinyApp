const { assert } = require('chai');

const { getUser } = require('../helper/helper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUser', function() {
  it('should return a user with valid email', function() {
    const user = getUser("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id,expectedUserID)
  });
  it('should return undefined with invalid email',function () {
    const user = getUser("user@example123.com", testUsers)
    assert.equal(user,undefined)
  })
});
