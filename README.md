## 🤖 Rox AI: A connector for Dialogflow ES/CX 

![publish to docker](https://github.com/fonoster/rox/workflows/publish%20to%20docker%20hub/badge.svg)

This repository contains a dockerized distribution of Rox AI. Also, see [Fonoster](https://github.com/fonoster/fonoster).

## Youtube Demo

See a Car Rental demo using Rox AI

<div align="left">
  <a href="https://www.youtube.com/embed/41Rx8KPb5GU"><img width="300px" src="https://raw.githubusercontent.com/fonoster/rox/main/assets/youtube-3.svg" alt="Demo of Rox AI"/></a>
</div>

## Available Versions

You can see all images available to pull from Docker Hub via the [Tags](https://hub.docker.com/repository/docker/fonoster/rox/tags?page=1) page. Docker tag names that begin with a "change type" word such as task, bug, or feature are available for testing and may be removed at any time.

> The version is the same of the Asterisk this is image is based on

## Installation

You can clone this repository and manually build it.

```
cd fonoster/rox\:%%VERSION%%
docker build -t fonoster/rox:%%VERSION%% .
```

Otherwise, you can pull this image from the docker index.

```
docker pull fonoster/rox:%%VERSION%%
```

## Usage Example

The following is a basic example of using this image.

```
docker run -v $(pwd)/google.json:/home/fonoster/.fonoster/google.json \
  -it -p 3000:3000 fonoster/rox:0.3.0
```

## Specs for Dialogflow backend

To allow for seamless integration between Dialogflow and Rox, we introduced the concept of Effects. Effects are actions sent from Dialogflow to Rox so you don't have to program the behavior every time. All you need to do is send the Effect's payload and Rox will react accordingly.

You can set multiple responses in Dialogflow. The Effects will run in sequence.

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

`send_data` 

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
    "destination": "17853178070",
    "record": true
  }
}
```

</td>
</tr>
</table>

> Notes: The parameter `type` is set to map in the example, but you can send anything that makes send to the client. If the parameter `allRequiredParamsPresent` is set to true, the fulfillmentText will take precedence over the custom effects.

## Environment Variables

Environment variables are used in the entry point script to render configuration templates. You can specify the values of these variables during `docker run`, `docker-compose up`, or in Kubernetes manifests in the `env` array.

- `DEFAULT_LANGUAGE_CODE` - Sets the default language for the application. Defaults to `en-US`
- `GOOGLE_CONFIG_FILE` - The file containing the Service Account with access to Google Speech APIs and Dialogflow
- `OTL_EXPORTER_PROMETHEUS_PORT` - Sets Prometheus port. Defaults to `9090`
- `OTL_EXPORTER_PROMETHEUS_ENDPOINT` - Sets Prometheus endpoint. Defaults to `/metrics`
- `OTL_EXPORTER_JAEGER_URL` - If set, it will send traces to Jaeger
- `OTL_EXPORTER_GCP_ENABLED` - If set, it will send traces to GCP
- `OTL_EXPORTER_ZIPKIN_URL` - If set, it will send traces to Zipkin

## Exposed Ports

- `3000` - Port to start a session request
- `3001` - Port to subscribe for `send_data` effects
- `9090` - Default Prometheus port

## Volumes

- `/home/fonoster/.fonoster/google.json` - This must exist if `INTENTS_ENGINE=dialogflow`, or `ASR_ENGINE=google`, or `TTS_ENGINE=google`

## TODO

- Add authentication to secure the events port
- Include a `--log-level` flag (You can enable logs using the env LOGS_LEVEL)
- Include a `--app-port` so we can change the default voice application port
- Include a `--events-port` so we can change the default events port

## Contributing

Please read [CONTRIBUTING.md](https://github.com/fonoster/rox/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

- [Pedro Sanders](https://github.com/psanders)

See also the list of contributors who [participated](https://github.com/fonoster/rox/contributors) in this project.

## License

Copyright (C) 2021 by Fonoster Inc. MIT License (see [LICENSE](https://github.com/fonoster/rox/blob/main/LICENSE) for details).
