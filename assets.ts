import * as dotenv from 'dotenv';
export function getAssetPATH(){
    let env = dotenv.config({path: __dirname+'/.env'});
    let assets = env.parsed;
    let project = process.env["PROJECT"] || process.env["DEFAULT_PROJECT"];
    console.log(project);
    console.log(assets);
    let projectAsset = `${project}_ASSETS`;
    console.log(projectAsset);
    return assets[projectAsset];
}
