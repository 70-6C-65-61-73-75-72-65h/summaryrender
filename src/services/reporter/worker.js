const { parentPort } = require("worker_threads");
const pdf = require("pdf-creator-node");
const path = require("path");
const fs = require("fs");
const { v4: uuid4 } = require("uuid");

if (parentPort) {
  parentPort.on("message", async (data) => {
    try {
      const html = fs.readFileSync(
        path.join(__dirname, "./templates/default.html"),
        "utf8"
      );

      const pathName = path.join(__dirname, `./content/output-${uuid4()}.pdf`);

      const document = {
        html: html,
        data,
        path: pathName,
        type: "" // buffer stream
      };

      const options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
        header: {
          height: "45mm",
          contents: '<div style="text-align: center;">Author: Max Ulshyn</div>'
        },
        footer: {
          height: "28mm",
          contents: {
            first: "Cover page",
            2: "Second page", // Any page number is working. 1-based index
            default:
              '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
            last: "Last Page"
          }
        }
      };

      const pdfReport = await pdf.create(document, options);

      parentPort.postMessage(pdfReport);
    } catch (error) {
      parentPort.postMessage(error);
    }
  });
}
