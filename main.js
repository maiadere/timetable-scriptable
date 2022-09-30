class Cache {
  constructor(name, isLocal) {
    
    this.fm = (isLocal)?FileManager.local():FileManager.iCloud();
    this.cachePath = this.fm.joinPath(this.fm.documentsDirectory(), name);

    if (!this.fm.fileExists(this.cachePath)) {
      this.fm.createDirectory(this.cachePath);
    }
  }

  async read(key) {
    try {
      const path = this.fm.joinPath(this.cachePath, key);
      await this.fm.downloadFileFromiCloud(path);
      const value = this.fm.readString(path);
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  write(key, value) {
    const path = this.fm.joinPath(this.cachePath, key.replace("/", "-"));
    console.log(`Caching to ${path}...`);
    this.fm.writeString(path, JSON.stringify(value));
  }
}

const toTitleCase = (phrase) =>
  phrase
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

async function main(settings) {
  const background = new LinearGradient();
  background.startPoint = settings.backgroundStart || new Point(0, 0);
  background.endPoint = settings.backgroundEnd || new Point(1, 1);
  background.locations = settings.backgroundLocations || [-1, 2];
  background.colors = settings.background;

  const app = new ListWidget();
  app.backgroundGradient = background;

  const appStack = app.addStack();

  let currentLessonStack;

  if (config.widgetFamily === "medium" || config.widgetFamily === "large") {
    currentLessonStack = appStack.addStack();
    currentLessonStack.size = new Size(175, 0);
    currentLessonStack.setPadding(8, 8, 8, 8);
    currentLessonStack.layoutVertically();
  }

  const list = appStack.addStack();
  list.layoutVertically();
  list.setPadding(5, 5, 0, 5);

  const cache = new Cache("timetableCache", settings.localCache || true);

  let today = await cache.read("today");
  let thisWeek = await cache.read("week");
  console.log(thisWeek)
  const date = new Date();

  try {
 	
    const req = new Request(`https://hopeful-snyder-d01795.netlify.app/?offset=${((settings.preloadNextWeekOnSunday&&date.getDay() == 0)?settings.offset+7:settings.offset) || 0}`);
    const res = await req.loadJSON();
    const t = res[date.getDay() - 1];
	
    if(t.toString() != today.toString()){
      await cache.write("today", t)
      today = t
      console.log("today cache replaced")
    }
    
    if(res.toString() != thisWeek.toString()){
      await cache.write("week", res)
      thisWeek = res; 
      console.log("week cache replaced")
    }
  
  } catch (e) {
    console.log(e);
  }
  
  let week = []
  
  for (let i = 0; i<5; i++){
    let day = {}
    thisWeek?thisWeek[i].forEach((lesson)=>{
      if (lesson.name === "Religia") return;
  
      if (
        lesson.distribution &&
        !(
          lesson.distribution.shortcut === settings.wf ||
          lesson.distribution.shortcut === settings.lang ||
          lesson.distribution.shortcut === settings.angInf
        )
      )
        return;
    	day[lesson.time] = {name: lesson.short, room: lesson.room?lesson.room.code.toString().padStart(2):"WF"}
    }):null
    week.push(day)
   }
  
  let count = 0;
  
  if(config.widgetFamily !== "extraLarge"){

    today.forEach((lesson) => {
      if (config.widgetFamily === "medium" && count > 3) return;
      else if (config.widgetFamily === "large" && count > 6) return;
      else if ((!config.widgetFamily || config.widgetFamily === "small") && count > 2) return;
  
      if (lesson.name === "Religia") return;
  
      if (
        lesson.distribution &&
        !(
          lesson.distribution.shortcut === settings.wf ||
          lesson.distribution.shortcut === settings.lang ||
          lesson.distribution.shortcut === settings.angInf
        )
      )
        return;
  
      const parseTime = (i) =>
        lesson.time
          .split(" - ")
          [i].split(":")
          .map((n) => +n);
  
      const rawTime = [parseTime(0), parseTime(1)];
  
      const startTime = new Date(date);
      startTime.setHours(rawTime[0][0]);
      startTime.setMinutes(rawTime[0][1]);
  
      const endTime = new Date(date);
      endTime.setHours(rawTime[1][0]);
      endTime.setMinutes(rawTime[1][1]);
  
      if (date.getHours() > endTime.getHours()) return;
      if (date.getHours() === endTime.getHours() && date.getMinutes() > endTime.getMinutes()) return;
  
      if ((config.widgetFamily === "medium" || config.widgetFamily === "large") && count === 0) {
        let wsubtitle = currentLessonStack.addText(lesson.time);
        wsubtitle.font = Font.mediumSystemFont(12);
        wsubtitle.textOpacity = 0.8;
        wsubtitle.textColor = settings.textColor;
        currentLessonStack.addSpacer(2);
  
        let wtitle = currentLessonStack.addText(lesson.name);
        wtitle.font = Font.blackSystemFont(16);
        wtitle.textColor = settings.textColor;
        wtitle.lineLimit = 1;
        currentLessonStack.addSpacer(4);
  
        let teacher = currentLessonStack.addText(toTitleCase(lesson.teacher.displayName));
        teacher.font = Font.boldSystemFont(12);
        teacher.textColor = settings.textColor;
        teacher.lineLimit = 1;
        currentLessonStack.addSpacer(6);
  
        let room = currentLessonStack.addStack();
        room.size = new Size(0, 25);
        room.setPadding(2.5, 5, 2.5, 5);
        room.centerAlignContent();
        room.cornerRadius = 10;
        
        if (lesson.room) {
          room.backgroundColor = settings.boxColor || new Color("#fff", 0.125);
        
          let roomText = room.addText(lesson.room.code);
          roomText.font = Font.boldSystemFont(12);
          roomText.textOpacity = 0.8;
          roomText.textColor = settings.textColor;
        }
  
        let btnStack = currentLessonStack.addStack();
        btnStack.setPadding(25, 0, 0, 0);
  
        const fakeBtn = btnStack.addText("View all →");
        fakeBtn.font = Font.blackSystemFont(14);
        fakeBtn.textColor = settings.textColor;
        fakeBtn.textOpacity = 0.7;
        fakeBtn.lineLimit = 1;
        fakeBtn.url = "https://timetable-app.vercel.app";
  
 
  
        count++;
        return;
      }  
  
    const lessonStack = list.addStack();
    lessonStack.size = new Size(settings.lessonWidth || 135, 0);
    lessonStack.backgroundColor = settings.boxColor || new Color("#fff", startTime <= date && date <= endTime ? 0.25 : 0.125);
    lessonStack.cornerRadius = 10;
    lessonStack.setPadding(-1, 10, 0, 5);
    lessonStack.layoutHorizontally();
    lessonStack.centerAlignContent();

        
    let stackSize = settings.lessonWidth ? settings.lessonWidth - 30 : 105;
    
    if (settings.roomPipe) {
      stackSize += 20;
    }
    
    const stack = lessonStack.addStack();
    stack.size = new Size(stackSize, 0);
    stack.layoutVertically();
    stack.centerAlignContent();
    
    let wstack;
    
    if (settings.reversedOrder) {
       wstack = stack.addStack();
      wstack.setPadding(5, 0, 0, 0);
    }
    

    let rstack;
    
    if (!settings.roomPipe) {
      rstack = lessonStack.addStack();
    rstack.setPadding(1, 0, 0, 0);
    rstack.size = new Size(20, 0);
    stack.addSpacer(5);
    }         
                    
    if (settings.roomPipe && lesson.room) {
      let wsubtitle = stack.addStack();
      
      let t = wsubtitle.addText(lesson.time);
    t.font = Font.mediumSystemFont(12);
    t.textOpacity = 0.8;
    t.textColor = settings.textColor;
    
    let pipe = wsubtitle.addText(settings.pipeText || " | ");
    pipe.font = Font.mediumSystemFont(12);
    pipe.textOpacity = 0.4;
    pipe.textColor = settings.textColor;
    
    let t2 = wsubtitle.addText(lesson.room.code);
    t2.font = Font.mediumSystemFont(12);
    t2.textOpacity = 0.8;
    t2.textColor = settings.textColor;
    
    } else {
      
    let wsubtitle = stack.addText(lesson.time);
    wsubtitle.font = Font.mediumSystemFont(12);
    wsubtitle.textOpacity = 0.8;
    wsubtitle.textColor = settings.textColor;
  }

    
    if (!settings.reversedOrder) {
       wstack = stack.addStack();
      wstack.setPadding(0, 0, 5, 0);
    }
    

    if (lesson.change && lesson.change.change.type === 2) {
      try {
        lesson.name = lesson.change.subject.name;
      } catch (e) {}

      let icon = wstack.addText("⇄ ");
      icon.font = Font.boldSystemFont(13);
      icon.textOpacity = 0.8;
      icon.textColor = settings.textColor;
    }

    if (lesson.change && lesson.change.change.type === 1) {
      let icon = wstack.addText("× ");
      icon.font = Font.boldSystemFont(13);
      icon.textOpacity = 0.8;
      icon.textColor = settings.textColor;
    }

    let wtitle = wstack.addText(lesson.name);
    wtitle.font = Font.boldSystemFont(13);
    wtitle.textOpacity = 1;
    wtitle.textColor = settings.textColor;
    wtitle.lineLimit = 1;

    if (!settings.roomPipe && lesson.room) {
      let room = rstack.addText(lesson.room.code);
      room.font = Font.boldSystemFont(12);
      room.textOpacity = 0.4;
      room.textColor = settings.textColor;
    }

    count++;
    list.addSpacer(6);
  });
  
} else {
  count = 2;
  list.layoutHorizontally();
  const allHours = ["7:30 - 8:15", "8:20 - 9:05", "9:15 - 10:00", "10:10 - 10:55", "11:05 - 11:50", "12:10 - 12:55", "13:05 - 13:50", "14:00 - 14:45", "14:50 - 15:35"];  
  const allBreaks = ["8:16 - 8:19", "9:06 - 9:14", "10:01 - 10:09", "10:56 - 11:04", "11:51 - 12:09", "12:56 - 13:04", "13:51 - 13:59", "14:46 - 14:49", "15:36 - 15:44"];

  const hours = list.addStack();
  const weekdaydesc = hours.addStack()
  weekdaydesc.centerAlignContent()
  weekdaydesc.size = new Size(100, 28)
  weekdaydesc.backgroundColor = settings.boxColor || new Color("#fff", 0.125)
  
if(settings.exlLogo?settings.exlLogo == 2:false){    
  const T = weekdaydesc.addText("Timetable")
  T.font = Font.blackSystemFont(14);
  T.textColor = settings.textColor;
  T.textOpacity = 1;
  T.lineLimit = 1;

  let sym = SFSymbol.named("hourglass")
  const symbol = weekdaydesc.addImage(sym.image)
  symbol.tintColor = settings.textColor
  symbol.imageSize = new Size(20, 20)
  }else{

  let sym = SFSymbol.named("clock")
  const symbol = weekdaydesc.addImage(sym.image)
  symbol.tintColor = settings.textColor
  symbol.imageSize = new Size(25, 25)
  
  let tS = SFSymbol.named("tablecells")
  const symbol2 = weekdaydesc.addImage(tS.image)
  symbol2.tintColor = settings.textColor
  symbol2.imageSize = new Size(32, 32)
}
  
  hours.addSpacer(5)
  weekdaydesc.cornerRadius = 10
  
  let markX = date.getDay()-1
  let markY = -1
  let breakY = -1
  
  for (let i = 0; i<allHours.length; i++) {	
    	const parseTime = (z) =>
        allHours[i]
          .split(" - ")
          [z].split(":")
          .map((n) => +n);
          
       const parseBreakTime = (z) =>
        allBreaks[i]
          .split(" - ")
          [z].split(":")
          .map((n) => +n);
  
      const rawTime = [parseTime(0), parseTime(1)];
      const breakTime = [parseBreakTime(0), parseBreakTime(1)]
      
  
      const startTime = new Date(date);
      startTime.setHours(rawTime[0][0]);
      startTime.setMinutes(rawTime[0][1]);
  
      const endTime = new Date(date);
      endTime.setHours(rawTime[1][0]);
      endTime.setMinutes(rawTime[1][1]);
      
      const startBTime = new Date(date);
      startBTime.setHours(breakTime[0][0])
      startBTime.setMinutes(breakTime[0][1])
      
      const endBTime = new Date(date);
      endBTime.setHours(breakTime[1][0])
      endBTime.setMinutes(breakTime[1][1])
      
   	hour = hours.addStack();
  	const text = hour.addText(allHours[i]);
  		text.font = Font.blackSystemFont(12);
        text.textColor = settings.textColor;
        text.textOpacity = 1;
        text.lineLimit = 1;
  	hour.centerAlignContent();
  	hour.backgroundColor = settings.boxColor || new Color("#fff", (startTime <= date && date <= endTime && markX>=0 && markX <=4)?0.35:0.125);
  	
	if(startTime <= date && date <= endTime){
		markY = i
	}
	else if(startTime > date
   && markY == -1){
		markY = -2
	}

	if(startBTime <= date && date <= endBTime){
		breakY = i
	}
	
  	hour.size = new Size(100, 28)
  hour.cornerRadius = 10
  hours.addSpacer(5)
  	
  }
  list.addSpacer(5)
  hours.layoutVertically();
  weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  
  for (let i = 0; i<5;i++) {
  
  	const day = list.addStack();
    day.layoutVertically();
    weekDay = day.addStack();
    const text = weekDay.addText(weekDays[i]);
    text.font = Font.blackSystemFont(16);
        text.textColor = settings.textColor;
        text.textOpacity = 1;
        text.lineLimit = 1;
    weekDay.centerAlignContent()
    weekDay.backgroundColor = settings.boxColor || new Color("fff", i==markX?0.35:0.125)
    weekDay.cornerRadius = 10
    weekDay.size = new Size(112, 28)
    day.addSpacer(5)
    list.addSpacer(5)
    
    for (let j = 0; j<allHours.length; j++){
      const lesson = day.addStack()
      day.addSpacer(5)
      lesson.size = new Size(112, 28)
      lesson.centerAlignContent()
      lesson.cornerRadius = 10
      
	  let loadedSunday = settings.preloadNextWeekOnSunday&&date.getDay()==0
	  let inMarks = ((markX == i && markY > j) ||(markX > i) || (breakY >= j && markX == i))
	  let shouldItHide = loadedSunday?false:inMarks
      const shouldHighlight = markX == i && (markY == j || markY == j)
      
      lesson.backgroundColor = settings.boxColor || new Color("#fff", (markX == i && markY ==j)?0.35:0.125)
      if(week[i][allHours[j]] && !shouldItHide){
        const lessonName = lesson.addStack()
        lessonName.size = new Size(85,0)
        
      	const lessonObject = week[i][allHours[j]];
		const text = lessonName.addText(lessonObject.name)
		text.font = Font.blackSystemFont(12);
        text.textColor = settings.textColor;
        text.textOpacity = 0.8;
        text.lineLimit = 1;
        
        
        
        const textH = lesson.addText(lessonObject.room)
        textH.font = Font.blackSystemFont(12);
        textH.textColor = settings.textColor;
        textH.textOpacity = 0.6;
        textH.lineLimit = 1;
    }else if(week[i][allHours[j]] && shouldItHide){
    const lessonName = lesson.addStack()
        lessonName.size = new Size(85,0)
        
      	const lessonObject = week[i][allHours[j]];
		const text = lessonName.addText(lessonObject.name)
		text.font = Font.blackSystemFont(12);
        text.textColor = settings.textColor;
        text.textOpacity = 0.5;
        text.lineLimit = 1;
        
        
        
        const textH = lesson.addText(lessonObject.room)
        textH.font = Font.blackSystemFont(12);
        textH.textColor = settings.textColor;
        textH.textOpacity = 0.35;
        textH.lineLimit = 1;
  	lesson.backgroundColor = settings.boxColor || new Color("#fff", 0.03125)
  }else{
  	lesson.backgroundColor = settings.boxColor || new Color("#fff", 0.03125)
  }
  }
  }
}
  
  if (count != 0 && (config.widgetFamily === "medium" || config.widgetFamily === "large")) {
    for (let i = 0; i <= ((config.widgetFamily === "medium")?3:7) - count; i++) {
      const lesson = {"change":{"unitId":0,"reason":null,"note":null,"id":0,"lessonDate":{"date":"2022-01-12","time":"00:00:00","timestamp":0},"event":null,"change":{"id":0,"separation":false,"type":1},"scheduleId":0,"class":{"id":0,"key":"","displayName":"","symbol":"Bp"}},"time":"","distribution":{"id":0,"key":"","shortcut":"","name":"","partType":""},"order":1,"short":"wf","teacher":{"id":0,"displayName":"","name":"","surname":""},"timestamp":0,"name":""};

        const lessonStack = list.addStack();
        lessonStack.opacity = 0;
    lessonStack.size = new Size(135, 0);
    lessonStack.cornerRadius = 10;
    lessonStack.setPadding(-1, 10, 0, 5);
    lessonStack.layoutHorizontally();
    lessonStack.centerAlignContent();
    
    const stack = lessonStack.addStack();
    stack.size = new Size(105, 0);
    stack.layoutVertically();
    stack.centerAlignContent();
    
    let wstack;
    
    if (settings.reversedOrder) {
       wstack = stack.addStack();
      wstack.setPadding(5, 0, 0, 0);
    }
    

    let rstack;
    
    if (!settings.roomPipe) {
      rstack = lessonStack.addStack();
    rstack.setPadding(1, 0, 0, 0);
    rstack.size = new Size(20, 0);
    stack.addSpacer(5);
    }         
                    
    if (settings.roomPipe && lesson.room) {
      let wsubtitle = stack.addStack();
      
      let t = wsubtitle.addText(lesson.time);
    t.font = Font.mediumSystemFont(12);
    t.textOpacity = 0.8;
    t.textColor = settings.textColor;
    
    let pipe = wsubtitle.addText(settings.pipeText || " | ");
    pipe.font = Font.mediumSystemFont(12);
    pipe.textOpacity = 0.4;
    pipe.textColor = settings.textColor;
    
    let t2 = wsubtitle.addText(lesson.room.code);
    t2.font = Font.mediumSystemFont(12);
    t2.textOpacity = 0.8;
    t2.textColor = settings.textColor;
    
    } else {
      
    let wsubtitle = stack.addText(lesson.time);
    wsubtitle.font = Font.mediumSystemFont(12);
    wsubtitle.textOpacity = 0.8;
    wsubtitle.textColor = settings.textColor;
  }

    
    if (!settings.reversedOrder) {
       wstack = stack.addStack();
      wstack.setPadding(0, 0, 5, 0);
    }

    let wtitle = wstack.addText(lesson.name);
    wtitle.font = Font.boldSystemFont(13);
    wtitle.textOpacity = 1;
    wtitle.textColor = settings.textColor;
    wtitle.lineLimit = 1;

    if (!settings.roomPipe && lesson.room) {
      let room = rstack.addText(lesson.room.code);
      room.font = Font.boldSystemFont(12);
      room.textOpacity = 0.4;
      room.textColor = settings.textColor;
    }

    list.addSpacer(6);
    }
  }

  if (count === 0) {
    if (config.widgetFamily === "medium" || config.widgetFamily === "large") {
      currentLessonStack.size = new Size(1, 1);
      currentLessonStack.setPadding(0, 0, 0, 0);
    }
    // let i = list.addText("×");
    // i.textColor = settings.textColor;
    // i.font = Font.lightSystemFont(48);
    // i.textOpacity = 0.5;
    // i.centerAlignText();
    let t = list.addText("There are no lessons");
    t.textColor = settings.textColor;
    t.font = Font.boldSystemFont(12);
    t.centerAlignText();
//     list.setPadding(0, 0, 12, 0);
  }

  !settings.dev || config.runsInWidget ? Script.setWidget(app) : await app.presentExtraLarge();
  Script.complete();
}

module.exports = { main };
