import * as fs from "fs"
import * as path from "path"
import { Project,SyntaxKind } from "ts-morph"

interface DeclaredDeps{
    prodDeps : string[],
    devDeps:string[],
    allDeclared:Set<string>,
    duplicatedDeps:string[]
}

interface AnalysisReport{
    used:string[],
    unusued : string[],
    duplicatd:string[],
}

export const getAllDependencies  = (packageJsonPath:string = "./package.json"): DeclaredDeps =>{
    const resolvePath =  path.resolve(packageJsonPath);
    if(!resolvePath) {
        throw new  Error("Could not find package.json  in directory")
    }
    const packageData = JSON.parse(fs.readFileSync(resolvePath,'utf-8'))
    const prodDeps = packageData.dependencies ? Object.keys(packageData.dependencies) : []
    const devDeps = packageData.devdependencies ? Object.keys(packageData.devdependencies):[]
    const allDeclared  = new  Set([...prodDeps,...devDeps])
     const duplicatedDeps = prodDeps.filter(dep=>devDeps.includes(dep)) 

     return { prodDeps, devDeps, allDeclared, duplicatedDeps };
}


export  const getImportedPackages  = (fileGlobPattern:string = "src/**/*{.ts,.tsx,.js,.jsx}"):Set<string> =>{
    const project =  new Project({compilerOptions:{allowJs:true}});
    project.addSourceFileAtPath(fileGlobPattern)
    
    const importedPackages = new Set<string>()

    // Helper to extract base names (e.g., "lodash/fp" -> "lodash", "@types/node" -> "@types/node")
    const getBasePackege = (importstring:string):string=>{
     if(importstring.startsWith(".") || importstring.startsWith("/")) return "";
     const parts = importstring.split("/")
     return importstring.startsWith("@") ? `${parts[0]}/${parts[1]}` : `${parts[0]}`
    }

    // Standard ES Imports (import x from 'y')
    const sourceFiles = project.getSourceFiles();

     for(const sourceFile of sourceFiles){
       sourceFile.getImportDeclarations().forEach(imp => {
        const pkg = getBasePackege(imp.getModuleSpecifierValue())
        if(pkg) importedPackages.add(pkg)
       });

       // ES Export From statements (export * from 'y')
      sourceFile.getExportDeclarations().forEach(exp=>{
          const specifer  = exp.getModuleSpecifierValue()
          if(specifer){
            const pkg = getBasePackege(specifer)
            if(pkg) importedPackages.add(pkg)
          }
      })

       // CommonJS require() and Dynamic import()
       sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call=>{
           const called = call.getExpression().getText()
           if(called ==="require" || called ==="import"){
            const args  = call.getArguments()
            if(args.length >0 && args[0]?.getKindName() ==="StringLiteral"){
                const pkg = getBasePackege(args[0].getText().replace(/['"]/g, ""))
                if(pkg) importedPackages.add(pkg)
            }
           }
       })
     }

     
      

    return importedPackages;
}

