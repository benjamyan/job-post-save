import { default as Express } from 'express';
import { RouterBase } from './RouterBase';

export class JobRoutesHandler extends RouterBase {
    
    constructor() {
        super({
            permittedRouteQueries: {
                get: ['id']
            }
        });
        
        this.app.use('/jobs', (req: Express.Request, res: Express.Response, next)=> {
            switch (req.method) {
                case 'GET':
                case 'POST':
                case 'UPDATE':
                case 'DELETE': {
                    return next()
                }
                default: {
                    res.sendStatus(405);
                }
            }
        })
        this.app.get('/jobs', this.parseRequestQueries, this.getJobData);

    }
    
    public getJobData = (req: Express.Request, res: Express.Response)=> {
        if (req.query.id !== undefined) {
            if (typeof(req.query.id) !== 'string') {
                res.status(400).send('Invalid query type ID');
            } else if (this.jobInfo[req.query.id] === undefined) {
                res.status(404).send(`No job matches provided id of ${req.query.id}`);
            } else {
                res
                    .contentType('application/json')
                    .status(200)
                    .send(this.jobInfo[req.query.id])
            }
        } else {
            res
                .setHeader('Content-Type', 'application/json')
                .status(200)
                .send(this.jobInfo);
        }
    }

}
