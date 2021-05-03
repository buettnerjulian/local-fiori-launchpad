const path = require('path')
const fs = require('fs');

/**
 * Search for matching file in directory path
 * @param {string} sStartPath Folder path
 * @param {string} sFilter File path
 * @returns {string} Filepath or empty if not found
 */
function searchInDir(sStartPath,sFilter){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(sStartPath)){
        console.log("no dir ",sStartPath);
        return;
    }

    const aFiles=fs.readdirSync(sStartPath);
    let sFoundFilePath = ""
    
    aFiles.some( sFileName => {
        let sFilePath=path.join(sStartPath,sFileName);
        let oFileInfo = fs.lstatSync(sFilePath);
        let aSubFolders = [];
        if (oFileInfo.isDirectory()) {
            aSubFolders.push(sFilePath);
        } else if (sFilePath.includes(sFilter)) {
            sFoundFilePath = sFilePath;
            return true;
        };
        // Search through sub directories
        aSubFolders.some(aSubFolder =>{
            let sFound = searchInDir(sFilePath,sFilter); //recurse
            if (sFound !== "") {
                sFoundFilePath = sFound;
                return true;
            }
        })
    });
    return sFoundFilePath;
};

module.exports = {searchInDir: searchInDir};