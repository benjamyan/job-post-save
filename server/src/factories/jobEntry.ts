import { v4 } from 'uuid';

export function build_JobEntry(givenProps: ApplicationGenerator.NewJobInfoData): ApplicationGenerator.JobInfoEntry | Error {
    try {
        const { abs_url, company_name, job_title, role_type, keywords, yoe, severity } = givenProps;
        if (!abs_url || !company_name || !job_title) {
            throw new Error(`Missing required fields (Factories.build_JobEntry)`)
        } else {
            const date = new Date();
            const newJob = {
                abs_url,
                company_name,
                job_title,
                role_type: (
                    role_type || 'UNKNOWN'
                ),
                keywords: (
                    keywords !== undefined 
                        ? keywords.split(',').map((keyword)=>keyword.replace(' ', ''))
                        : []
                ),
                yoe: yoe || 'UNKNOWN',
                severity: severity || 5,
                date_scraped: (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear(),
                date_applied: null,
                _applied: false,
                _guid: v4()
            }
    
            return newJob
        }
    } catch (err) {
        return err instanceof Error ? err : new Error(`Unhandled exception. Factories.build_JobEntry`);
    }
}
