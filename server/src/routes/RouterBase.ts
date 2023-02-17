import { default as Express } from 'express';
import { JobPostServerApplication } from "../Base";
import { ModelService } from '../services';

export interface RouterProps {
    /** Define the query params allowed on a specific method
     * - ex. { get: [ 'id' ] }
     * - Append an element with `!` to make it required
     */
    permittedQueries?: {
        [key: string]: Array<string>;
    }
    /** Define the Content-Type headers here based on method */
    requiredHeaders?: {
        [key: string]: Record<string, string>;
    }
    /** For updates, posts, etc - pass in accepted keys for a request
     * - Append an element with `!` to make it required
     */
    permittedBodyKeys?: {
        [key: string]: Array<string>;
    }
}
type RouterPropsIntermediary = {
    [K in keyof RouterProps as string]: NonNullable<RouterProps[K]>
}

type PermittedConfig = {
    [key: string]: {
        required: Array<string>;
        permitted: Array<string>;
    }
}
type RequiredConfig = {
    [key: string]: Record<string, string>;
}
type RouterConfig = { 
    [key: string]: unknown 
} & {
    [K in NonNullable<keyof RouterProps>]: (
        K extends `permitted${string}` ? PermittedConfig : RequiredConfig
    )
}

/**
 * @class RouterBase extends {@link ModelService}
 * @param routeConfig {@link RouterProps} A configuration object passed in to define required and permitted request properties
 * @todo 
 * - `parseRequireElements` should happen on instanciation, not at request time
 */

export class RouterBase extends ModelService {
    private routeConfig: RouterConfig = {
        permittedQueries: null!,
        permittedBodyKeys: null!,
        requiredHeaders: null!
    };
    
    constructor(routerProps: RouterPropsIntermediary) {
        super();

        let configPermittedEntry;
        for (const config in routerProps) {
            if (config.toLowerCase().indexOf('permitted') > -1) {
                this.routeConfig[config] = (
                    Object.entries(routerProps[config])
                        .reduce((obj, entry) => {
                            configPermittedEntry = this.buildPermittedConfigOptions(entry[1])
                            return (
                                configPermittedEntry instanceof Error
                                    ? { ...obj }
                                    : { ...obj, [entry[0]]: configPermittedEntry }
                            )
                        }, {})
                ) 
            } else {
                this.routeConfig[config] = routerProps[config]// as RouterConfigIntermediary<'required'>;
            }
        }
        // this.routeConfig = { ...routerProps };
        
        /** Binds the calling context to its instance - fixes having to bind every call from its invoking class */
        Object
            .getOwnPropertyNames(RouterBase.prototype)
            .filter((propertyName)=> propertyName !== 'constructor')
            .forEach((method) => {
                // @ts-expect-error
                this[method] = this[method].bind(this)
            });
    }

    /**
     * @method buildPermittedConfigOptions Utility function to return an object containing both required, and optional elements from a given array in `routeConfig`
     * @param elements Array<string> from a given `routeConfig` method definition
     * - Elements appended with `!` are treated as required, others will be optional.
     * @returns
     * - Object { required: [...], optional: [...] } the `optional` value will contain both the required AND optional elements, but standardized.
     * - Error depending on context
     */
    private buildPermittedConfigOptions(elements: string[]): PermittedConfig[string] | Error {
        if (!elements || !Array.isArray(elements)) {
            return new Error(`Invalid parameter. Expected Array, received: ${typeof elements}`)
        }
        return {
            required: (
                elements
                    .filter((element)=> element.startsWith('!'))
                    .map((element)=>element.substring(1))
            ),
            permitted: elements.map((element)=> element.startsWith('!') ? element.substring(1) : element)
        }
    }
    
    public parseRequestHeaders(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        try {
            requestHeaderCheck:
            if (this.routeConfig.requiredHeaders === undefined) {
                return next();
            } else {
                const methodHeaders = this.routeConfig.requiredHeaders[req.method.toLowerCase()];
                if (methodHeaders === undefined || Object.keys(methodHeaders).length === 0) {
                    return next();
                }
                for (const header in methodHeaders) {
                    if (req.header(header) === undefined || req.header(header) !== methodHeaders[header]) {
                        break requestHeaderCheck;
                    }
                }
                return next()
            }
            res.status(412).send('Invalid content-type given');
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error(`Unhandled exception: RouterBase.parseRequestHeaders`),
                severity: 2,
                response: res
            })
        }
    }

    public parsePermittedRouteOptions(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        try {
            const permittedConfig: Record<string, PermittedConfig> = (
                Object.entries(this.routeConfig).reduce(
                    (config, entry)=> (
                        entry[0].startsWith('permitted')
                            ? { ...config, [entry[0]]: entry[1] }
                            : config
                    ),
                    {}
                )
            );
            let methodConfig;
            for (const config in permittedConfig) {
                methodConfig = permittedConfig[config][req.method.toLowerCase()];
                
                if (methodConfig !== undefined) {
                    /** Parse the request queries for fields marked as required */
                    if (methodConfig.required.some((key)=> req.query[key] === undefined)) {
                        return res.status(400).send(`Missing required ${config} fields`);
                    }
                    for (const reqQuery of Object.keys(req.query)) {
                        if (!methodConfig.permitted.includes(reqQuery)) {
                            return res.status(400).send(`Invalid ${config} fields provided`);
                        }
                    }  
                }
            }

            return next();
            
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error(`Unhandled exception: RouterBase.parseRequestQueries`),
                severity: 2,
                response: res
            })
        }
    }

    // public parseRequestQueries(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    //     try {
    //         // const methodQueries = (
    //         //     this.routeConfig.permittedQueries !== undefined
    //         //         ? this.routeConfig.permittedQueries[req.method.toLowerCase()] || []
    //         //         : []
    //         // );
    //         const methodQueries = this.routeConfig.permittedQueries[req.method.toLowerCase()] || []

    //         requestQueryCheck:
    //         if (Object.keys(req.query).length === 0) {
    //             if (methodQueries.required.length === 0) {
    //                 /** No queries move on */
    //                 return next()
    //             } else {
    //                 /** Required queries not given; send error response back */
    //                 break requestQueryCheck;
    //             }
    //         } else {
    //             /** Parse the request queries for fields marked as required */
    //             if (methodQueries.required.some((key)=> req.query[key] === undefined)) {
    //                 break requestQueryCheck;
    //             }

    //             // if (methodQueries.required.length > 0) {
    //             //     /** Parse the request queries for fields marked as required */
    //             //     if (methodQueries.required.some((key)=> req.query[key] === undefined)) {
    //             //         break requestQueryCheck;
    //             //     }
    //             // } else if (Object.keys(req.query).length === 0) {
    //             //     /** No queires present; continue on brother tom */
    //             //     return next();
    //             // } else if (methodQueries.length === 0 && Object.keys(req.query).length > 0) {
    //             //     /** Unexpected queries; a request should only contain those permitted */
    //             //     break requestQueryCheck;
    //             // }
    //             for (const reqQuery of Object.keys(req.query)) {
    //                 if (!methodQueries.permitted.includes(reqQuery)) {
    //                     break requestQueryCheck;
    //                 }
    //             }
    //             return next();
    //         }
    //         res.status(400).send('Bad query parameter');
    //     } catch (err) {
    //         this.emit('error', {
    //             error: err instanceof Error ? err : new Error(`Unhandled exception: RouterBase.parseRequestQueries`),
    //             severity: 2,
    //             response: res
    //         })
    //     }
    // }

    // public validateRequestBody(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    //     try {
    //         const routeBodyKeys = (
    //             this.routeConfig.permittedBodyKeys === undefined
    //                 ? []
    //                 : this.routeConfig.permittedBodyKeys[req.method.toLowerCase()] || []
    //         );
    //         const parsedKeys = this.routeConfig.permittedBodyKeys[req.method.toLowerCase()] || []

    
    //         requestBodyCheck:
    //         if (req.body === undefined || Object.keys(req.body).length === 0) {
    //             res.status(406).send('No body present in request')
    //         } else if (routeBodyKeys.length === 0) {
    //             res.status(422).send('Schema not defined on server')
    //         } else {
    //             const parsedKeys = this.buildPermittedConfigOptions(routeBodyKeys);
                
    //             if (parsedKeys instanceof Error) {
    //                 throw new Error('Invalid validation array. RouterBase.validateRequestBody');
    //             } else if (parsedKeys.required.length > 0) {
    //                 if (parsedKeys.required.some((key)=> req.body[key] === undefined)) {
    //                     res.status(406).send('Missing required fields');
    //                     return;
    //                     // break requestBodyCheck;
    //                 }
    //             }
    //             for (const key of Object.keys(req.body)) {
    //                 if (!parsedKeys.permitted.includes(key)) {
    //                     res.status(406).send(`Invalid fields (${key})`);
    //                     return;
    //                     // break requestBodyCheck;
    //                 }
    //             }
    //             return next();
    //         }
    //         res.status(406).send('Failed validation check')
    //     } catch (err) {
    //         this.emit('error', {
    //             error: err instanceof Error ? err : new Error(`Unhandled exception: RouterBase.validateRequestBody`),
    //             severity: 2,
    //             response: res
    //         })
    //     }
    // }

}