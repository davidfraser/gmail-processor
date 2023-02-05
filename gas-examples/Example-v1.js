// NOTE: Adjust config to your requirements here:
var v1config = {
  // Global filter
  globalFilter: "has:attachment -in:trash -in:drafts -in:spam",
  // Gmail label for processed threads (will be created, if not existing):
  processedLabel: "gmail2gdrive/client-test",
  // Sleep time in milli seconds between processed messages:
  sleepTime: 100,
  // Maximum script runtime in seconds (google scripts will be killed after 5 minutes):
  maxRuntime: 280,
  // Only process message newer than (leave empty for no restriction; use d, m and y for day, month and year):
  newerThan: "1d",
  // Timezone for date/time operations:
  timezone: "GMT",
  // NOTE: Adjust rules to your requirements here:
  rules: [
    {
      // Store all attachments sent to my.name+scans@gmail.com to the folder "Scans"
      filter: "to:my.name+scans@gmail.com",
      folder: "'Scans'-yyyy-MM-dd",
    },
    {
      // Store all attachments from example1@example.com to the folder "Examples/example1"
      filter: "from:example1@example.com",
      folder: "'Examples/example1'",
    },
    {
      // Store all pdf attachments from example2@example.com to the folder "Examples/example2"
      filter: "from:example2@example.com",
      folder: "'Examples/example2'",
      filenameFromRegexp: ".*.pdf$",
    },
    {
      // Store all attachments from example3a@example.com OR from:example3b@example.com
      // to the folder "Examples/example3ab" while renaming all attachments to the pattern
      // defined in 'filenameTo' and archive the thread.
      filter: "(from:example3a@example.com OR from:example3b@example.com)",
      folder: "'Examples/example3ab'",
      filenameTo: "'file-'yyyy-MM-dd-'%s.txt'",
      archive: true,
    },
    {
      // Store threads marked with label "PDF" in the folder "PDF Emails" als PDF document.
      filter: "label:PDF",
      saveThreadPDF: true,
      folder: "PDF Emails",
    },
    {
      // Store all attachments named "file.txt" from example4@example.com to the
      // folder "Examples/example4" and rename the attachment to the pattern
      // defined in 'filenameTo' and archive the thread.
      filter: "from:example4@example.com",
      folder: "'Examples/example4'",
      filenameFrom: "file.txt",
      filenameTo: "'file-'yyyy-MM-dd-'%s.txt'",
    },
  ],
}

function runWithV1Config() {
  console.log("Processing v1 config started ...")
  GMail2GDrive.Lib.runWithV1Config(v1config, true)
  console.log("Processing v1 config finished ...")
}
