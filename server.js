var path = require('path');
var express = require('express');
var app = express();
var fs = require('fs');
const querystring = require('querystring');
const url = require('url');

var information = [];
var ips = [];

var dir = __dirname;

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

app.get('*', function (req, res) {
    let query = querystring.parse(req.url.split("?")[1]);
    let url = req.url.split("?")[0];

    try {
        if (url.split("/")[1] == "teacher") {
            res.write("==Teacher Display==\n\n");

            let teachercode = url.split("/")[2];

            try {
                switch (url.split("/")[3]) {
                    default: 
                        res.write("Hmm. Are you looking for something?\n");
                        res.write("Your teachercode was: " + teachercode + "\n");
                        res.write("Your raw URL was: " + req.url + "\n");
                        res.write("Your (cleaned) URL was: " + url + "\n");
                        res.write("Your query object was: " + JSON.stringify(query) + "\n");
                        break;
                    case "view":
                        for (let i = 0; i < information.length; i++) {
                            if (information[i].teacher == teachercode) {
                                res.write("-- Student id: " + information[i].id + "\n");
                                res.write("q1: " + information[i].q1 + "\n");
                                res.write("q2: " + information[i].q2 + "\n");
                                res.write("q3: " + information[i].q3 + "\n");
                                res.write("q4: " + information[i].q4 + "\n");
                                res.write("q5: " + information[i].q5 + "\n");
                            }
                        }
                        break;
                    case "cleardata":
                        ips = [];
                        for (let i = 0; i < information.length; i++) {
                            if (information[i].teacher == teachercode) {
                                information[i] = {};
                                information[i].teacher = "";
                            }
                        }
                        res.write("cleared!\n");
                        break;
                }
            } catch (e) {
                res.write("encountered an error while parsing the url / displaying student data \n");
                res.write(e.toString());
                res.write("\n");
            }
            res.write("\n----\n");
            res.write("Go to /teacher/[teachercode]/view/ to view all of your students!\n");
            res.write("Or go to /teacher/[teachercode]/cleardata/ to clear all data of your class\n");
            res.end();
        } else {
            let flagged = false;
            if (!(query.id == "" || query.id == null || query.teacher == "" || query.teacher == null) && !(ips.includes(req.ip))) {
                if (query.question1 && query.question2 && query.question3 && query.question4 && query.question5) {
                    let temp = {};

                    temp.teacher = query.teacher;
                    temp.id = query.id;
                    temp.q1 = query.question1.slice(7);
                    temp.q2 = query.question2.slice(7);
                    temp.q3 = query.question3.slice(7);
                    temp.q4 = query.question4.slice(7);
                    temp.q5 = query.question5.slice(7);

                    ips.push(req.ip);
                    information.push(temp);
                } else {
                    res.write("Hey! Fill out the entire form!");
                    res.end();
                    flagged = true;
                }
            } else {
                res.write("Missing student ID or you have submitted twice!");
                res.end();
                flagged = true;
            }
            if (!flagged) {
                var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
                if (file.indexOf(dir + path.sep) !== 0) {
                    return res.status(403).end('Forbidden');
                }
                var type = mime[path.extname(file).slice(1)] || 'text/plain';
                var s = fs.createReadStream(file);
                s.on('open', function () {
                    res.set('Content-Type', type);
                    s.pipe(res);
                });
                s.on('error', function () {
                    res.set('Content-Type', 'text/plain');
                    res.status(404).end('Not found');
                });
            }
        }
    } catch (e) {
        res.write("A server-side error occured. Please try something else.\n");
        res.write(e.toString());
        res.write("\n");
    }
});

app.listen(8080, function () {
    console.log('Listening on http://localhost:8080/');
});