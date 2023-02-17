import { JobPostServerApplication } from '../Base';

const JobDataProxy = (jsonContent: Array<ApplicationGenerator.JobInfoEntry>)=> {
    const jobData = new Proxy(
        {} as Record<string, ApplicationGenerator.JobInfoEntry>,
        {
            set(target, key: string, value: ApplicationGenerator.JobInfoEntry) {
                target[key] = value;
                return true   
            },
            get(target, key: string) {
                return target[key];
            }
        }
    );
    // const jobInfoFromFile = require(jsonFilePath);

    if (jsonContent === undefined) {
        JobPostServerApplication.emitter('error', {
            error: new Error('Failed to get job info file data.'),
            severity: 2
        });
    } else {
        for (const job of jsonContent) {
            jobData[job._guid] = job;
        }
    }

    return jobData;
}

export { JobDataProxy }



// const JobDataProxy = (jsonFilePath: string)=> {
//     const jobData: Record<string, ApplicationGenerator.JobInfoEntry> = new Proxy(
//         {},
//         {
//             set(target: typeof jobData, key: string, value: ApplicationGenerator.JobInfoEntry) {
//                 target[key] = value;
//                 return true   
//             }
//         }
//     );
//     const jobInfoFromFile = require(jsonFilePath);

//     if (jobInfoFromFile.jobs === undefined) {
//         JobPostServerApplication.emitter('error', {
//             error: new Error('Failed to get job info file data.'),
//             severity: 2
//         });
//     } else {
//         for (const job of jobInfoFromFile.jobs) {
//             jobData[job._guid] = job;
//         }
//     }

//     return jobData;
// }



// export class JobDataProxy {
//     private filePath: string = null!;
//     static jobData: Record<string, ApplicationGenerator.JobInfoEntry> = new Proxy(
//         {},
//         {
//             set(target: typeof JobDataProxy.jobData, key: string, value: ApplicationGenerator.JobInfoEntry) {
//                 console.log(key)
//                 target[key] = value;
//                 return true   
//             }
//         }
//     )

//     constructor(jsonFilePath: string) {
//         this.filePath = jsonFilePath;
//         this.prototype.filePath = this.filePath;
//     }

//     static {
//         console.log(this.prototype.filePath)
//         const jobInfoFromFile = require(this.prototype.filePath);

//         if (jobInfoFromFile.jobs === undefined) {
//             JobPostServerApplication.emitter('error', {
//                 error: new Error('Failed to get job info file data.'),
//                 severity: 2
//             });
//         } else {
//             for (const job of jobInfoFromFile.jobs) {
//                 // this.jobData[job._guid] = job;
//             }
//         }
//     }
// }
