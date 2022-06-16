const bcrypt = require('bcryptjs');
// GENERATES RANDOM STRINGS FOR SHORTURL
const generateRandomString = function (database) {
  let randomNumberArray = [];
  do {
    for (let i = 0; i < 6; i++) {
      randomNumberArray.push(Math.floor(Math.random() * 62));
    }
  } while (database[randomNumberArray.join('')] !== undefined);
  return randomNumberArray.map((item) => {
    if (item >= 0 && item <= 9) {
      return String.fromCharCode(item + 48); //0-9 gives numbers 0-9
    } else if (item >= 10 && item <= 35) {
      return String.fromCharCode(item + 55); //10-35 gives A-Z
    } else { // 36 - 61 gives a-z
      return String.fromCharCode(item + 61);
    }
  }).join('');
};

const registerUser = function (email, password, userDB) {

  const id = generateRandomString(userDB);

  userDB[id] = {id, email, password: bcrypt.hashSync(password, 10)};

  return userDB[id];

};
// getUser
const getUser = function (value, userDB) {
  return Object.values(userDB).find(user => user.id === value || user.email === value);
};
//get urlsForUser
const urlsForUser = function (id, urlDatabase) {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};
//
const getUniqueVisitorCount = function (req, userDatabase, visitorCount) {
  let cookieID = req.session["user_id"];
  if (!userDatabase[cookieID]["hasClicked"]) {
    visitorCount++;
    userDatabase[cookieID]["hasClicked"] = true;
  }
  return visitorCount;
};


module.exports = {generateRandomString, getUser, urlsForUser, getUniqueVisitorCount, registerUser}
