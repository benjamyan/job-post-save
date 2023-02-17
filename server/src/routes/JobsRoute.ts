import { default as Express } from 'express';
import { build_JobEntry } from '../factories';
import { RouterBase } from './RouterBase';

export class JobRoutesHandler extends RouterBase {
    
    constructor() {
        super({
            permittedQueries: {
                get: [ 'id' ],
                post: [],
                patch: [],
                delete: [ '!id' ]
            },
            requiredHeaders: {
                post: {
                    'Content-Type': 'application/json'
                }
            },
            permittedBodyKeys: {
                post: [ '!abs_url', '!job_title', '!company_name', 'role_type', 'yoe', 'keywords', 'severity', 'date_posted' ],
                patch: [ '!_guid', '_applied', 'job_title', 'company_name', 'role_type', 'yoe', 'keywords', 'severity' ]
            }
        });
        
        this.app.use('/jobs', (req: Express.Request, res: Express.Response, next)=> {
            switch (req.method) {
                case 'GET':
                case 'POST':
                case 'PATCH':
                case 'DELETE': {
                    return next()
                }
                default: {
                    res.sendStatus(405);
                }
            }
        })
        this.app.use('/jobs', [ this.parsePermittedRouteOptions ]);
        this.app.get('/jobs', [ this.getJobData ]);
        // this.app.post('/jobs', [ this.validateRequestBody, this.addNewJobData ]);
        // this.app.patch('/jobs', [ this.validateRequestBody, this.addNewJobData ]);
        this.app.delete('/jobs', [ this.deleteJobDataEntry ]);
        // this.app.use('/jobs', [ this.parseRequestHeaders, this.parseRequestQueries ]);
        // this.app.get('/jobs', [ this.getJobData ]);
        // this.app.post('/jobs', [ this.validateRequestBody, this.addNewJobData ]);
        // this.app.patch('/jobs', [ this.validateRequestBody, this.addNewJobData ]);
        // this.app.delete('/jobs', [ this.deleteJobDataEntry ]);
    }
    
    public getJobData = (req: Express.Request, res: Express.Response)=> {
        try {
            if (req.query.id !== undefined) {
                if (typeof(req.query.id) !== 'string') {
                    res.status(400).send('Invalid query type ID');
                } else if (this.jobInfo[req.query.id] === undefined) {
                    res.status(404).send(`No job matches provided id of ${req.query.id}`);
                } else {
                    res
                        .setHeader('Content-Type', 'application/json')
                        .status(200)
                        .send(this.jobInfo[req.query.id])
                }
            } else {
                res
                    .setHeader('Content-Type', 'application/json')
                    .status(200)
                    .send({
                        jobs: Object.values(this.jobInfo)
                    });
            }
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error('Unhandled exception. JobRoutesHandler.getJobData'),
                severity: 2,
                response: res
            })
        }
    }
    public addNewJobData = (req: Express.Request, res: Express.Response)=> {
        try {
            const newJob = build_JobEntry(req.body);
            
            if (newJob instanceof Error) {
                throw newJob;
            } else if (this.jobInfo[newJob._guid] !== undefined) {
                this.addNewJobData(req, res);
                return;
            } else {
                this
                    .insertUniqueEntry('jobs', newJob)
                    .then((result)=>{
                        if (result === 1) {
                            this.jobInfo[newJob._guid] = newJob;
                            res.sendStatus(201);
                            return;
                        }
                        res.status(409).send(`An entry for this URL already exists.`);
                    })
                    .catch((reject)=>{
                        this.emit('error', {
                            error: reject instanceof Error ? reject : new Error('Unhandled exception on Database. JobRoutesHandler.addNewJobData'),
                            severity: 2,
                            response: res
                        })
                    })
            }
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error('Unhandled exception. JobRoutesHandler.addNewJobData'),
                severity: 2,
                response: res
            })
        }
    }
    public updateSingleJobDataEntry = (req: Express.Request, res: Express.Response)=> {
        console.log(req.body)
        res.sendStatus(501);
    }
    public deleteJobDataEntry = (req: Express.Request, res: Express.Response)=> {
        console.log(req.query)
        res.sendStatus(501);
    }

}
