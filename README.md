# Rox AI

> Voicebot built on top of Project Fonos with support for Dialogflow and Watson Assistant.

![publish to docker](https://github.com/fonoster/rox/workflows/publish%20to%20docker%20hub/badge.svg)

This repository contains a dockerized distribution of Rox AI.

## Available Versions

You can see all images available to pull from Docker Hub via the [Tags](https://hub.docker.com/repository/docker/fonoster/rox/tags?page=1) page. Docker tag names that begin with a "change type" word such as task, bug, or feature are available for testing and may be removed at any time.

> The version is the same of the Asterisk this is image is based on

## Installation

You can clone this repository and manually build it.

```
cd fonoster/rox\:%%VERSION%%
docker build -t fonoster/rox:%%VERSION%% .
```

Otherwise you can pull this image from docker index.

```
docker pull fonoster/rox:%%VERSION%%
```

## Usage Example

The following is a basic example of using this image.

```
docker run -it \
  -p 3000:3000 \
  -e WELCOME_INTENT="welcome"
  -e INTENTS_ENGINE="watson" \
  -e ASR_ENGINE="google" \
  -e TTS_ENGINE="google" \
  -e ACTIVATION_INTENT="bot.activate" \
  fonoster/rox
```

## Specs for Dialogflow backend

The `say` effects will randomly pick a textual response from Dialog flow and playback to the user. To fullfill this effect with Dialogflow, you must send the effect as custom payload with the following structure:


```json
{
  "effect": "say",
  "parameters": {
    "responses": [
      "Welcome to Peter's restaurant. How can I help you today?"
    ]
  }
}
```

For the `hangup` effect you will need the following payload: 

```json
{
  "effect": "hangup"
}
```

For the `send_link` effect you will need the following payload: 

```json
{
  "effect": "send_link",
  "parameters": {
    "type": "map",
    "icon": "https://test.com/icons/test.gif",
    "link": "https://maps.test.com"
  }
}
```

> Note #1: The parameter `type` is set to map in the example, but you can send anything that makes send to the client.
> Note #2: If the parameter `allRequiredParamsPresent` is set to true, the fulfillmentText will be take presedence over the custom effects.

## Environment Variables

Environment variables are used in the entry point script to render configuration templates. You can specify the values of these variables during `docker run`, `docker-compose up`, or in Kubernetes manifests in the `env` array.

- `INTENTS_ENGINE` - Use to select the intents engine. Accepts `watson` or `dialogflow`. **Required**
- `ASR_ENGINE` - Use to select the ASR engine. Accepts `google`. **Required**
- `TTS_ENGINE` - Use to select the TTS engine. Accepts `google`. **Required**
- `INITIAL_DTMF` - Set if you want to send a DTMF at the begining of the call
- `WELCOME_INTENT` - Set if you want to ask the backend for a welcome intent
- `INTERACTION_TIMEOUT` - Timeout, in seconds, to ask again for user input. Use `-1` for no timeout. Defaults to `-1`
- `EVENTS_ENABLED` - If set to `true` it will send events to ws clients subscribed to events. Defaults to `false`
- `ACIVATION_INTENT` - Set to the desired intent if you want to have an activation command. If this is set, the `INTERACTION_TIMEOUT` will have not effects.
- `LANGUAGE_CODE` - Sets the default language for the application. Defaults to `en-US`

> The test extension is `17853178070`. Using ENABLE_TEST_ACCOUNT is not recommended in production.

## Exposed ports

- `3000` - Port to start a session request
- `3001` - Port to subscribe to `sendData` effects

## Volumes

- `/etc/rox/google.json` - This must exist if `INTENTS_ENGINE=dialogflow`, or `ASR_ENGINE=google`, or `TTS_ENGINE=google`
- `/etc/rox/watson.json` - This must exist if `INTENTS_ENGINE=watson`

## TODO

- Add authentication to secure the events port

## Contributing

Please read [CONTRIBUTING.md](https://github.com/fonoster/rox/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

- [Pedro Sanders](https://github.com/psanders)

See also the list of contributors who [participated](https://github.com/fonoster/rox/contributors) in this project.

## License

Copyright (C) 2021 by Fonoster Inc. MIT License (see [LICENSE](https://github.com/fonoster/rox/blob/main/LICENSE) for details).

