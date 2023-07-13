const indexR = require("./index");
const usersR = require("./users");
const projectsR = require("./projects");
const missionsR = require("./missions");
const contactR = require("./contact");


exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/projects",projectsR);
  app.use("/missions",missionsR);
  app.use("/contact",contactR);
}