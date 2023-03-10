import * as Config from './constants';

export type JobInfoPackage = {
    [key: string]: any;
    type: Lowercase<Config.roleTypeOptions>;
    href: string;
    company: string;
    title: string;
    description: string;
}