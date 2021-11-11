const settings = {
  lang: "gr1n",
  wf: "CH",
  angInf: "gr1",
  textColor: Color.white(),
  background: [new Color("#3558cc"), new Color("#a05aa3")],
};

const url = "https://raw.githubusercontent.com/akuvfx/timetable-scriptable/main/main.js";
let modulePath = await downloadModule("timetable", url);
if (modulePath != null) {
  let importedModule = importModule(modulePath);
  await importedModule.main(settings);
} else {
  console.log("Failed to download new module and could not find any local version.");
}

async function downloadModule(scriptName, scriptUrl) {
  let fm = FileManager.local();
  let moduleDir = module.filename.replace(fm.fileName(module.filename, true), scriptName);
  console.log(moduleDir);
  if (fm.fileExists(moduleDir) && !fm.isDirectory(moduleDir)) fm.remove(moduleDir);
  if (!fm.fileExists(moduleDir)) fm.createDirectory(moduleDir);
  let modulePath = fm.joinPath(moduleDir, "main.js");

  if (fm.fileExists(modulePath) && new Date() - fm.modificationDate(modulePath) >= 86400000) {
    return modulePath;
  }

  console.log("Downloading main.js from URL: " + scriptUrl);

  let req = new Request(scriptUrl);
  let moduleJs = await req.load().catch(() => null);

  if (moduleJs) {
    fm.write(modulePath, moduleJs);
    return modulePath;
  }

  return null;
}
