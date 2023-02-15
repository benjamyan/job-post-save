/// <reference path='../../.d.ts' />

import { default as Express } from 'express';
import { default as dotenv } from 'dotenv';
import { TypedEmitter } from 'tiny-typed-emitter';
import * as Path from 'path';
// import { JobPostServer } from './Server';
// import { JobPostRouteHandler } from './routes';

const app = Express();
app.locals = {
    BASE_DIRECTORY: null!,
    JOB_INFO_FILE: null!,
    SNIPPET_FILE: null!,
    API_DOMAIN: null!,
    API_PORT: null!
}
const jobInfo: Record<string, ApplicationGenerator.JobInfoEntry> = {};

export interface JobPostServerEvents {
    // https://www.npmjs.com/package/tiny-typed-emitter
    [key: string]: (...args0: any)=> void;
    error: (args: ApplicationGenerator.BaselineError)=> void;
}
export class JobPostServerApplication extends TypedEmitter<JobPostServerEvents> {
    private enableLogging: boolean = true;
    public app: Express.Application = app; // Express();
    // public config: Record<string, string> = this.app.locals;
    // public config: Record<string, string> = {
    //     BASE_DIRECTORY: null!,
    //     JOB_INFO_FILE: null!,
    //     SNIPPET_FILE: null!,
    //     API_DOMAIN: null!,
    //     API_PORT: null!
    // };
    public jobInfo: Record<string, ApplicationGenerator.JobInfoEntry> = jobInfo;
    static emitter: TypedEmitter<JobPostServerEvents>['emit'] = null!;
    
    constructor() {
        super();
        this.on('init', ()=> {
            this.mountEnvironmentalConfig();
            this.emit('server.start');
        })
        this.on('error', ({ error, severity, response })=>{
            console.warn(error);
            if (response !== undefined) {
                response.sendStatus(500);
            }
            if (severity === 1) {
                process.exit(2);
            }
        });
    }
    
    static {
        this.emitter = super.prototype.emit
    }
    
    public logger(msg: string, tracing?: boolean) {
        if (!this.enableLogging) {
            return;
        } else if (!!tracing) {
            console.trace(msg);
        } else {
            console.log(msg);
        }
    }

    private mountEnvironmentalConfig() {
        this.logger('JobPostServerApplication.mountEnvironmentalConfig()');
        /** Mount and check the environmental variables for errors */
        try {
            dotenv.config({ path: Path.resolve(__dirname, '../../.env') });
            for (const key of Object.keys(this.app.locals)) { 
                if (process.env[key] === undefined || typeof(process.env[key]) !== 'string') {
                    throw new Error(`Invalid or undefined variable: ${key}`);
                } else {
                    this.app.locals[key] = process.env[key] as string;
                }
            }
        } catch (err) {
            this.emit('error', {
                error: (
                    err instanceof Error ? err : new Error(`Unhandled exception: JobPostServerApplication.mountEnvironmentalConfig`)
                ),
                severity: 1
            })
            return;
        }
    }
    
}
