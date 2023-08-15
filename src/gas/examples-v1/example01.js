/* global GmailProcessor */

var example01ConfigV1 = {
  globalFilter: "has:attachment -in:trash -in:drafts -in:spam",
  processedLabel: "gmail2gdrive/client-test",
  sleepTime: 100,
  maxRuntime: 280,
  newerThan: "1d",
  timezone: "GMT",
  rules: [
    {
      filter: "to:my.name+scans@gmail.com",
      folder: "'Scans'-yyyy-MM-dd",
    },
    {
      filter: "from:example1@example.com",
      folder: "'Examples/example1'",
    },
    {
      filter: "from:example2@example.com",
      folder: "'Examples/example2'",
      filenameFromRegexp: ".*.pdf$",
    },
    {
      filter: "(from:example3a@example.com OR from:example3b@example.com)",
      folder: "'Examples/example3ab'",
      filenameTo: "'file-'yyyy-MM-dd-'%s.txt'",
      archive: true,
    },
    {
      filter: "label:PDF",
      saveThreadPDF: true,
      folder: "'PDF Emails'",
    },
    {
      filter: "from:example4@example.com",
      folder: "'Examples/example4'",
      filenameFrom: "file.txt",
      filenameTo: "'file-'yyyy-MM-dd-'%s.txt'",
    },
  ],
}

function example01EffectiveConfig() {
  const effectiveConfig =
    GmailProcessor.Lib.getEffectiveConfigV1(example01ConfigV1)
  console.log(JSON.stringify(effectiveConfig, null, 2))
}

function example01Run() {
  GmailProcessor.Lib.runWithV1Config(example01ConfigV1, "dry-run")
}

function example01ConvertConfig() {
  const config = GmailProcessor.Lib.convertV1ConfigToV2Config(example01ConfigV1)
  console.log(JSON.stringify(config, null, 2))
}
