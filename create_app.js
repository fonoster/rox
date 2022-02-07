const Apps = require("@fonoster/apps")
const Secrets = require("@fonoster/secrets")

const credentials = {
  accessKeyId: "PJ61eeb2a26160fe0700000003",
  accessKeySecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmb25vc3RlciIsInJvbGUiOiJQUk9KRUNUIiwiYWNjZXNzS2V5SWQiOiJQSjYxZWViMmEyNjE2MGZlMDcwMDAwMDAwMyIsImlhdCI6MTY0MzAzMzI1MCwiZXhwIjoxNjc0NTkwODUwfQ.7h4RmoJdJ67uYWLZyRvHmawxaeL4vPIlqdTsNp3AQSo"
}

const apps = new Apps(credentials)
const secrets = new Secrets(credentials)

apps.updateApp({
  ref: "GXkl6xiZlL",
  name: "DF Test",
  initialDtmf: "1234",
  speechConfig: {
    secretName: "SERVICE_ACCOUNTS_CREDENTIALS",
    voice: "en-US-Wavenet-F"
  },
  intentsEngineConfig: {
    secretName: "SERVICE_ACCOUNTS_CREDENTIALS",
    projectId: "slang-fonos-testbed"
  }
})
  .then(console.log)
  .catch(console.error)


secrets.createSecret({
  name: "SERVICE_ACCOUNTS_CREDENTIALS", 
  secret: JSON.stringify({
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDgZiBOKvt8QlEc\nVlmJkQjXA3JWQEV6N4PlZbvWIPqHOHRuTFQxHbvw5fl6/MqoPZWBG3zygWyWBWHw\n5UDRHNCGpZc9H7GFt1pjmTAlIgYaDQ4EBCnt+Wk+qvr0JO/LvjrhVTxb4+2l0GgU\nclennYnIogYjb+qtzEPnyCJbYWYVUc1Yx5W7N5X7Nu+NZtwNUlG4Z6q0TS8vBnHy\nPsM+49eeU/Gn0i0ZJlyjIOBhvzVpquHJTFTUmYHQKcEyXgqZE36OygpMmdUE4rCM\ngcP5IjVi+qY0HxclzY7Om/bpUN0HKUAzHQ1KxOlb+Yr8dJSm5JFQUDqH/VAgfIuz\nT/LPOjG7AgMBAAECggEAWF5PbYkGtVXmXDrzErYfXZEZZzbzRWB0XBO2p2ogTrzg\nOQltBFSZzRG7r/+6DQwHgqrhBx0JtoCTI8scPd1TjxrJ1sPS5H4ipeNPLuhZr8uh\nT9qV6oXUON4baqbbGgilZlRrKyK01R4fxqGKvFLRTkXkFfN+Xwf4W+AYC5VtHop1\nzodIbEvw9KHsH+MMHj9mxAXvns8SIv3BBQXNxJZy5Y3U8iHFg5dTYKwsozTW19sC\ndSQF5csItgNZm+ZkYUEO3y+Rlq0YgLOysfskvGZMOxiLdi+YhCyymoa+SmrXlkdw\nFbH2lJAJJoPOSbxkFCtBAZAizo688v9bSV3WcTxehQKBgQD7aN22rmqt3Hi98tPb\nRRgbOxcutzXqnLiKkkXSspv5PWngm5aSCI5pu/0jju9nW2Ls7+SVJbIf6xBtJQAm\n64tFD6RtYHDeynafj3uC15LUFYHnCbYHALd5W4yJgZZh1dcas8U05mhRsdRzP9+M\nu/rQf1uMUJkx0pYo7fwcPb3grQKBgQDkfwHZ+byubJwnR6DJJvsAphXXLGxo8xjZ\nzXt2s5GPA9H7lT1jxYL8IfrXsiDPRh9sZii6BrCGLxNpCe4DQ57PNHX3PpJrzr9B\nPlqde8ZlTRZIeZwa9svPmJxn7uLlonB4ii3tzWo4JaZB+OTm+vRBgom84o02rvJN\nCmJB8/XhBwKBgE12nUHpceNKGEXmqRJZsrjJNzZkqw8z5MSFl0/5Soe8PYBAUF+E\nlWTM0I2BQBCnns6Eh/jQmZauFeybRvW3A71uuWoeGgj7dxto2VSSWaJRUio+2sBD\nn0ScSawgqpZQjiujEnNfPutVELHGD3pMfVZ6t1l/iARK74uC8Hg/Kd8tAoGBAKEC\n0mYsMgXjKMIRGj7Ehhj17+v5NMdbjgZkYnzJmmdhtMUIbALzOhK7SwxVTANjEV+M\nOWSktB1J7O6Wfa61JqIyAHJiGEF5pZGvA6F3h9z4Thxx/UuO3x2BF62xSxevuHto\nO2cX2aKI/Tf90Cbnbdj/yFled02yR7F8ALMi2v9fAoGAL9AzzBJOGXy1SKiE5izg\nsvmwe2B8ohOc9CRB94r6z+1uNBmk+Eq3vxMytXzhVoikioEQuV7UID65rledLB7F\nanRpydaUJzbiewP48H3I9l1aaGqteUObjvI2e8RSRFZeb7fyTd3ulhlNyPHaHeLl\nQOElJqHbn+zpEAyR7+6WT3o=\n-----END PRIVATE KEY-----\n",
    "client_email": "df-speech@slang-fonos-testbed.iam.gserviceaccount.com",
  })
})
.then(console.log)
.catch(console.error)


