import { default as Express } from 'express';
import { JobPostServerApplication } from "../Base";

export interface RouterProps {
    permittedRouteQueries: {
        [key: string]: Array<string>;
    }
}

export class RouterBase extends JobPostServerApplication {
    private permittedRouteQueries: RouterProps['permittedRouteQueries'] = null!;

    constructor(routerProps: RouterProps) {
        super();
        
        for (const prop in routerProps) {
            // @ts-expect-error
            this[prop] = routerProps[prop];
        }
        
        /** Binds the calling context to this instance - fixes having to bind every call from its invoking class */
        Object
            .getOwnPropertyNames(RouterBase.prototype)
            .filter((propertyName) => {
                // console.log(propertyName)
                return propertyName !== 'constructor'
            })
            .forEach((method) => {
                // console.log(method)
                // @ts-expect-error
                this[method] = this[method].bind(this)
            });
        // this.bindMethodContext(RouterBase)
    }
    
    public parseRequestQueries(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        try {
            if (Object.keys(req.query).length === 0) {
                /** No queries move on */
                return next();
            } else if (Object.keys(this.permittedRouteQueries).includes(req.method.toLowerCase())) {
                /** If the method is defined within the permitted queries var */
                if (Object.keys(req.query).every((query)=>this.permittedRouteQueries[req.method.toLowerCase()].includes(query))) {
                    /** If all the query params sent are permitted */
                    return next();
                }
            }
            res.status(400).send('Bad query parameter');
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error(`Unhandled exception: RouterBase.parseRequestQueries`),
                severity: 2,
                response: res
            })
        }
    }

}