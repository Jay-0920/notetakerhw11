// Dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use(express.static("public"));

server.get("/notes", (req, res) =>{
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

server.get("/api/notes", (req, res) =>{
    fs.readFile(path.join(__dirname, "/db/db.json"), (err,data) =>{
        if(err) throw err;
        return res.json(JSON.parse(data));
    });
});

server.post("/api/notes", (req,res) => {
    const newNote = req.body;

    readFileAsync(path.join(__dirname, "/db/db.json"), "utf-8").then(data =>{
        const api = JSON.parse(data);
        newNote.id = api.length + 1;
        api.push(newNote);
        writeFileAsync(path.join(__dirname, "/db/db.json"), JSON.stringify(api)).then(err =>{
            if(err) throw err;
            console.log("value added to file");
        });
        res.json(api);
    });
});

server.delete("/api/notes/:id", (req, res) =>{
    const note = req.params.id;
    readFileAsync(path.join(__dirname, "/db/db.json"), "utf-8").then(data =>{
        const api = JSON.parse(data);
        for(const currentNote of api)
            if(currentNote.id == note)
                api.splice(api.indexOf(currentNote),1);
        for(let i = 0; i < api.length; i++)
            api[i].id = i + 1;
        writeFileAsync(path.join(__dirname, "/db/db.json"), JSON.stringify(api)).then(err =>{
            if(err) throw err;
            console.log("File Updated");
        });
        return res.json(api);
    });
});

server.get("*", (req, res) =>{
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

server.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});