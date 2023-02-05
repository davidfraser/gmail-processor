// NOTE: Adjust config to your requirements here:
var v2config = {
  description: "An example V2 configuration",
  settings: {
    dryRun: true,
    maxBatchSize: 10,
    maxRuntime: 280,
    processedMode: "read",
    sleepTimeThreads: 100,
    sleepTimeMessages: 0,
    sleepTimeAttachments: 0,
    timezone: "UTC",
  },
  global: {
    match: {
      query: "has:attachment -in:trash -in:drafts -in:spam",
      maxMessageCount: -1,
      minMessageCount: 1,
      newerThan: "1d",
    },
    actions: [],
  },
  threadHandler: [
    {
      description:
        "Store all attachments sent to my.name+scans@gmail.com to the folder 'Scans'",
      match: {
        query: "to:my.name+scans@gmail.com",
      },
      actions: [
        {
          name: "attachment.storeToGDrive",
          args: {
            folder: "Scans-${message.date:dateformat:yyyy-MM-dd}",
          },
        },
      ],
    },
  ],
}

function run() {
  console.log("Processing v2 config started ...")
  GMail2GDrive.Lib.run(v2config, true)
  console.log("Processing v2 config finished ...")
  console.log(JSON.stringify(v2config))
}
