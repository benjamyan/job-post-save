/// <reference path='node:events' />
/// <reference path='uuid' />

declare namespace ApplicationGenerator {
    export interface BaselineError {
        error: Error;
        /** severity rating 
         * - 1 = very, will exit the program
         * - 2 or higher: youre fineeeeee
         */
        severity: number;
        /** optionally provided response; if not undefined, will send a response as statusCode(500) */
        response?: Express.Application.Response;
    }
    export type JobInfoEntry = {
        abs_url: string,
        job_title: string,
        role_type: string,
        company_name: string,
        yoe: string | null,
        keywords: Array<string>,
        severity: number,
        date_scraped: string,
        date_applied: string | null,
        _applied: boolean,
        _guid: string
    }
    export type NewJobInfoData = (
        Pick<JobInfoEntry, 'abs_url' | 'company_name' | 'job_title'> & Partial<Omit<JobInfoEntry, 'keywords'>> & {
            keywords?: string;
        }
    )
}