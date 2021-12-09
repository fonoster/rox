const dialogflow = require('@google-cloud/dialogflow').v2beta1
const uuid = require('uuid')
const {struct} = require('pb-util');

const c = {
  credentials: {
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDgZiBOKvt8QlEc\nVlmJkQjXA3JWQEV6N4PlZbvWIPqHOHRuTFQxHbvw5fl6/MqoPZWBG3zygWyWBWHw\n5UDRHNCGpZc9H7GFt1pjmTAlIgYaDQ4EBCnt+Wk+qvr0JO/LvjrhVTxb4+2l0GgU\nclennYnIogYjb+qtzEPnyCJbYWYVUc1Yx5W7N5X7Nu+NZtwNUlG4Z6q0TS8vBnHy\nPsM+49eeU/Gn0i0ZJlyjIOBhvzVpquHJTFTUmYHQKcEyXgqZE36OygpMmdUE4rCM\ngcP5IjVi+qY0HxclzY7Om/bpUN0HKUAzHQ1KxOlb+Yr8dJSm5JFQUDqH/VAgfIuz\nT/LPOjG7AgMBAAECggEAWF5PbYkGtVXmXDrzErYfXZEZZzbzRWB0XBO2p2ogTrzg\nOQltBFSZzRG7r/+6DQwHgqrhBx0JtoCTI8scPd1TjxrJ1sPS5H4ipeNPLuhZr8uh\nT9qV6oXUON4baqbbGgilZlRrKyK01R4fxqGKvFLRTkXkFfN+Xwf4W+AYC5VtHop1\nzodIbEvw9KHsH+MMHj9mxAXvns8SIv3BBQXNxJZy5Y3U8iHFg5dTYKwsozTW19sC\ndSQF5csItgNZm+ZkYUEO3y+Rlq0YgLOysfskvGZMOxiLdi+YhCyymoa+SmrXlkdw\nFbH2lJAJJoPOSbxkFCtBAZAizo688v9bSV3WcTxehQKBgQD7aN22rmqt3Hi98tPb\nRRgbOxcutzXqnLiKkkXSspv5PWngm5aSCI5pu/0jju9nW2Ls7+SVJbIf6xBtJQAm\n64tFD6RtYHDeynafj3uC15LUFYHnCbYHALd5W4yJgZZh1dcas8U05mhRsdRzP9+M\nu/rQf1uMUJkx0pYo7fwcPb3grQKBgQDkfwHZ+byubJwnR6DJJvsAphXXLGxo8xjZ\nzXt2s5GPA9H7lT1jxYL8IfrXsiDPRh9sZii6BrCGLxNpCe4DQ57PNHX3PpJrzr9B\nPlqde8ZlTRZIeZwa9svPmJxn7uLlonB4ii3tzWo4JaZB+OTm+vRBgom84o02rvJN\nCmJB8/XhBwKBgE12nUHpceNKGEXmqRJZsrjJNzZkqw8z5MSFl0/5Soe8PYBAUF+E\nlWTM0I2BQBCnns6Eh/jQmZauFeybRvW3A71uuWoeGgj7dxto2VSSWaJRUio+2sBD\nn0ScSawgqpZQjiujEnNfPutVELHGD3pMfVZ6t1l/iARK74uC8Hg/Kd8tAoGBAKEC\n0mYsMgXjKMIRGj7Ehhj17+v5NMdbjgZkYnzJmmdhtMUIbALzOhK7SwxVTANjEV+M\nOWSktB1J7O6Wfa61JqIyAHJiGEF5pZGvA6F3h9z4Thxx/UuO3x2BF62xSxevuHto\nO2cX2aKI/Tf90Cbnbdj/yFled02yR7F8ALMi2v9fAoGAL9AzzBJOGXy1SKiE5izg\nsvmwe2B8ohOc9CRB94r6z+1uNBmk+Eq3vxMytXzhVoikioEQuV7UID65rledLB7F\nanRpydaUJzbiewP48H3I9l1aaGqteUObjvI2e8RSRFZeb7fyTd3ulhlNyPHaHeLl\nQOElJqHbn+zpEAyR7+6WT3o=\n-----END PRIVATE KEY-----\n",
    client_email: "df-speech@slang-fonos-testbed.iam.gserviceaccount.com",
  }
}

async function testIntent(text) {
  const sessionId = uuid.v4()
  const sessionClient = new dialogflow.SessionsClient(c)
  const sessionPath = sessionClient.projectAgentSessionPath(
    "slang-fonos-testbed",
    sessionId
  );

  // Forcing WELCOME on the first API call
  const request1 = {
    session: sessionPath,
    queryInput: {
      text: {
        text: "helloslang",
        languageCode: "en_US",
      },
    },
  }

  await sessionClient.detectIntent(request1)

  const request2 = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
        languageCode: "en_US",
      },
    },
  }

  return await sessionClient.detectIntent(request2)
}

testIntent("goodbye")
  .then(responses => console.log(JSON.stringify(responses), null, ' '))
  .catch(console.error)
