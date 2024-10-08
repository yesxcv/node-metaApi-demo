function getConfig(platform) {
  if (platform == 'ex') {
    return {
      token: ``,
      login: '',
      serverName: '',
      accountId: '',
    }
  }
}

module.exports = getConfig('ex')
