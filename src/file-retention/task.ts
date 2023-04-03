import logger from "@fonoster/logger";
import fs from "fs";
import path from "path";
import { differenceInHours } from "date-fns";

export type FileRetentionPolicyConfig = {
  filesDirectory: string;
  maxFileAge: number;
  fileExtension: string;
};

export const runFileRetentionPolicy = (config: FileRetentionPolicyConfig) => {
  logger.verbose(
    "running file retention policy in directory: " + config.filesDirectory
  );

  fs.readdir(config.filesDirectory, (err, files) => {
    if (err) throw err;

    const ttsFiles = files.filter(
      (file) => path.extname(file) === config.fileExtension
    );

    logger.verbose("found " + ttsFiles.length + " files to be deleted");

    for (const file of ttsFiles) {
      const filePath = path.join(config.filesDirectory, file);

      fs.stat(filePath, (err, stats) => {
        if (err) throw err;

        const diff = differenceInHours(new Date(), stats.atime);

        if (diff > config.maxFileAge) {
          logger.verbose(
            "file " + file + " was last accessed " + diff + " hours ago"
          );

          logger.verbose("deleting file " + file);

          fs.unlink(filePath, (err) => {
            if (err) throw err;
          });
        }
      });
    }
  });
};
