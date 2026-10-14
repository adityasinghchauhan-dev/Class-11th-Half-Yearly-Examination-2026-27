(function () {
  // Edit this list to change the timetable. Dates are YYYY-MM-DD.
  var START = "08:15", END = "11:30", TZ = "+05:30";
  var EXAMS = [
    { date: "2026-11-02", subjects: ["Chemistry", "Accountancy", "History"] },
    { date: "2026-11-04", subjects: ["English"] },
    { date: "2026-11-06", subjects: ["Physics", "Business Studies", "Geography"] },
    { date: "2026-11-07", subjects: ["Physical Activity Trainer"] },
    { date: "2026-11-10", subjects: ["Mathematics", "Biology", "Economics", "Political Science"] },
    { date: "2026-11-12", subjects: ["Hindi", "Computer Science", "Informatics Practices"] }
  ];
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  function pad(n) { return String(n).padStart(2, "0"); }
  EXAMS.forEach(function (e) {
    var p = e.date.split("-").map(Number);
    e.y = p[0]; e.m = p[1] - 1; e.d = p[2];
    e.start = new Date(e.date + "T" + START + ":00" + TZ).getTime();
    e.end = new Date(e.date + "T" + END + ":00" + TZ).getTime();
    e.dow = DAYS[new Date(Date.UTC(e.y, e.m, e.d)).getUTCDay()];
  });

  var list = document.getElementById("timeline");
  EXAMS.forEach(function (e) {
    var li = document.createElement("li");
    li.className = "exam" + (e.subjects.length === 1 ? " single" : "");
    li.innerHTML =
      '<div class="date"><div class="daynum num">' + pad(e.d) + '</div><div><div class="mon">' + MONTHS[e.m] + " " + e.y +
      '</div><div class="dow">' + e.dow + '</div></div></div>' +
      '<div class="body"><ul class="subjects">' + e.subjects.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul>" +
      '<div class="status"><span class="badge"><span class="dot"></span><span class="badgeText"></span></span><span class="count num"></span></div>' +
      '<div class="bar" hidden><i></i></div></div>';
    e.el = li;
    list.appendChild(li);
  });

  function parts(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  }
  function short(ms) {
    var t = parts(ms);
    return (t.d ? t.d + "d " : "") + pad(t.h) + "h " + pad(t.m) + "m " + pad(t.s) + "s";
  }
  function setText(el, v) { if (el.textContent !== v) el.textContent = v; }
  function $(id) { return document.getElementById(id); }
  function todayIST(now) {
    try { return new Date(now).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); } catch (err) { return ""; }
  }

  function tick() {
    var now = Date.now(), today = todayIST(now), current = null;

    EXAMS.forEach(function (e) {
      var state = now >= e.end ? "done" : now >= e.start ? "live" : "up";
      e.state = state;
      if (!current && state !== "done") current = e;
      var el = e.el;
      el.dataset.state = state;
      var badge = el.querySelector(".badgeText"), count = el.querySelector(".count");
      var bar = el.querySelector(".bar"), fill = bar.firstElementChild;
      var tag = el.querySelector(".today");
      if (e.date === today && state !== "done") {
        if (!tag) { tag = document.createElement("span"); tag.className = "today"; tag.textContent = "Today"; el.appendChild(tag); }
      } else if (tag) { tag.remove(); }
      if (state === "up") {
        setText(badge, "Upcoming"); setText(count, "Starts in " + short(e.start - now)); bar.hidden = true;
      } else if (state === "live") {
        setText(badge, "Exam is going on"); setText(count, "Ends in " + short(e.end - now)); bar.hidden = false;
        fill.style.width = ((now - e.start) / (e.end - e.start) * 100).toFixed(2) + "%";
      } else {
        setText(badge, "Exam ended"); setText(count, ""); bar.hidden = true;
      }
    });

    var hero = $("hero");
    if (!current) {
      hero.dataset.state = "done";
      setText($("heroState"), "Exams ended");
      setText($("heroDate"), "");
      setText($("heroSubjects"), "");
      $("units").hidden = true; $("heroBar").hidden = true; $("heroFoot").hidden = true;
      $("heroFinal").hidden = false;
      setText($("heroFinal"), "All Class XI half yearly examinations are over. Well done, everyone.");
      return;
    }
    $("heroFinal").hidden = true; $("units").hidden = false; $("heroFoot").hidden = false;
    setText($("heroDate"), current.dow + ", " + current.d + " " + MONTHS_FULL[current.m] + " " + current.y);
    setText($("heroSubjects"), current.subjects.join("  /  "));
    var live = current.state === "live";
    hero.dataset.state = live ? "live" : "up";
    var first = current === EXAMS[0];
    setText($("heroState"), live ? "Exam is going on" : first ? "First exam starts in" : "Next exam starts in");
    var t = parts(live ? current.end - now : current.start - now);
    $("uDays").hidden = live;
    $("units").style.gridTemplateColumns = live ? "repeat(3, minmax(0, 1fr))" : "";
    setText($("vDays"), pad(t.d)); setText($("vHours"), pad(t.h)); setText($("vMins"), pad(t.m)); setText($("vSecs"), pad(t.s));
    $("heroBar").hidden = !live;
    if (live) $("heroBarFill").style.width = ((now - current.start) / (current.end - current.start) * 100).toFixed(2) + "%";
    setText($("heroFoot"), live ? "Time left in this exam. It ends at 11:30 AM." : "The exam begins at 8:15 AM.");
  }

  tick();
  setInterval(tick, 1000);
})();