const crypto = require("crypto")
const fetch = require("node-fetch")
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
})

const getHash = password => {
  return crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase()
}

const getSuffix = str => str.split(":")

const isSuffixMatch = function(resultSuffix) {
  return resultSuffix[0] === this.suffix
}

const isPwned = async password => {
  const hash = getHash(password)
  const prefix = hash.substring(0, 5)
  const suffix = hash.substring(5)
  const response = await (await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`,
  )).text()
  const isSuffixMatchWithContext = isSuffixMatch.bind({ suffix: suffix })
  return response
    .replace("\r\n", "\n")
    .split("\n")
    .map(getSuffix)
    .find(isSuffixMatchWithContext)
}

const checkPassword = async password => {
  const response = await isPwned(password)
  if (response) {
    console.error(`Password has been pwned ${response[1].trim()} times.`)
  } else {
    console.log(`Password has not been pwned (yet).`)
  }
}

readline.question(`Enter the password to check: `, password => {
  checkPassword(password)
  readline.close()
})
