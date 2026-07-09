import fs from "fs"

export const getAllDependencies  =  async() =>{
    try {
         const data = await fs.readFileSync("./package.json",'utf-8')
         const  packageObj = JSON.parse(data)
         const prodDeps = packageObj.dependencies ? Object.keys(packageObj.dependencies) : []
         const devDeps = packageObj.dependencies ? Object.keys(packageObj.devDependencies) : []
          
        const all_dependencies  = [...prodDeps,...devDeps];
        console.log("All dependencies",all_dependencies);
        

    } catch (error) {
        console.error("Couldnt get the depenendeis")
    }
}


getAllDependencies()