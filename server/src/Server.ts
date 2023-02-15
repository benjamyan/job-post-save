/// <reference path='../../.d.ts' />

// import { default as Express } from 'express';
// import { default as dotenv } from 'dotenv';
// import { TypedEmitter } from 'tiny-typed-emitter';
import * as Path from 'path';
import { JobRoutesHandler } from './routes';
import { JobPostServerApplication, JobPostServerEvents } from './Base';
import { JobDataProxy } from './services';

export class JobPostServer extends JobPostServerApplication {

    constructor() {
        super();
        
        this.on('server.start', this.initializeExpressServer);
        this.on('server.listening', ()=> {
            try {
                Object.assign(
                    this.jobInfo,
                    JobDataProxy(Path.resolve(__dirname, this.app.locals.BASE_DIRECTORY + this.app.locals.JOB_INFO_FILE))
                );
                this.setupServerRouting();
            } catch (err) {
                this.emit('error', {
                    error: err instanceof Error ? err : new Error('Unhandled exception'),
                    severity: 1
                })
            }
        });
        this.emit('init');
    }
    
    private initializeExpressServer() {
        this.logger('JobPostServer.initializeExpressServer()');
        try {
            this.app.listen((
                process.env.API_DOMAIN !== undefined && process.env.API_DOMAIN.length > 0
                    ? `${process.env.API_DOMAIN}:${process.env.API_PORT}`
                    : process.env.API_PORT
            ), ()=> {
                console.log(`Listening on ${process.env.API_PORT}`);
                this.emit('server.listening');
            })
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error('Unhandled error: JobPostServer.initializeExpressServer()'),
                severity: 1
            })
        }
    }
    
    private setupServerRouting() {
        this.app.use(function(_req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        // this.app.use(()=> new JobRoutesHandler())
        new JobRoutesHandler();
        
        // this.app.use('/jobs', JobRoutesHandler.jobs)
        
        // this.app.get("/jobs", (req, res, next)=> {
        //     try {
        //         if (req.query.id !== undefined) {
        //             if (typeof(req.query.id) === 'string') {
        //                 const jobById = this.jobInfo.get(req.query.id)
        //                 if (jobById !== undefined) {
        //                     res
        //                         .contentType('application/json')
        //                         .status(200)
        //                         .send(jobById)
        //                 } else {
        //                     res.sendStatus(404);
        //                 }
        //                 return;
        //             }
        //         } else if (Object.keys(req.query).length === 0) {
        //             res
        //                 .setHeader('Content-Type', 'application/json')
        //                 .status(200)
        //                 .send({
        //                     jobs: [...this.jobInfo.values()]
        //                 });
        //             return;
        //         }
        //         res.sendStatus(400);
        //     } catch (err) {
        //         this.emit('error', {
        //             error: err instanceof Error ? err : new Error(`Unhandled exception`),
        //             severity: 2,
        //             response: res
        //         });
        //     }
        //     return;
        // });
    }

}

