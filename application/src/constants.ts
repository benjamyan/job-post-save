import * as Path from 'path'

export const roleTypeOptions: Array<roleTypeOptions> = ['frontend', 'fullstack'];
export type roleTypeOptions = 'frontend' | 'fullstack';

// export const resumeFilename = 'BenjaminYannella-Resume-2023.pdf'
// export const resumeFiles: Record<Lowercase<roleTypeOptions>, string> = {
//     frontend: Path.resolve(__dirname, '../../frontend/BenjaminYannella-Resume-2023.pdf'),
//     fullstack: Path.resolve(__dirname, '../../fullstack/BenjaminYannella-Resume-2023.pdf')
// }
export const resumeFileOriginalName = 'BenjaminYannella-Resume-2023.odg'
export const resumeFileOriginals: Record<Lowercase<roleTypeOptions>, string> = {
    frontend: Path.resolve(__dirname, '../../frontend/BenjaminYannella-Resume-2023.odg'),
    fullstack: Path.resolve(__dirname, '../../fullstack/BenjaminYannella-Resume-2023.odg')
}
export const coverLetterFiles: Record<Lowercase<roleTypeOptions>, string> = {
    frontend: Path.resolve(__dirname, '../../BenjaminYannella-Cover-2023.docx'),
    fullstack: Path.resolve(__dirname, '../../BenjaminYannella-Cover-2023.docx')
}
export const coverLetterFilename = 'BenjaminYannella-Cover-2023.docx';

export const infoFilename = 'job-info.odt';

export const applicationPackageDirectory = Path.resolve(__dirname, '../../apply')

