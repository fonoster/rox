import cron from "node-cron";
import logger from "@fonoster/logger";
import { ServerConfig } from "../types";
import { runFileRetentionPolicy } from "./task";

export const startFileRetentionPolicy = (config: ServerConfig) => {
  if (config.fileRetentionPolicyEnabled) {
    logger.info("File retention policy enabled");

    cron.schedule(config.fileRetentionPolicyCronExpression, () =>
      runFileRetentionPolicy({
        filesDirectory: config.fileRetentionPolicyDirectory,
        maxFileAge: config.fileRetentionPolicyMaxAge,
        fileExtension: config.fileRetentionPolicyExtension
      })
    );

    return
  }

  logger.warn("Precaution: File retention policy is disabled, all files will be kept forever in the server");
};
