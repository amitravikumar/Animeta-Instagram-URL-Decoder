const cluster = require('cluster');
// const { cpus } = require('os');
const v8 = require('v8');
// const numCPUs = cpus().length;

if (cluster.isMaster) {
  // for (let i = 0; i < numCPUs; i++) {
  //   cluster.fork();
  // }
  cluster.fork();
  cluster.on('exit', (deadWorker, code, signal) => {
    // Restart the worker
    let worker = cluster.fork();

    // Note the process IDs
    let newPID = worker.process.pid;
    let oldPID = deadWorker.process.pid;

    // Log the event
    console.log('worker ' + oldPID + ' died.');
    console.log('worker ' + newPID + ' born.');
  });
} else { // worker
  const initialStats = v8.getHeapStatistics();

  const totalHeapSizeThreshold =
    initialStats.heap_size_limit * 85 / 100;
  console.log("totalHeapSizeThreshold: " + totalHeapSizeThreshold);

  let detectHeapOverflow = () => {
    let stats = v8.getHeapStatistics();

    console.log("total_heap_size: " + (stats.total_heap_size));

    if ((stats.total_heap_size) > totalHeapSizeThreshold) {
      process.exit();
    }
  };
  setInterval(detectHeapOverflow, 1000);
  const express = require("express");
  const cors = require("cors");
  const helmet = require("helmet");
  const swaggerUi = require("swagger-ui-express");
  const path = require("path");
  const app = express();
  app.enable("trust proxy");
  
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
  });
  
  app.use(
    require("morgan")("dev", {
      skip: function (req, res) {
        return res.statusCode > 500;
      }
    })
  );
  // console.log(process.argv)
  const args = process.argv.slice(2)[0];
  if (!args) {
    console.log("Error : Please provide environment");
  } else {
    process.env.CONFIG_ARG = args;
    if (!(/PROD/).test(process.env.CONFIG_ARG)) {
      require("dotenv").config({
        path: path.join(process.cwd(), `.env.${args.toLocaleLowerCase()}`)
      });
      const { CustomLogger } = require("./src/middleware/logger");
      let appLogger = new CustomLogger();
  
      app.use(appLogger.requestDetails(appLogger));
    }
    let CONFIG = require("./src/configs/config")(args);
    let { DB_CHOICE } = require('./src/configs/thirdpartyConfig')
    const swaggerDocument = require("./docs/swagger.json");
    const { handler } = require("./src/middleware/errorHandler");
  
    const routers = require("./src/routes");
    const opts = {
      explorer: false,
      swaggerOptions: {
        validatorUrl: null
      },
      customSiteTitle: "Doodleblue User Auth Service",
      customfavIcon: "https://www.doodleblue.com/favicon/16x16.png"
    };
  
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, opts));
    app.use("/health", (req, res) => {
      res.status(200).json({ status: "success", message: "Running successfully" })
    });
    // app.use("/", (req, res, next) => {
    //   res.redirect("/docs")
    // })
    routers(app);
    app.use(handler);
  
    const port = CONFIG.PORT || 2501;
  
    let dbConn;
    switch (DB_CHOICE) {
      case "MONGO":
        dbConn = require("./src/database/mongo/db.config");
        break;
      default:
        throw new Error("Database Type not defined");
      //   break;
    }
    dbConn()
      .then(() => {
        app.listen(port, () => console.log(`App listening at port ${port}`));
      })
      .catch(console.error);
  }
  module.exports = app;
}
