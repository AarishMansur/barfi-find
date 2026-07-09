import * as fs from "fs"
import * as path from "path"
import { Project } from "ts-morph"

interface DeclaredDeps{
    proudDeps : string[],
    devDeps:string[],
    allDeclared:Set<string[]>,
    duplicatedDeps:string[]
}

interface AnalysisReport{
    used:string[],
    unusued : string[],
    duplicatd:string[],
}

export const getAllDependencies  = async(packageJsonPath:string)=>{
    const resolvePath =  path.resolve(packageJsonPath);
    if(!resolvePath) {
        throw new  Error("Could not find package.json  in directory")
    }
    const packageData = JSON.parse(fs.readFileSync(resolvePath,'utf-8'))
    const prodDeps = packageData.dependencies ? Object.keys(packageData.dependencies) : []
    const devDeps = packageData.devdependencies ? Object.keys(packageData.devdependencies):[]
    const allDeclared  = new  Set([...prodDeps,...devDeps])
     const duplicates = prodDeps.filter(dep=>devDeps.includes(dep))
     return { prodDeps, devDeps, allDeclared, duplicates };
}

