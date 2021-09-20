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

To allow for seamless integration between Dialogflow and Rox, we introduced the concept of Effects. Effects are actions sent from Dialogflow to Rox so you don't have to programm the behavior everytime. All you need to do is send the Effect's payload and Rox will react accordingly.

> You can send multiple responses from Dialogflow. The Effects will run in sequence.

<table>
<tr>
<td> Effect ID </td> <td> Description </td> <td> Payload Example </td>
</tr>
<tr>
<td> 

`say` 

</td>
<td> The Effect will randomly pick a textual response and play it back to the user </td>
<td>
  
```json
{
  "effect": "say",
  "parameters": {
    "responses": [
      "Goodbye!",
      "Talk later",
      "Bye!",
      "Have a good one!"
    ]
  }
}
```

</td>
</tr>
<tr>
<td> 

`hangup` 

</td>
<td> The hangup Effect will close the call </td>
<td>

```json
{
  "effect": "hangup"
}
```

</td>
</tr>
<tr>
<td> 

`send_link` 

</td>
<td> Use this Effect send arbitrary data to the client. Note that this only works with clients that subscribe for events</td>
<td>

```json
{
  "effect": "send_data",
  "parameters": {
    "type": "map",
    "icon": "https://freeicons.net/icons/map.png",
    "link": "https://goo.gl/maps/YTum2VeZSQwNB4ik6"
  }
}
```

</td>
</tr>
<tr>
<td> 

`transfer` 

</td>
<td> Forward call to a different endpoint </td>
<td>

```json
{
  "effect": "transfer",
  "parameters": {
    "endpoint": "sip:17853178070@acme.fonoster.io"
  }
}
```

</td>
</tr>
</table>

## Environment Variables

Environment variables are used in the entry point script to render configuration templates. You can specify the values of these variables during `docker run`, `docker-compose up`, or in Kubernetes manifests in the `env` array.

- `INTENTS_ENGINE` - Use to select the intents engine. Accepts `watson` or `dialogflow`. **Required**
- `ASR_ENGINE` - Use to select the ASR engine. Accepts `google`. **Required**
- `TTS_ENGINE` - Use to select the TTS engine. Accepts `google`. **Required**
- `INITIAL_DTMF` - Set if you want to send a DTMF at the begining of the call
- `WELCOME_INTENT` - Set if you want to ask the backend for a welcome intent
- `INTERACTION_TIMEOUT` - Timeout, in seconds, to ask again for user input. Use `-1` for no timeout. Defaults to `-1`
- `EVENTS_ENABLED` - If set to `true` it will send events to ws clients subscribed to events. Defaults to `false`
- `ACTIVATION_INTENT` - Set to the desired intent if you want to have an activation command. If this is set, the `INTERACTION_TIMEOUT` will have not effects.
- `ACTIVATION_TIMEOUT` - Time in seconds for the duration of the `AWAKE_ACTIVE` state, set for the activation command. After this time the bot will return to `AWAKE_PASSIVE` and new intents will be ignored. Defaults to `15000`
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

