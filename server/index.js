require('newrelic');
const path = require('path');
const express = require('express');
const cluster = require('cluster');
const { handleGet } = require('./helpers/getHandlers.js');
const cors = require('cors');

const parser = require('body-parser');

const app = express();
module.exports.app = app;

// Set what we are listening on.
app.set('port', (process.env.PORT || 3006));

app.use(parser.json());
// app.use(express.static(`${__dirname}/../client/dist`));
app.use(cors());

const React = require('react');
const ReactDom = require('react-dom/server');
const Layout = require('../templates/layout.js')
let Community = require('../client/dist/serverbundle.js').default;

const renderComponent = (component, props = {}) => {
  component = React.createElement(component, props);
  return ReactDom.renderToString(component);
}

if (cluster.isMaster) {
  const cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i += 1) {
      cluster.fork();
  }
} else {
  app.listen(app.get('port'));
  console.log('Listening on', app.get('port'));

  app.get('/Z/:id', (req, res) => {
    let { id } = req.params;
    Community = renderComponent(Community, {projectId: id});
    res.end(Layout(Community, id));
  });

  app.use('/assets', express.static(path.resolve(__dirname, '../client/dist/')));

  app.get('/api/community/:id', handleGet);
}

  // cluster.on('exit', function (worker) {
//   console.log('Worker %d died :(', worker.id);
//   cluster.fork();
// });

// Handle Get requests
// app.get('/api/community/:id', (req, res) => {
//   const { id } = req.params;
//   // grab project information
//   const projectQuery = `SELECT p.title, p.creator
//                         FROM projects p
//                         WHERE p.id = ${id}`;
//   // grab backers for project
//   const backersQuery = `SELECT u.*
//                         FROM users u
//                         INNER JOIN projects_users pu
//                         ON u.id = pu.users_id
//                         WHERE pu.projects_id = ${id}`;

//   pgClient.query(projectQuery, (err, projectInfo) => {
//     if (err) {
//       res.status(500);
//       res.send(err);
//       return;
//     }
//     pgClient.query(backersQuery, (err, backersInfo) => {
//       if (err) {
//         res.status(500);
//         res.send(err);
//         return;
//       }
//       const project = projectInfo.rows[0];
//       const backers = backersInfo.rows;
//       for (let i = 0; i < backers.length; i++) { // for each backer add a fundedprojects property to it
//         const backer = backers[i];
//         const backerID = backer.id;
//         const fundedProjects = `SELECT COUNT(*) FROM (
//                                   SELECT p.*
//                                   FROM projects p
//                                   INNER JOIN projects_users pu
//                                   ON p.id = pu.projects_id
//                                   WHERE pu.users_id = ${backerID}
//                                 ) projectcount`;
//         pgClient.query(fundedProjects, (err, fundedProjectCount) => {
//           if (err) {
//             res.status(500);
//             res.send(err);
//             return;
//           }
//           backer.fundedProjects = parseInt(fundedProjectCount.rows[0].count, 10);
//           if (i === backers.length - 1) { // if the all of the backers have been iterated through, add array of backers as backers property to result
//             project.backers = backers;
//             res.send(project);
//           }
//         });
//       }
//     });
//   });
// });


// user navigates to url => hostip:3210
// host receives this 