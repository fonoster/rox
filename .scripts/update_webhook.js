#!/usr/bin/node
const Numbers = require("@fonos/numbers");
const config = "../.config/rox.json";
let roxanneConfig;

try {
  roxanneConfig = require(config);
} catch (e) {
  console.error("Unable to open config file: %s", config);
  process.exit(1);
}

console.log("api config file: %s", process.env.API_CONFIG_FILE);

const webhook = roxanneConfig.webhook || process.env.WEBHOOK;

if (!webhook || webhook === "") {
  console.log("You must set the webhook on roxanne.json or the env variable WEBHOOK");
  process.exit(1);
}

const numbers = new Numbers();

numbers.updateNumber({
  ref: roxanneConfig.numberRef,
  ingressInfo: { webhook }
})
  .then(() => console.log("Updated webhook!"))
  .catch(console.error);