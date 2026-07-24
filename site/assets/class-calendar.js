(function(){
  "use strict";

  var DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  var LOCATIONS={ds:"Dripping Springs",austin:"Austin"};
  var PROGRAMS=[
    {id:"little",label:"Little Champions 3–7"},
    {id:"youth",label:"Youth 7–12"},
    {id:"adults",label:"Adults"},
    {id:"all",label:"All classes"}
  ];
  var CLASSES=[
    {day:0,time:"5:00–5:45 PM",name:"Little Champions (Ages 3–7)",program:"little",groups:["little"],location:"ds"},
    {day:0,time:"5:50–6:35 PM",name:"Junior Warriors (Ages 8–12)",program:"junior",groups:["youth"],location:"ds"},
    {day:0,time:"6:40–7:40 PM",name:"Adults",program:"adults",groups:["adults"],location:"ds"},
    {day:1,time:"10:00–10:45 AM",name:"Homeschool Kids (Ages 4–12)",program:"homeschool",groups:["youth"],location:"ds"},
    {day:1,time:"11:30 AM–12:30 PM",name:"Adults",program:"adults",groups:["adults"],location:"ds"},
    {day:1,time:"5:00–6:00 PM",name:"Kids (Ages 8–12)",program:"junior",groups:["youth"],location:"austin"},
    {day:2,time:"5:00–5:45 PM",name:"Little Champions (Ages 3–7)",program:"little",groups:["little"],location:"ds"},
    {day:2,time:"5:50–6:35 PM",name:"Junior Warriors (Ages 8–12)",program:"junior",groups:["youth"],location:"ds"},
    {day:2,time:"6:40–7:40 PM",name:"Adults",program:"adults",groups:["adults"],location:"ds"},
    {day:3,time:"10:00–10:45 AM",name:"Homeschool Kids (Ages 4–12)",program:"homeschool",groups:["youth"],location:"ds"},
    {day:3,time:"11:30 AM–12:30 PM",name:"Adults",program:"adults",groups:["adults"],location:"ds"},
    {day:3,time:"5:00–6:00 PM",name:"Kids (Ages 8–12)",program:"junior",groups:["youth"],location:"austin"},
    {day:5,time:"11:00 AM–12:00 PM",name:"Adults / Self Defense",program:"adults",groups:["adults"],location:"ds"}
  ];

  function validProgram(value){return PROGRAMS.some(function(item){return item.id===value;})?value:"all";}
  function validLocation(value){return value==="ds"||value==="austin"?value:"all";}
  function programLabel(value){
    var match=PROGRAMS.find(function(item){return item.id===value;});
    return match?match.label:"All classes";
  }
  function matchesProgram(item,program){return program==="all"||item.groups.indexOf(program)!==-1;}

  function initCalendar(root,index){
    var pageProgram=validProgram(root.dataset.defaultProgram||"all");
    var selectedProgram=pageProgram;
    var selectedLocation=validLocation(root.dataset.defaultLocation||"all");
    var summaryId="jc-calendar-summary-"+index;

    root.innerHTML=
      '<div class="jc-calendar-controls">'+
        '<div class="jc-calendar-filter-groups">'+
          '<div class="jc-calendar-filter" data-filter="program"><span class="jc-calendar-label">Program</span></div>'+
          '<div class="jc-calendar-filter" data-filter="location"><span class="jc-calendar-label">Location</span></div>'+
        '</div>'+
        '<button class="jc-calendar-print" type="button">Print schedule</button>'+
      '</div>'+
      '<p class="jc-calendar-summary" id="'+summaryId+'" aria-live="polite"></p>'+
      '<div class="jc-calendar-scroll" tabindex="0" role="region" aria-label="Weekly class calendar; scroll horizontally on small screens">'+
        '<div class="jc-calendar-grid" role="table" aria-label="Weekly class schedule"></div>'+
      '</div>'+
      '<p class="jc-calendar-hint">On a phone, swipe the calendar left or right to see every day.</p>';

    var programFilter=root.querySelector('[data-filter="program"]');
    var locationFilter=root.querySelector('[data-filter="location"]');
    var grid=root.querySelector(".jc-calendar-grid");
    var summary=root.querySelector(".jc-calendar-summary");

    PROGRAMS.forEach(function(program){
      var button=document.createElement("button");
      button.type="button";
      button.className="jc-calendar-button";
      button.dataset.program=program.id;
      button.setAttribute("aria-pressed",String(program.id===selectedProgram));
      button.textContent=program.label;
      programFilter.appendChild(button);
    });
    [{id:"all",label:"All locations"},{id:"ds",label:"Dripping Springs"},{id:"austin",label:"Austin"}].forEach(function(location){
      var button=document.createElement("button");
      button.type="button";
      button.className="jc-calendar-button";
      button.dataset.location=location.id;
      button.setAttribute("aria-pressed",String(location.id===selectedLocation));
      button.textContent=location.label;
      locationFilter.appendChild(button);
    });

    function render(){
      var filtered=CLASSES.filter(function(item){
        return matchesProgram(item,selectedProgram)&&(selectedLocation==="all"||item.location===selectedLocation);
      });
      var byDay=DAYS.map(function(_,day){return filtered.filter(function(item){return item.day===day;});});
      var rows=Math.max.apply(null,byDay.map(function(items){return items.length;}).concat([1]));
      var html="";
      DAYS.forEach(function(day){html+='<div class="jc-calendar-day" role="columnheader">'+day+'</div>';});
      for(var row=0;row<rows;row++){
        byDay.forEach(function(items){
          var item=items[row];
          if(!item){html+='<div class="jc-calendar-blank" role="cell">'+(row===0&&!items.length?"—":"")+'</div>';return;}
          var featured=pageProgram!=="all"&&matchesProgram(item,pageProgram);
          html+='<div class="jc-calendar-slot'+(featured?' is-featured':'')+'" role="cell">'+
            '<span class="jc-calendar-time">'+item.time+'</span>'+
            '<span class="jc-calendar-name">'+item.name+'</span>'+
            '<span class="jc-calendar-location">'+LOCATIONS[item.location]+'</span>'+
          '</div>';
        });
      }
      grid.innerHTML=html;
      var locationText=selectedLocation==="all"?"all locations":LOCATIONS[selectedLocation];
      summary.textContent="Showing "+programLabel(selectedProgram)+" at "+locationText+" · "+filtered.length+" class"+(filtered.length===1?"":"es");
    }

    root.addEventListener("click",function(event){
      var programButton=event.target.closest("[data-program]");
      var locationButton=event.target.closest("[data-location]");
      if(programButton){
        selectedProgram=programButton.dataset.program;
        root.querySelectorAll("[data-program]").forEach(function(button){button.setAttribute("aria-pressed",String(button===programButton));});
        render();
      }
      if(locationButton){
        selectedLocation=locationButton.dataset.location;
        root.querySelectorAll("[data-location]").forEach(function(button){button.setAttribute("aria-pressed",String(button===locationButton));});
        render();
      }
    });

    root.querySelector(".jc-calendar-print").addEventListener("click",function(){
      document.body.classList.add("jc-printing");
      window.print();
    });
    window.addEventListener("afterprint",function(){document.body.classList.remove("jc-printing");});
    render();
  }

  document.querySelectorAll(".jc-calendar").forEach(initCalendar);
})();
