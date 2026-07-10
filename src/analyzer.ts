import * as fs from "fs"
import * as path from "path"
import { Project,SyntaxKind } from "ts-morph"

interface DeclaredDeps{
    prodDeps : string[],
    devDeps:string[],
    allDeclared:Set<string>,
    duplicates:string[]
}

interface AnalysisReport{
    used:string[],
    unused : string[],
    duplicates:string[],
    missing:string[]
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
     const duplicates = prodDeps.filter(dep=>devDeps.includes(dep)) 

     return { prodDeps, devDeps, allDeclared, duplicates };
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


export const analyzeDepencies  = ():AnalysisReport=>{
  try {
     const declared = getAllDependencies("./package.json");
        const imported = getImportedPackages("src/**/*{.ts,.tsx,.js,.jsx}");
         const used = [...declared.allDeclared].filter(dep => imported.has(dep));
        const unused = [...declared.allDeclared].filter(dep => !imported.has(dep));
        const missing = [...imported].filter(dep => !declared.allDeclared.has(dep));

          console.log("\n📊 --- ENGINE REPORT --- 📊");
        console.log(`📦 Active Packages Used:    ${used.length}`);
        if (declared.duplicates.length > 0) console.warn(`🚨 Duplicates Flagged:      `, declared.duplicates);
        if (unused.length > 0) console.warn(`⚠️ Unused Dependencies:    `, unused);
        if (missing.length > 0) console.error(`❌ Missing Dependencies:   `, missing);

        return {
            used,
            unused,
            missing,
            duplicates: declared.duplicates
        };

  } catch (error:any) {
     console.error("❌ Diagnostic analysis pipeline failed:", error.message);
        throw error;
  }
}
