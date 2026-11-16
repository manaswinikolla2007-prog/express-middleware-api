import express from "express";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
const app = express();
//Application level middleware
//Third party
app.use(cors());
app.use(morgan("dev"));
//Built in
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//custom
const logger = (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const period = Date.now() - start;
        const log = `${req.method} ${req.url} ${res.statusCode} ${period}ms\n`;
        fs.appendFile("./server.log", log, (err) => {
            if(err) {
                console.log(err);
            }
        });
    });
    next();  
};
app.use(logger);      
const PORT = 6500;
const validate = (req, res, next) => {
    if(!req.body) {
        const err = new Error("Patient details missing");
        err.statusCode = 400;
        throw err;
    }
    const { name, gender, ward } = req.body;
       if(!name || !gender || !ward) {
        const err = new Error("patient details missing");
        err.statusCode = 400;
        throw err;
       }
       next();
};
//CRUD
//create POST http://localhost:6500/api/v1/patients
//payload: {name, gender, ward }
app.post("/api/v1/patients", validate, (req, res) => {
    res.status(200).send("Patient created successfully");
});
//Read GET http://localhost:6500/api/v1/patients
//Read GET http://localhost:6500/api/v1/patients?ward=ICU
app.get("/api/v1/patients", (req, res) => {
    const ward = req.query.ward;
    if (ward) {
        res.status(200).send(`Patients in ward ${ward} fetched successfully`);
    } else {
        res.status(200).send("All patients fetched successfully");
    }
});
//Read GET http://localhost:6500/api/v1/patients/:id
app.get("/api/v1/patients/:id", (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Patient with ID ${id} fetched successfully`);
});
//Update PUT http://localhost:6500/api/v1/patients/:id
app.put("/api/v1/patients/:id", validate, (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Patient with ID ${id} updated successfully`);
});
//Delete DELETE http://localhost:6500/api/v1/patients/:id
app.delete("/api/v1/patients/:id", (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Patient with ID  ${id} deleted successfully`);
});
//404
app.use((req, res) => {
    res.status(404).send("Resource not found");
});
//Error handling
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    res.status(statusCode).send(message);
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});