import fs from 'fs'

function createFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath, { recursive: true });
    }
}

export default createFolder;