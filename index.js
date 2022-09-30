const themes = {
  blackWhite: {
    textColor: new Color("#fff700"),
    background: [new Color("#71f8ff"), new Color("#45bae3")],
  },
  
  blu: {
    textColor: Color.white(),
    background: [new Color("#00F260"), new Color("#0575E6")],
  }
};

const settings = {
  offset: 0,
  lang: "gr1n", 
  wf: "CH", 
  angInf: "gr1",
  ...themes.blu, //theme selection
  hidePastLessons: true, 
  preloadNextWeekOnSunday: true, 
  exlLogo: 1,
  dev: false, 
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

  console.log("Downloading main.js from URL: " + scriptUrl);

  let req = new Request(scriptUrl);
  let moduleJs = await req.load().catch(() => null);

  if (moduleJs) {
    fm.write(modulePath, moduleJs);
    return modulePath;
  }

  return null;
}
