/// <reference path='../node_modules/@types/chrome/index.d.ts' />

class JobPostExtension {
    public jobPosts: any[] = [];

    constructor() {
        console.log('init')
        this.mountPreviousJobPosts()
    }

    private mountPreviousJobPosts() {
        console.log(' mountPreviousJobPosts')
        try {
            fetch(
                'http://localhost:8010/jobs',
                // {
                //     method: 'GET',
                //     headers: {
                //         'ContentType': 'application/json'
                //     }
                // }
            )
            .then((response)=>{
                if (!response.ok) {
                    throw new Error('Bad request')
                }
                return response.json()
            })
            .then((content)=>{
                console.log(content)
            })
            .catch((error)=>{
                console.log(error);
            })
        } catch (err) {
            console.log(err)
        }
    }

}
new JobPostExtension();