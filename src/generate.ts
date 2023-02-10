import * as Fs from 'fs';
import * as Path from 'path';
import { EventEmitter } from 'events'
import { JobInfoPackage } from "./types";
import * as Config from './config';

export class JobPackageGenerator extends EventEmitter {
    private jobInfo: JobInfoPackage = null!;
    private package: Record<string, any> = {
        name: null!,
        path: null!,
        _abort: false,
        _error: false,
        _complete: false
    }
    
    constructor(jobInfo: JobInfoPackage) {
        super();
        this.jobInfo = jobInfo;
        this.package = new Proxy(this.package, {
            set: (target, key, value)=> {
                target[String(key)] = value;
                switch (key) {
                    case '_abort': {
                        if (value === true) {
                            setTimeout( ()=>this.emit('abort'), 100 );
                        }
                        break;
                    }
                    case '_complete': {
                        if (value === true) {
                            setTimeout( ()=>this.emit('complete'), 100 );
                        }
                        break;
                    }
                    default: {
                        // console.warn(`unhandled case ${key.toString()}`);
                    }
                }
                return true;
            },
            get: (target, key)=> {
                switch (key) {
                    case 'name': {
                        if (typeof(target[key]) !== 'string') {
                            const date = new Date();
                            const day = date.getDay().toString();
                            const month = date.getMonth().toString();
                            this.package.name = [
                                    this.formatOsCompatibleString(this.jobInfo.company),
                                    this.formatOsCompatibleString(this.jobInfo.title),
                                    this.formatOsCompatibleString((day.length == 1 ? `0${day}` : day) + (month.length == 1 ? `0${month}` : month) + date.getFullYear().toString())
                                ].join('_');
                        }
                        break;
                    }
                    case 'path': {
                        if (typeof(target[key]) !== 'string') {
                            this.package.path = Path.join(Config.applicationPackageDirectory, this.package.name)
                        }
                        break;
                    }
                }
                return target[key.toString()]
            }
        });
        this.buildPackageDirectory();
        this.transferApplicationFiles();
    }

    private formatOsCompatibleString = (name: string)=> {
        return name.toLowerCase().split(' ').join('-')
    }
    
    private buildPackageDirectory() {
        if (Fs.existsSync(this.package.path)) {
            this.package._error = new Error('This package already exists.');
            this.package._abort = true; 
        } else {
            Fs.mkdir(this.package.path, (err)=>{
                if (err) {
                    this.package._error = err;
                    this.package._abort = true; 
                }
            })
        }
        return;
    }

    private transferApplicationFiles() {
        [
            [Config.resumeFiles[this.jobInfo.type], Path.resolve(this.package.path, Config.resumeFilename)],
            [Config.resumeFileOriginals[this.jobInfo.type], Path.resolve(this.package.path, Config.resumeFileOriginalName)],
            [Config.coverLetterFiles[this.jobInfo.type], Path.resolve(this.package.path, `${this.formatOsCompatibleString(this.jobInfo.company)}_${Config.coverLetterFilename}`)]
        ].map((transfer, index, { length })=>{
            Fs.copyFile(transfer[0], transfer[1], (err)=> {
                if (err) {
                    this.package._error = err;
                    this.package._abort = true;
                    return;
                }
                if (index === length - 1) {
                    Fs.writeFile(
                        Path.resolve(this.package.path, `${this.formatOsCompatibleString(this.jobInfo.company)}_${Config.infoFilename}`), 
                        [ ...Object.entries(this.jobInfo).map(entry=> {
                                if (entry[0] === 'description') {
                                    console.log(entry[0]);
                                    return `${entry[0].toUpperCase()}: \n${entry[1]}`
                                }
                                return `${entry[0].toUpperCase()}: ${entry[1]}`
                            })
                        ].join('\n\n'),
                        (err)=>{
                            if (err) {
                                this.package._error = err;
                                this.package._abort = true; 
                                return;
                            }
                            this.package._complete = true;
                        }
                    );
                }
            })
        });
    }

}

