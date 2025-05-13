(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.dailygraphics = factory());
})(this, (function () { 'use strict';

  var graphic = {};

  var classify = function (str) {
    return (str + "").toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
  };

  var colors = {
    "red1": "#6C2315",
    "red2": "#A23520",
    "red3": "#D8472B",
    "red4": "#E27560",
    "red5": "#ECA395",
    "red6": "#F5D1CA",
    "orange1": "#714616",
    "orange2": "#AA6A21",
    "orange3": "#E38D2C",
    "orange4": "#EAAA61",
    "orange5": "#F1C696",
    "orange6": "#F8E2CA",
    "yellow1": "#77631B",
    "yellow2": "#B39429",
    "yellow3": "#EFC637",
    "yellow4": "#F3D469",
    "yellow5": "#F7E39B",
    "yellow6": "#FBF1CD",
    "teal1": "#0B403F",
    "teal2": "#11605E",
    "teal3": "#17807E",
    "teal4": "#51A09E",
    "teal5": "#8BC0BF",
    "teal6": "#C5DFDF",
    "blue1": "#28556F",
    "blue2": "#3D7FA6",
    "blue3": "#51AADE",
    "blue4": "#7DBFE6",
    "blue5": "#A8D5EF",
    "blue6": "#D3EAF7"
  };

  var fmtComma = s => s.toLocaleString("en-US").replace(/\.0+$/, "");

  var getAPMonth$1 = function (date) {
    var apMonths = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
    var thisMonth = date.getMonth();
    return apMonths[thisMonth];
  };

  // Given November 7, 1981...

  var getAPMonth = getAPMonth$1;
  var formatters = {
    // 81
    yearAbbrev: d => (d.getFullYear() + "").slice(-2),
    // 1981
    yearFull: d => d.getFullYear(),
    // 7, 1981
    dayYear: d => d.getDate() + ", " + d.getFullYear(),
    // Nov. 7
    monthDay: d => getAPMonth(d) + " " + d.getDate(),
    // Nov. 7, 1981
    dateFull: d => getAPMonth(d) + " " + formatters.dayYear(d)
  };
  var formatDate = formatters;

  var formatStyle = function (props) {
    var s = "";
    for (var key in props) {
      s += `${key}: ${props[key].toString()}; `;
    }
    return s;
  };

  var getLocation = function (href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
  };

  var getParameterByName$2 = function (name) {
    return new URLSearchParams(window.location.search).get(name);
  };

  /*
   * Checks if we are in production based on the url hostname
   * When embedded with pym it checks the parentUrl param
   * - If a url is given checks that
   * - If no url is given checks window.location.href
   */
  var isProduction = function () {
    let u = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.location.href;
    var url = new URL(u);
    var parentURL = url.searchParams.get("parentUrl");
    if (parentURL) {
      var parent = new URL(parentURL);
      return !parent.hostname.match(/^localhost|^stage-|^www-s1/i);
    }
    return true;
  };

  var makeTranslate = (x, y) => `translate(${x}, ${y})`;

  var urlToLocation$1 = function (url) {
    var a = document.createElement('a');
    a.href = url;
    return a;
  };

  /*
  * Wrap a block of SVG text to a given width
  * adapted from http://bl.ocks.org/mbostock/7555321
  */
  var wrapText = function (texts, width, lineHeight) {
    var eachText = function (text) {
      // work with arrays as well
      var words = text.textContent.split(/\s+/).reverse();
      var word = null;
      var line = [];
      var lineNumber = 0;
      var x = text.getAttribute("x") || 0;
      var y = text.getAttribute("y") || 0;
      var dx = parseFloat(text.getAttribute("dx")) || 0;
      var dy = parseFloat(text.getAttribute("dy")) || 0;
      text.textContent = "";
      var NS = "http://www.w3.org/2000/svg";
      var tspan = document.createElementNS(NS, "tspan");
      text.appendChild(tspan);
      var attrs = {
        x,
        y,
        dx: dx + "px",
        dy: dy + "px"
      };
      for (var k in attrs) {
        tspan.setAttribute(k, attrs[k]);
      }
      while (word = words.pop()) {
        line.push(word);
        tspan.textContent = line.join(" ");
        if (tspan.getComputedTextLength() > width) {
          line.pop();
          tspan.textContent = line.join(" ");
          line = [word];
          lineNumber += 1;
          tspan = document.createElementNS(NS, "tspan");
          text.appendChild(tspan);
          var attrs = {
            x,
            y,
            dx: dx + "px",
            dy: lineNumber * lineHeight + dy + "px"
          };
          for (var k in attrs) {
            tspan.setAttribute(k, attrs[k]);
          }
          tspan.textContent = word;
        }
      }
    };

    // convert D3 to array
    if ("each" in texts) {
      // call D3-style
      texts = texts.nodes();
    }
    texts.forEach(eachText);
  };

  /*
   * Basic Javascript helpers used in analytics.js and graphics code.
   */
  var helpers = {
    classify: classify,
    COLORS: colors,
    fmtComma: fmtComma,
    formatDate: formatDate,
    formatStyle: formatStyle,
    getAPMonth: getAPMonth$1,
    getLocation: getLocation,
    getParameterByName: getParameterByName$2,
    isProduction: isProduction,
    makeTranslate: makeTranslate,
    urlToLocation: urlToLocation$1,
    wrapText: wrapText
  };

  /*
   * Module for tracking standardized analytics.
   */
  var {
    getParameterByName: getParameterByName$1,
    urlToLocation
  } = helpers;
  (function () {
    /*
     * Google Analytics
     */
    var DIMENSION_PARENT_URL = 'dimension1';
    var DIMENSION_PARENT_HOSTNAME = 'dimension2';
    var DIMENSION_PARENT_INITIAL_WIDTH = 'dimension3';
    var setupGoogle = function () {
      (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
          (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date();
        a = s.createElement(o), m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
      })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
      ga('create', window.GOOGLE_ANALYTICS_ID, 'auto');

      // By default Google tracks the query string, but we want to ignore it.
      var location = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
      ga('set', 'location', location);
      ga('set', 'page', window.location.pathname);

      // Custom dimensions & metrics
      var parentUrl = getParameterByName$1('parentUrl') || '';
      var parentHostname = '';
      if (parentUrl) {
        parentHostname = urlToLocation(parentUrl).hostname;
      }
      var initialWidth = getParameterByName$1('initialWidth') || '';
      var customData = {};
      customData[DIMENSION_PARENT_URL] = parentUrl;
      customData[DIMENSION_PARENT_HOSTNAME] = parentHostname;
      customData[DIMENSION_PARENT_INITIAL_WIDTH] = initialWidth;

      // Track pageview
      ga('send', 'pageview', customData);
    };

    /*
     * Event tracking.
     */
    var trackEvent = function (eventName, label, value) {
      var eventData = {
        'hitType': 'event',
        'eventCategory': document.title,
        'eventAction': eventName
      };
      if (label) {
        eventData['eventLabel'] = label;
      }
      if (value) {
        eventData['eventValue'] = value;
      }

      // Track details about the parent with each event
      var parentUrl = getParameterByName$1('parentUrl') || '';
      var parentHostname = '';
      if (parentUrl) {
        parentHostname = urlToLocation(parentUrl).hostname;
      }
      eventData[DIMENSION_PARENT_URL] = parentUrl;
      eventData[DIMENSION_PARENT_HOSTNAME] = parentHostname;
      ga('send', eventData);
    };
    setupGoogle();
    return {
      'trackEvent': trackEvent
    };
  })();

  var {
    getParameterByName
  } = helpers;
  var pym_1 = new Promise(ok => {
    var url = "https://pym.nprapps.org/pym.v1.min.js";
    var script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
    script.onload = function () {
      var child = new pym.Child();

      // child.onMessage("on-screen", function(bucket) {
      //   analytics.trackEvent("on-screen", bucket);
      // });
      // child.onMessage("scroll-depth", function(data) {
      //   data = JSON.parse(data);
      //   analytics.trackEvent("scroll-depth", data.percent, data.seconds);
      // });

      ok(child);
    };
  });
  switch (getParameterByName("mode")) {
    // Homepage (if someone clicked the "This code will be embedded
    // on the NPR homepage." checkbox when pulling the embed code.)
    case "hp":
      document.body.classList.add("hp");
      isHomepage = true;
      break;
    // Direct links to the child page (iOS app workaround link)
    case "childlink":
      document.body.classList.add("childlink");
      break;
  }

  var url$2 = "https://apps.npr.org/dailygraphics/graphics/fonts/js/lib/webfont.js";
  var script$2 = document.createElement("script");
  script$2.src = url$2;
  document.head.appendChild(script$2);
  script$2.onload = function () {
    WebFont.load({
      custom: {
        families: ['Gotham SSm:n4,n7', 'Knockout 31 4r:n4'],
        urls: ['https://s.npr.org/templates/css/fonts/GothamSSm.css', 'https://s.npr.org/templates/css/fonts/Knockout.css']
      },
      timeout: 10000
    });
  };

  ({
    isMobile: window.matchMedia("(max-width: 500px)"),
    isDesktop: window.matchMedia("(min-width: 501px)")
  });

  var object = {
    policies: {
      "Which hospitals will deny nonemergency medical care to patients with past-due bills?": "DENIED",
      "Which hospitals post a Financial Assistance Policy online, outlining which patients qualify for help with their bills and how they can get aid?": "FAP",
      "Which hospitals post their collection policies online, explaining what tactics they use to collect bills and what can happen to patients who don't pay?": "COLLECTIONS",
      "Which hospitals — or collection agencies working with them — will report patients who don't pay their bills to credit reporting agencies?": "REPORTED",
      "Which hospitals will sell patients' debts to third-party buyers, who can then pursue patients to collect?": "DEBT",
      "Which hospitals — or collection agencies working with them — will sue patients or take other legal actions to collect bills, such as garnishing wages or placing liens on patients' property?": "SUED",
      "Info on financial assistance available with 'financial assistance' search?": "FINASSIST",
      "Medicaid expansion?": "MEDICAID",
      "Places liens or garnishes wages?": "LIENS",
      "Qualifying income for discounted care?": "DISCOUNTED",
      "Scorecard notes": "SCORECARD",
      "CITY": "CITY",
      "fips": "fips",
      "HOSPITAL_TYPE": "HOSPITAL_TYPE",
      "STATE": "state",
      "SYSTEM": "SYSTEM",
      "NAME": "NAME"
    },
    //come up with an array of arrays that hold colors that you want to use for the key, one group of colors for each policy
    colors: {
      "DEBT": ['#BF4747', '#005824', '#66c2a4'],
      "FAP": ['#88864E', '#BF4747', '#88864E'],
      "COLLECTIONS": ['#4a1486', '#BF4747', '#9e9ac8'],
      "REPORTED": ['#BF4747', '#5d8c76', '#EE9E4D'],
      "SUED": ['#BF4747', '#052962', '#94A0B3'],
      "DENIED": ['#b70303', '#631D6F', '#8E7B92']
    },
    listOfArrays: [["state"], ["HOSPITAL_TYPE"], ["DENIED"], ["REPORTED"], ["SUED"], ["DEBT"], ["COLLECTIONS"], ["FAP"]],
    radarChart: {
      "DEBT": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "FAP": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "COLLECTIONS": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      "REPORTED": "mo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
      "SUED": "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem",
      "DENIED": "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos.",
      "DISCOUNTED": "lorem ipsum"
    },
    states: {
      "All states": "All",
      Alabama: "Ala.",
      Alaska: "Alas.",
      Arizona: "Ariz.",
      Arkansas: "Ark.",
      California: "Calif.",
      Colorado: "Colo.",
      Connecticut: "Conn.",
      "District of Columbia": "D.C.",
      Delaware: "Del.",
      Florida: "Fla.",
      Georgia: "Ga.",
      Hawaii: "Hawaii",
      Idaho: "Idaho",
      Illinois: "Ill.",
      Indiana: "Ind.",
      Iowa: "Iowa",
      Kansas: "Kan.",
      Kentucky: "Ky.",
      Louisiana: "La.",
      Maine: "Maine",
      Maryland: "Md.",
      Massachusetts: "Mass.",
      Michigan: "Mich.",
      Minnesota: "Minn.",
      Mississippi: "Miss.",
      Missouri: "Mo.",
      Montana: "Mont.",
      Nebraska: "Neb.",
      Nevada: "Nev.",
      "New Hampshire": "N.H.",
      "New Jersey": "N.J.",
      "New Mexico": "N.M.",
      "New York": "N.Y.",
      "North Carolina": "N.C.",
      "North Dakota": "N.D.",
      Ohio: "Ohio",
      Oklahoma: "Okla.",
      Oregon: "Ore.",
      Pennsylvania: "Pa.",
      "Rhode Island": "R.I.",
      "South Carolina": "S.C.",
      "South Dakota": "S.D.",
      Tennessee: "Tenn.",
      Texas: "Texas",
      Utah: "Utah",
      Vermont: "Vt.",
      Virginia: "Va.",
      Washington: "Wash.",
      "West Virginia": "W.Va.",
      Wisconsin: "Wis.",
      Wyoming: "Wyo."
    }
  };

  /*
  ------------------------------
  METHOD: iterate through all of the circles and change their opacity based on the dropdown selection. do the same for the side column
  ------------------------------
  */
  const eventHandlers$1 = {
    // When the user clicks on the dropdown button, toggle between hiding and showing the dropdown content
    stateDropdownChange: function (currentState, listOfArrays, d) {
      let circles = document.getElementsByTagName("circle");

      // Loop through all circles, and reset the opacity to 1
      for (let i = 0; i < circles.length; i++) {
        circles[i].style.opacity = "1";
      }

      //if the current state is all, then show all of the hospitals
      if (currentState == "All") {
        let hospitals = document.getElementsByClassName("sideColumnHospital");
        for (let i = 0; i < hospitals.length; i++) {
          hospitals[i].style.display = "block";
        }
        return;
      }

      //for everything else, search the states object and find the key that matches the current state using the abbreviation
      else {
        for (let i = 0; i < circles.length; i++) {
          let d = circles[i].getAttribute("data-state");
          if (d != currentState) {
            circles[i].style.opacity = "0.05";
          } else {
            circles[i].style.opacity = "1";
          }
        }
        //hide the hospitals that are not in the selected state
        let hospitals = document.getElementsByClassName("sideColumnHospital");
        for (let i = 0; i < hospitals.length; i++) {
          let d = hospitals[i].getAttribute("data-state");
          if (d != currentState) {
            hospitals[i].style.display = "none";
          } else {
            hospitals[i].style.display = "block";
          }
        }

        //loop through all the listOfArrays and filter out the ones that don't match the current state
        let stateArray = listOfArrays[0];
        let newListOfArrays = [];
        let newDataState = ["state"],
          dataHospitalType = ["HOSPITAL_TYPE"],
          dataFap = ["FAP"],
          dataCollections = ["COLLECTIONS"],
          dataReported = ["REPORTED"],
          dataDebt = ["DEBT"],
          dataSued = ["SUED"],
          dataDenied = ["DENIED"];
        for (let i = 0; i < stateArray.length; i++) {
          //loop through each of the other arrays in listOfArrays and filter out the ones that don't match the current state. create an object with the filtered arrays and push it to the newListOfArrays
          for (let j = 1; j < listOfArrays.length; j++) {
            if (stateArray[i] == currentState) {
              //create a key value pair, with the key being the state name and the value being the current entry
              newDataState.push(stateArray[i]);
              dataHospitalType.push(listOfArrays[j][i]);
              newDataState.push(stateArray[i]);
              dataHospitalType.push(listOfArrays[j][i]);
              dataFap.push(listOfArrays[j][i]);
              dataCollections.push(listOfArrays[j][i]);
              dataReported.push(listOfArrays[j][i]);
              dataDebt.push(listOfArrays[j][i]);
              dataSued.push(listOfArrays[j][i]);
              dataDenied.push(listOfArrays[j][i]);
            }
          }
        }
        let newListOfCountedNames = [];
        newListOfArrays.push(newDataState, dataHospitalType, dataFap, dataCollections, dataReported, dataDebt, dataSued, dataDenied);
        newListOfArrays.forEach(function (array) {
          let countedNames = array.reduce((allAnswers, answer) => {
            const currCount = allAnswers[answer] ?? 0;
            return {
              ...allAnswers,
              [answer]: currCount + 1
            };
          }, {});
          newListOfCountedNames.push(countedNames);
        });
        //THIS IS THE CODE THAT CHANGES THE KEY BASED ON THE STATE FILTER. EASY TO REIMPLEMENT IF WE WANT
        //find the currently selected button and get its value
        let currentlySelectedButton = document.querySelector("button.active");
        //get the id of the currently selected button
        let currentlySelectedButtonId = currentlySelectedButton.getAttribute("id");
        //get the associated question from the currentlySelectedButtonId
        //find the key in policies where the value is currentlySelectedButtonId
        let policyKey = Object.keys(object.policies).find(key => object.policies[key] === currentlySelectedButtonId);
        this.policydropdownChange(newListOfCountedNames, policyKey);
      }
    },
    /*
    ------------------------------
    METHOD: iterate through all of the circles and change their color based on the policy selected. to do this, you will change the html of the key and the color of the circles
    ------------------------------
    */
    policydropdownChange: function (listOfPolicies, d) {
      let circles = document.getElementsByTagName("circle");
      let currentQuestion = d;
      let policyAbbr = object.policies[currentQuestion];
      let currentPolicyAnswers = {};
      for (let i = 0; i < circles.length; i++) {
        let currentPolicy = circles[i].getAttribute("data-" + policyAbbr);
        //set the color based on the policyAbbr

        let currentColorArray = object.colors[policyAbbr];
        let fillColor = ""; // initialize the fill color to an empty string

        //have currentTotals be an object with the key being the policy and the value being the number of times it appears
        listOfPolicies[policyAbbr];

        //skip if currentPolicy is null
        if (currentPolicy == null) {
          continue;
        }
        //add the answers for each question as a value to listOfPolicies[policyAbbr]
        if (currentPolicy.includes("Yes")) {
          if (!currentPolicyAnswers.hasOwnProperty('Yes')) {
            // if currentPolicy is not already a property of currentPolicyAnswers, set its value to 0
            currentPolicyAnswers['Yes'] = 0;
          }
          // increment the value of the currentPolicy property
          currentPolicyAnswers['Yes']++;
          //circles[i].style.fill = currentColorArray[0];
          fillColor = currentColorArray[0];
        } else if (currentPolicy.includes("No")) {
          if (!currentPolicyAnswers.hasOwnProperty('No')) {
            // if currentPolicy is not already a property of currentPolicyAnswers, set its value to 0
            currentPolicyAnswers['No'] = 0;
          }
          // increment the value of the currentPolicy property
          currentPolicyAnswers['No']++;
          fillColor = currentColorArray[1];
        } else if (currentPolicy != null || currentPolicy != undefined || currentPolicy != "") {
          //remove all the * and spaces from the currentPolicy
          currentPolicy = currentPolicy.replace(/\*/g, '');
          currentPolicy = currentPolicy.replace(/\s/g, '');
          if (!currentPolicyAnswers.hasOwnProperty(currentPolicy)) {
            // if currentPolicy is not already a property of currentPolicyAnswers, set its value to 0
            currentPolicyAnswers[currentPolicy] = 0;
          }
          // increment the value of the currentPolicy property
          currentPolicyAnswers[currentPolicy]++;
          fillColor = currentColorArray[2];
        }

        //get the xposition of currentCX
        circles[i].getAttribute("cx");
        d3.select(circles[i]).transition().delay(.003).ease(d3.easeLinear).attr("r", 8).style("fill", fillColor);
      }
      let keyHTML = "";
      key.html(keyHTML);

      //call the change the key function by using the policy abbreviation
      this.changeTheKey(listOfPolicies, d, currentPolicyAnswers);
    },
    /*
    ==============================
    METHOD: change the key based on the policy selected
    1. Take the policy abbreviation and use it to get the description from the descriptions object
    2. Iterate through the counted totals and find the current policy abbreviation is in the object. when you do, find the percentages of the answers and create the html for the key
    ==============================
    */
    changeTheKey: function (countedTotals, d, countOfAnswers) {
      let currentQuestion = d;
      let policyAbbr = object.policies[currentQuestion];
      let buttonText = window.BUTTONS;
      let currentContext = '';
      buttonText = JSON.parse(buttonText);
      //go through the buttonText object and find the current question
      for (let i = 0; i < buttonText.length; i++) {
        //if the Question property matches the current question, set the currentContext to the Context property
        if (buttonText[i].Question == currentQuestion) {
          currentContext = buttonText[i];
        }
      }
      let keyDescription = "<p class='keyDescription'>" + currentContext['Question'] + "</p>";

      //iterate through all of the totals and determine if they have the policy abbreviation in the object
      for (let i = 0; i < countedTotals.length; i++) {
        if (countedTotals[i].hasOwnProperty(policyAbbr)) {
          countedTotals[i];
          //swap the places of the 'no' and 'some but not all' values in the array for collections

          //calculate the sum of all the total answers in countOfAnswers, no matter what the value ie
          let total = 0;
          for (let key in countOfAnswers) {
            total += countOfAnswers[key];
          }
          //reorder countOfAnswers to that 'yes' is first, 'no' is last, and everything else is in between.
          let reorderedCountOfAnswers = {};
          if (policyAbbr == "COLLECTIONS") {
            reorderedCountOfAnswers['Yes'] = countOfAnswers['Yes'];
            reorderedCountOfAnswers['Some,butnotall'] = countOfAnswers['Some,butnotall'];
            reorderedCountOfAnswers['No'] = countOfAnswers['No'];
          } else {
            // Add 'Yes' to the beginning of the reordered object
            if ('Yes' in countOfAnswers) {
              reorderedCountOfAnswers['Yes'] = countOfAnswers['Yes'];
            }
            // Add all answers except for 'Yes' and 'No' to the reordered object
            for (let key in countOfAnswers) {
              if (key !== 'Yes' && key !== 'No') {
                reorderedCountOfAnswers[key] = countOfAnswers[key];
              }
            }
            // Add 'No' to the end of the reordered object
            if ('No' in countOfAnswers) {
              reorderedCountOfAnswers['No'] = countOfAnswers['No'];
            }
          }
          countOfAnswers = reorderedCountOfAnswers;

          // Create a new div element for the key
          let keyDiv = document.createElement("div");
          keyDiv.id = "key";

          //create a wrapper for the key text
          let keyTextWrapper = document.createElement("div");
          keyTextWrapper.id = "keyTextWrapper";

          //create yet another wrapper that will be used to hold the keyText wrapper and a second bar graph
          let keyWrapper = document.createElement("div");
          keyWrapper.id = "keyWrapper";

          // Create a new div element for the bar graph
          let barGraphDiv = document.createElement("div");
          barGraphDiv.id = "keyBarGraph";
          barGraphDiv.style.height = "100%";
          let barGraphDiv2 = document.createElement("div");
          barGraphDiv2.id = "keyBarGraph2";

          // Iterate over the properties in the filteredTotals object
          for (let key in countOfAnswers) {
            //check to make sure the key isn't the policy abbreviation (i.e. FAP)
            if (key != policyAbbr) {
              // Create a new div element for the current property
              let barDiv = document.createElement("div");
              barDiv.id = key + "Bar";
              barDiv.style.width = countOfAnswers[key] / (total / 100) + "%";

              // use the current policy to access the corresponding color array from the colors object
              let currentColorArray = object.colors[policyAbbr];
              if (key === "Yes") {
                barDiv.style.backgroundColor = currentColorArray[0];
              } else if (key === "No") {
                barDiv.style.backgroundColor = currentColorArray[1];
              } else {
                barDiv.style.backgroundColor = currentColorArray[2];
              }

              // Append the bar div to the bar graph div
              barGraphDiv.appendChild(barDiv);

              // Create a new span element for the current property
              let span = document.createElement("div");
              //give the span an display property of inline
              span.style.display = "inline-flex";
              //create a square div 20px by 20px that will lie to the left of the span 
              let square = document.createElement("div");
              Object.assign(square.style, {
                width: "20px",
                height: "20px",
                backgroundColor: barDiv.style.backgroundColor,
                float: "left",
                marginRight: "5px",
                marginTop: "0px"
              });
              //append the square to the span
              span.appendChild(square);
              // Create a new p element for the current property
              let p = document.createElement("p");
              if (key == "Yes" || key == "No") {
                p.innerText = `${currentContext[key]}`;
                span.setAttribute("data-selection", key);
              } else if (currentContext['Abbreviation'] == "COLLECTIONS") {
                let newKey = "Some, but not all";
                p.innerText = `${newKey}`;
                span.setAttribute("data-selection", 'Other');
              } else {
                p.innerText = `${key}`;
                span.setAttribute("data-selection", 'Other');
              }
              span.appendChild(p);

              // Append the span element to the key text wrapper
              keyTextWrapper.appendChild(span);

              //create a horizontal bar chart with the width of the values corresponding to the percentage of the total. make sure to give each bar a height and width of 100% so that they will stack on top of each other
              let barDiv2 = document.createElement("div");
              barDiv2.id = key + "Bar2";
              barDiv2.style.height = '20px';
              barDiv2.style.width = countOfAnswers[key] / (total / 100) + "%";
              barDiv2.style.marginBottom = "3px";

              // Set the background color based on the current property
              if (key === "Yes") {
                barDiv2.style.backgroundColor = currentColorArray[0];
                barDiv2.setAttribute("data-selection", "Yes");
              } else if (key === "No") {
                barDiv2.style.backgroundColor = currentColorArray[1];
                barDiv2.setAttribute("data-selection", "No");
              } else {
                barDiv2.style.backgroundColor = currentColorArray[2];
                barDiv2.setAttribute("data-selection", "Other");
              }
              //create a text span with the count of the current answer and append it to the bar div
              let textSpan = document.createElement("span");
              textSpan.innerText = countOfAnswers[key];
              textSpan.style.color = "white";
              textSpan.style.fontSize = "12px";
              textSpan.style.fontWeight = "bold";
              textSpan.style.marginLeft = "3px";
              barDiv2.appendChild(textSpan);

              // Add the bar div to right before the barDiv2
              barGraphDiv2.appendChild(barDiv2);
            }

            //reorder the children of keyBarGraph2 so that the bar with the data-selection attribute of "Yes" is the first child
            barGraphDiv2.querySelector("[data-selection='Yes']");
            barGraphDiv2.querySelector("[data-selection='No']");
            barGraphDiv2.querySelector("[data-selection='Other']");
            keyWrapper.appendChild(keyTextWrapper);
            keyWrapper.appendChild(barGraphDiv2);
            keyDiv.appendChild(keyWrapper);
          }

          // Append the bar graph div to become the first element of key div element
          //keyDiv.insertBefore(barGraphDiv, keyDiv.firstChild);

          // Append the key div element to the key container div element
          key.html(keyDescription);
          document.getElementById('keyHTMLContainer');
          key.node().appendChild(keyDiv);
        }
      }
    }
  };

  /*
  ------------------------------
  SECTION: create the POLICY dropdown and populate it with the list of policies
  ------------------------------
  export const policyDropdown = d3
      .select("#svganchor")
      .append("select")
      .attr("id", "policyDropdownSelector")
      .selectAll("option")
      .data(Object.keys(policies))
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);
   */

  /*
  ------------------------------
  SECTION: create the STATE dropdown and populate it with state names
  ------------------------------
  */
  const stateDropdown$1 = d3.select("#fixedSideColumnTop").append("select").attr("id", "stateDropdownSelector").attr("name", "name-list").selectAll("option").data(Object.keys(object.states)).enter().append("option").text(function (d) {
    return d;
  });
  //insert the keyContainer to the end of the button container
  const key = d3.select("#keyHTMLContainer");
  key.empty();
  key.append("div").attr("id", "keyContainer");

  var dropdownHandlers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    eventHandlers: eventHandlers$1,
    stateDropdown: stateDropdown$1,
    key: key
  });

  /*
  ------------------------------
  Export the click event handlers, the click event listeners, and the element that makes the button clickable
  ------------------------------
  */

  // Export the event handlers
  const clickHandlers$1 = {
    // When the user clicks on the dropdown button, toggle between hiding and showing the dropdown content
    buttonClicked: function () {
      let sideColumn = document.getElementById("fixedSideColumn");

      //toggle the display property of the side column
      let currentClassList = sideColumn.classList;
      currentClassList.toggle("hidden");
      let listofSideColumnHospital = document.getElementsByClassName("sideColumnHospital");
      for (let i = 0; i < listofSideColumnHospital.length; i++) {
        let currentHospital = listofSideColumnHospital[i];
        let currentClassList = currentHospital.classList;
        currentClassList.toggle("visible");
      }
    }
  };

  var buttonHandlers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    clickHandlers: clickHandlers$1
  });

  /*
  ------------------------------
  Export the tooltip functions, handlers, and data
  ------------------------------
  */

  // Export the event handlers
  const tooltipHandlers$1 = {
    // When the user enters the tooltip
    mouseEnter: function (xLocation, yLocation, currentElement, originalData, originalDataCMS) {
      //in original data, for all the keys that have four digits, add a zero to the front
      //for all the keys that have three digits, add two zeros to the front
      //get the current element's cmsID from the currentElement.__data__
      //change the currentElement's fill color
      currentElement.style.stroke = "black";
      currentElement.style.strokeWidth = "4px";
      let currentCMS = currentElement.getAttribute('data-cmsID');
      let cmsEntry = originalDataCMS[currentCMS];
      currentElement.classList.add("hovered");
      if (cmsEntry) {
        tooltip$1.style("opacity", 1).style("left", xLocation - 250 + "px").style("top", yLocation - 300 + "px").html(`<div class="tooltip__hospital"><b>${cmsEntry['NAME']}</b></div><div class="tooltip__name">${cmsEntry['CITY']}, ${cmsEntry.state}</div>`);
      }
    },
    mouseOut: function (currentElement) {
      tooltip$1.style("opacity", 0);
      currentElement.style.stroke = "white";
      currentElement.style.strokeWidth = "1.4px";
      currentElement.classList.remove("hovered");
    }
  };

  /*
  ------------------------------
  SECTION: add a tooltip
  ------------------------------
  */
  const tooltip$1 = d3.select("#svganchor").append("div").attr("class", "tooltip").style("opacity", 0);

  var tooltipHandlers$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    tooltipHandlers: tooltipHandlers$1,
    tooltip: tooltip$1
  });

  var RadarChart = {
    defaultConfig: {
      containerClass: 'radar-chart',
      w: 600,
      h: 600,
      factor: 0.95,
      factorLegend: 1,
      levels: 3,
      maxValue: 0,
      radians: 2 * Math.PI,
      color: d3.scaleOrdinal().range(['#6F257F', '#CA0D59']),
      axisLine: true,
      axisText: true,
      circles: true,
      radius: 5,
      axisJoin: function (d, i) {
        return d.className || i;
      },
      transitionDuration: 300
    },
    chart: function () {
      // default config
      var cfg = Object.create(RadarChart.defaultConfig);
      function radar(selection) {
        selection.each(function (data) {
          var container = d3.select(this);

          // allow simple notation
          data = data.map(function (datum) {
            if (datum instanceof Array) {
              datum = {
                axes: datum
              };
            }
            return datum;
          });
          var maxValue = Math.max(cfg.maxValue, d3.max(data, function (d) {
            return d3.max(d.axes, function (o) {
              return o.value;
            });
          }));
          var allAxis = data[0].axes.map(function (i, j) {
            return i.axis;
          });
          var total = allAxis.length;
          var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
          container.classed(cfg.containerClass, 1);
          function getPosition(i, range, factor, func) {
            factor = typeof factor !== 'undefined' ? factor : 1;
            return range * (1 - factor * func(i * cfg.radians / total));
          }
          function getHorizontalPosition(i, range, factor) {
            return getPosition(i, range, factor, Math.sin);
          }
          function getVerticalPosition(i, range, factor) {
            return getPosition(i, range, factor, Math.cos);
          }

          // levels && axises
          var levelFactors = d3.range(0, cfg.levels).map(function (level) {
            return radius * ((level + 1) / cfg.levels);
          });
          var levelGroups = container.selectAll('g.level-group').data(levelFactors);
          levelGroups.enter().append('g');
          levelGroups.exit().remove();
          levelGroups.attr('class', function (d, i) {
            return 'level-group level-group-' + i;
          });
          var levelLine = levelGroups.selectAll('.level').data(function (levelFactor) {
            return d3.range(0, total).map(function () {
              return levelFactor;
            });
          });
          levelLine.enter().append('line');
          levelLine.exit().remove();
          levelLine.attr('class', 'level').attr('x1', function (levelFactor, i) {
            return getHorizontalPosition(i, levelFactor);
          }).attr('y1', function (levelFactor, i) {
            return getVerticalPosition(i, levelFactor);
          }).attr('x2', function (levelFactor, i) {
            return getHorizontalPosition(i + 1, levelFactor);
          }).attr('y2', function (levelFactor, i) {
            return getVerticalPosition(i + 1, levelFactor);
          }).attr('transform', function (levelFactor) {
            return 'translate(' + (cfg.w / 2 - levelFactor) + ', ' + (cfg.h / 2 - levelFactor) + ')';
          });
          if (cfg.axisLine || cfg.axisText) {
            var axis = container.selectAll('.axis').data(allAxis);
            var newAxis = axis.enter().append('g');
            if (cfg.axisLine) {
              newAxis.append('line');
            }
            if (cfg.axisText) {
              newAxis.append('text');
            }
            axis.exit().remove();
            axis.attr('class', 'axis');
            if (cfg.axisLine) {
              axis.select('line').attr('x1', cfg.w / 2).attr('y1', cfg.h / 2).attr('x2', function (d, i) {
                return getHorizontalPosition(i, cfg.w / 2, cfg.factor);
              }).attr('y2', function (d, i) {
                return getVerticalPosition(i, cfg.h / 2, cfg.factor);
              });
            }
            if (cfg.axisText) {
              axis.select('text').attr('class', function (d, i) {
                var p = getHorizontalPosition(i, 0.5);
                return 'legend ' + (p < 0.4 ? 'left' : p > 0.6 ? 'right' : 'middle');
              }).attr('dy', function (d, i) {
                var p = getVerticalPosition(i, 0.5);
                return p < 0.1 ? '1em' : p > 0.9 ? '0' : '0.5em';
              }).text(function (d) {
                return d;
              }).attr('x', function (d, i) {
                return getHorizontalPosition(i, cfg.w / 2, cfg.factorLegend);
              }).attr('y', function (d, i) {
                return getVerticalPosition(i, cfg.h / 2, cfg.factorLegend);
              });
            }
          }

          // content
          data.forEach(function (d) {
            d.axes.forEach(function (axis, i) {
              axis.x = getHorizontalPosition(i, cfg.w / 2, parseFloat(Math.max(axis.value, 0)) / maxValue * cfg.factor);
              axis.y = getVerticalPosition(i, cfg.h / 2, parseFloat(Math.max(axis.value, 0)) / maxValue * cfg.factor);
            });
          });
          var polygon = container.selectAll(".area").data(data, cfg.axisJoin);
          polygon.enter().append('polygon').classed({
            area: 1,
            'd3-enter': 1
          }).on('mouseover', function (d) {
            container.classed('focus', 1);
            d3.select(this).classed('focused', 1);
          }).on('mouseout', function () {
            container.classed('focus', 0);
            d3.select(this).classed('focused', 0);
          });
          polygon.exit().classed('d3-exit', 1) // trigger css transition
          .transition().duration(cfg.transitionDuration).remove();
          polygon.each(function (d, i) {
            var classed = {
              'd3-exit': 0
            }; // if exiting element is being reused
            classed['radar-chart-serie' + i] = 1;
            if (d.className) {
              classed[d.className] = 1;
            }
            d3.select(this).classed(classed);
          })
          // styles should only be transitioned with css
          .style('stroke', function (d, i) {
            return cfg.color(i);
          }).style('fill', function (d, i) {
            return cfg.color(i);
          }).transition().duration(cfg.transitionDuration)
          // svg attrs with js
          .attr('points', function (d) {
            return d.axes.map(function (p) {
              return [p.x, p.y].join(',');
            }).join(' ');
          }).each('start', function () {
            d3.select(this).classed('d3-enter', 0); // trigger css transition
          });
          if (cfg.circles && cfg.radius) {
            var tooltip = container.selectAll('.tooltip').data([1]);
            tooltip.enter().append('text').attr('class', 'tooltip');
            var circleGroups = container.selectAll('g.circle-group').data(data, cfg.axisJoin);
            circleGroups.enter().append('g').classed({
              'circle-group': 1,
              'd3-enter': 1
            });
            circleGroups.exit().classed('d3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();
            circleGroups.each(function (d) {
              var classed = {
                'd3-exit': 0
              }; // if exiting element is being reused
              if (d.className) {
                classed[d.className] = 1;
              }
              d3.select(this).classed(classed);
            }).transition().duration(cfg.transitionDuration).each('start', function () {
              d3.select(this).classed('d3-enter', 0); // trigger css transition
            });
            var circle = circleGroups.selectAll('.circle').data(function (datum, i) {
              return datum.axes.map(function (d) {
                return [d, i];
              });
            });
            circle.enter().append('circle').classed({
              circle: 1,
              'd3-enter': 1
            }).on('mouseover', function (d) {
              tooltip.attr('x', d[0].x - 10).attr('y', d[0].y - 5).text(d[0].value).classed('visible', 1);
              container.classed('focus', 1);
              container.select('.area.radar-chart-serie' + d[1]).classed('focused', 1);
            }).on('mouseout', function (d) {
              tooltip.classed('visible', 0);
              container.classed('focus', 0);
              container.select('.area.radar-chart-serie' + d[1]).classed('focused', 0);
            });
            circle.exit().classed('d3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();
            circle.each(function (d) {
              var classed = {
                'd3-exit': 0
              }; // if exit element reused
              classed['radar-chart-serie' + d[1]] = 1;
              d3.select(this).classed(classed);
            })
            // styles should only be transitioned with css
            .style('fill', function (d) {
              return cfg.color(d[1]);
            }).transition().duration(cfg.transitionDuration)
            // svg attrs with js
            .attr('r', cfg.radius).attr('cx', function (d) {
              return d[0].x;
            }).attr('cy', function (d) {
              return d[0].y;
            }).each('start', function () {
              d3.select(this).classed('d3-enter', 0); // trigger css transition
            });

            // ensure tooltip is upmost layer
            var tooltipEl = tooltip.node();
            tooltipEl.parentNode.appendChild(tooltipEl);
          }
        });
      }
      radar.config = function (value) {
        if (!arguments.length) {
          return cfg;
        }
        if (arguments.length > 1) {
          cfg[arguments[0]] = arguments[1];
        } else {
          d3.entries(value || {}).forEach(function (option) {
            cfg[option.key] = option.value;
          });
        }
        return radar;
      };
      return radar;
    },
    draw: function (id, d, options) {
      var chart = RadarChart.chart().config(options);
      var cfg = chart.config();
      d3.select(id).select('svg').remove();
      d3.select(id).append("svg").attr("width", cfg.w).attr("height", cfg.h).datum(d).call(chart);
    }
  };

  /*
  ------------------------------
  Export the modal and the close button
  ------------------------------
  */
  const modalFunctions$1 = {
    // When the user enters the tooltip
    closeCircle: function () {
      let modalElement = document.getElementsByClassName("modal")[0];
      modalElement.classList.remove("clicked");
      d3.select(".modal").remove();
    },
    /*
    ------------------------------
    METHOD: show the information in the modal
    ------------------------------
    */
    clickCircle: function (currentElement, originalData, originalDataCMS) {
      //empty out the modalContent, if it exists
      d3.select(".modal").remove();
      d3.select("#fixedSideColumnTop").append("div").attr("class", "modal").append("div").attr("class", "close");
      d3.select(".close").on("click", function (d) {
        modalFunctions$1.closeCircle();
      });
      let modalContent = d3.select(".modal").append("div").attr("class", "modalContent");
      originalData[currentElement.__data__.id];
      let currentCMS = currentElement.getAttribute('data-cmsID');
      let cmsEntry = originalDataCMS[currentCMS];
      let modalElement = document.getElementsByClassName("modal")[0];
      modalElement.classList.add("clicked");

      //empty out the modalContent
      modalContent.html(`
            <h2 class="modalTitle">${currentElement.getAttribute("data-NAME")}</h2>
            <h2 class="modalTitle">${currentElement.getAttribute("data-SUED")}</h2>

            <div class="introContainer">
            <div class="modalContentGroup introText">
            <h3 class="modalTitle"> </h3>
            <div class="modal__text"><b>Location:</b> <span class="cardLocation">${currentElement.getAttribute("data-CITY")}, ${currentElement.getAttribute("data-state")}</span></div>
            ${currentElement.getAttribute("data-SYSTEM") ? `<div class="modal__text"><b>System:</b> <span class="cardLocation">${currentElement.getAttribute("data-SYSTEM")}</span></div>` : ""}
            <div class="modal__text"><b>Hospital type: </b> <span class="cardLocation">${currentElement.getAttribute("data-hospitalType")}</span></div>
            <div class="modal__text"><b>Beds:</b> <span class="cardLocation">${currentElement.getAttribute("data-beds")}</span></div>
            ${currentElement.getAttribute("data-PUBLIC") ? `<div class="modal__text"><b>Public university system?</b> <span class="cardLocation">Yes</span></div>` : ""}
            ${currentElement.getAttribute("data-USNEWS") ? `<div class="modal__text"><b>US News top 20?</b> <span class="cardLocation">Yes</span></div>` : ""}
            </div>
            <div class="modalContentGroup introImage">
                <div id="radarChart"></div>
            </div>
            </div>
            <div class="modalContentGroupWrap">
            <div class="modalContentGroup financialAssistance">
            <h3 class="modalTitle">Financial assistance:</h3>
            <div class="modal__text"><span>Who qualifies for free care?</span> <span>${currentElement.getAttribute("data-FREE")}</span></div>
            <div class="modal__text"><span>Who qualifies for discounted care?</span> <span>${currentElement.getAttribute("data-DISCOUNT")}</span></div>
            <div class="modal__text"><span>Provides aid to patients with very large medical bills?</span> <span>${currentElement.getAttribute("data-AID")}</span></div>
            <div class="modal__text"><span>Financial Assistance Policy available online?</span> 
            <span>
                ${currentElement.getAttribute("data-FAPLINK") !== null && currentElement.getAttribute("data-FAPLINK") !== undefined && currentElement.getAttribute("data-FAPLINK") !== "" ? `<u><a href="${currentElement.getAttribute("data-FAPLINK")}">${currentElement.getAttribute("data-FAP")}</a></u>` : `${currentElement.getAttribute("data-FAP")}`}
            </span>
            </div>
            </div>
            <div class="modalContentGroup billingCollections">
            <h3 class="modalTitle">Billing and collections:</h3>
            <div class="modal__text"><span>Allows reporting of patients to credit rating agencies?</span><span>${currentElement.getAttribute("data-REPORTED")}</span></div>
            <div class="modal__text"><span>Allows sale of patient debt?</span> <span>${currentElement.getAttribute("data-DEBT")}</span></div>
            <div class="modal__text"><span>Allows nonemergency care to be restricted for patients with debt?</span> <span>${currentElement.getAttribute("data-DENIED")}</span></div>
            <div class="modal__text"><span>Allows lawsuits against patients, liens, or wage garnishment?</span> <span>${currentElement.getAttribute("data-SUED")}</span></div>
            <div class="modal__text"><span>Collection policies available online?</span> 
            <span>
                ${cmsEntry.COLLECTIONS_LINK !== null && cmsEntry.COLLECTIONS_LINK !== undefined && cmsEntry.COLLECTIONS_LINK !== "" ? `<u><a href="${cmsEntry.COLLECTIONS_LINK}">${currentElement.getAttribute("data-COLLECTIONS")}</a></u>` : `${currentElement.getAttribute("data-COLLECTIONS")}`}
            </span>
            </div>
            </div>
            </div>
            <div class="modalContentGroup">
            <h3 class="modalTitle">Scorecard notes:</h3>
            <div class="modal__text">${currentElement.getAttribute("data-SCORECARD")}</div>
            <div class="modal__text">Note on data: Information is from written policies, unless otherwise noted. However, hospital policies and practices change. Over time hospitals close, change names, or merge with other institutions. If KHN learns that an entry is no longer accurate, it will update information that it verifies.</div>
            <div class="keyBlockSub">
            </div>
            </div>`);
      //this.createRadarChart(currentElement, originalData)
      this.createQuadrant(currentElement, originalData);
    },
    /*
    ------------------------------
    METHOD: create the radar chart and append it to the modal
    ------------------------------
    */
    createRadarChart: function (currentElement, originalData) {
      const NUM_OF_SIDES = 7;
      let NUM_OF_LEVEL = 3,
        size = 140,
        offset = Math.PI - 1,
        polyangle = Math.PI * 2 / NUM_OF_SIDES,
        r = 0.7 * size,
        r_0 = r / 2,
        center = {
          x: size / 2,
          y: size / 2
        };
      const generateData = length => {
        const data = [];
        const min = 25;
        const max = 100;
        let policiesList = ['F.A', 'L', 'R.C', 'D.S', 'C.R.', 'B.B', 'D.C.'];
        //iterate over each point, find a value, and divide it so the answer is either 1, 2, or 3
        for (let i = 0; i < length; i++) {
          data.push({
            name: policiesList[i],
            value: Math.round(min + (max - min) * Math.random())
          });
          //print out the index you just pushed into the array
        }
        return data;
      };
      const genTicks = levels => {
        const ticks = [];
        const step = 3 / levels;
        for (let i = 0; i <= levels; i++) {
          const num = step * i;
          if (Number.isInteger(step)) {
            ticks.push(num);
          } else {
            ticks.push(num.toFixed(2));
          }
        }
        return ticks;
      };
      const ticks = genTicks(NUM_OF_LEVEL);
      const dataset = generateData(NUM_OF_SIDES);
      d3.select("#radarChart").append("svg").attr("width", size).attr("height", size);
      const g = d3.select("svg").append("g");
      const scale = d3.scaleLinear().domain([0, 100]).range([0, r_0]).nice();
      const generatePoint = _ref => {
        let {
          length,
          angle
        } = _ref;
        const point = {
          x: center.x + length * Math.sin(offset - angle),
          y: center.y + length * Math.cos(offset - angle)
        };
        return point;
      };
      const drawPath = (points, parent) => {
        const lineGenerator = d3.line().x(d => d.x).y(d => d.y);
        parent.append("path").attr("d", lineGenerator(points));
      };
      const generateAndDrawLevels = (levelsCount, sideCount) => {
        for (let level = 1; level <= levelsCount; level++) {
          const hyp = level / levelsCount * r_0;
          const points = [];
          for (let vertex = 0; vertex < sideCount; vertex++) {
            const theta = vertex * polyangle;
            points.push(generatePoint({
              length: hyp,
              angle: theta
            }));
          }
          const group = g.append("g").attr("class", "levels");
          drawPath([...points, points[0]], group);
        }
      };
      const generateAndDrawLines = sideCount => {
        const group = g.append("g").attr("class", "grid-lines");
        for (let vertex = 1; vertex <= sideCount; vertex++) {
          const theta = vertex * polyangle;
          const point = generatePoint({
            length: r_0,
            angle: theta
          });
          drawPath([center, point], group);
        }
      };
      const drawCircles = points => {
        g.append("g").attr("class", "indic").selectAll("circle").data(points).enter().append("circle").attr("cx", d => d.x).attr("cy", d => d.y).attr("fill", "#999").attr("r", 4);
      };
      const drawText = (text, point, isAxis, group) => {
        if (isAxis) {
          const xSpacing = text.toString().includes(".") ? 5 : 12;
          group.append("text").attr("x", point.x - xSpacing).attr("y", point.y - 5).html(text).style("text-anchor", "middle").attr("fill", "darkgrey").style("font-size", "12px").style("font-family", "sans-serif");
        } else {
          group.append("text").attr("x", point.x).attr("y", point.y).html(text).style("text-anchor", "middle").attr("fill", "darkgrey").style("font-size", "13px").style("font-family", "sans-serif");
        }
      };
      const drawData = (dataset, n) => {
        const points = [];
        dataset.forEach((d, i) => {
          const len = scale(d.value);
          const theta = i * (2 * Math.PI / n);
          points.push({
            ...generatePoint({
              length: len,
              angle: theta
            }),
            value: d.value
          });
        });
        const group = g.append("g").attr("class", "shape");
        drawPath([...points, points[0]], group);
        drawCircles(points);
      };
      const drawAxis = (ticks, levelsCount) => {
        const groupL = g.append("g").attr("class", "tick-lines");
        const point = generatePoint({
          length: r_0,
          angle: 0
        });
        drawPath([center, point], groupL);
        const groupT = g.append("g").attr("class", "ticks");
        ticks.forEach((d, i) => {
          const r = i / levelsCount * r_0;
          const p = generatePoint({
            length: r,
            angle: 0
          });
          const points = [p, {
            ...p,
            x: p.x - 10
          }];
          drawPath(points, groupL);
          drawText(d, p, true, groupT);
        });
      };
      const drawLabels = (dataset, sideCount) => {
        const groupL = g.append("g").attr("class", "labels");
        for (let vertex = 0; vertex < sideCount; vertex++) {
          const angle = vertex * polyangle;
          const label = dataset[vertex].name;
          const point = generatePoint({
            length: 0.9 * (size / 2),
            angle
          });
          drawText(label, point, false, groupL);
        }
      };
      generateAndDrawLevels(NUM_OF_LEVEL, NUM_OF_SIDES);
      generateAndDrawLines(NUM_OF_SIDES);
      drawAxis(ticks, NUM_OF_LEVEL);
      drawData(dataset, NUM_OF_SIDES);
      drawLabels(dataset, NUM_OF_SIDES);
    },
    createQuadrant: function (currentElement, originalData) {
      // Define the four metrics
      const metrics = ["REPORTED", "DEBT", "DENIED", "SUED"];

      // Create an empty container for the quadrant
      const quadrant = document.createElement("div");
      quadrant.classList.add("quadrant");

      // Iterate over the metrics
      for (const metric of metrics) {
        // Get the value of the current metric
        const value = currentElement.getAttribute(`data-${metric}`);

        // Create a div for the current metric
        const div = document.createElement("div");
        div.classList.add("quadrant__item");
        //give the div a class based on the metric
        div.classList.add(`quadrant__item--${metric}`);
        // give the div a data attribute based on the metric
        div.setAttribute("data-metric", metric);

        // Set the background color of the div based on the value of the metric
        if (value.toLowerCase().includes('yes')) {
          div.style.backgroundColor = "#fddede";
          div.style.border = "1.5px solid darkred";
          //fill in the text of the div
          //check the current metric and change the copy based on that
          if (metric === "REPORTED") {
            div.innerHTML = `<span class="quadrant__item--copy">Credit reporting allowed</span>`;
          } else if (metric === "DEBT") {
            div.innerHTML = `<span class="quadrant__item--copy">Selling patient debt allowed</span>`;
          } else if (metric === "DENIED") {
            div.innerHTML = `<span class="quadrant__item--copy">Denying care allowed</span>`;
          } else if (metric === "SUED") {
            div.innerHTML = `<span class="quadrant__item--copy">Legal action allowed </span>`;
          }
        } else if (value.toLowerCase().includes('no')) {
          div.style.backgroundColor = "#dff5db";
          div.style.border = "1.5px solid darkgreen";
          //fill in the text of the div
          if (metric === "REPORTED") {
            div.innerHTML = `<span class="quadrant__item--copy">Credit reporting not allowed</span>`;
          } else if (metric === "DEBT") {
            div.innerHTML = `<span class="quadrant__item--copy">Selling patient debt not allowed</span>`;
          } else if (metric === "DENIED") {
            div.innerHTML = `<span class="quadrant__item--copy">Denying care not allowed</span>`;
          } else if (metric === "SUED") {
            div.innerHTML = `<span class="quadrant__item--copy">Legal action not allowed</span>`;
          }
        } else {
          div.style.backgroundColor = "#e1e1e1";
          div.style.border = "1.5px solid gray";
          if (metric === "REPORTED") {
            div.innerHTML = `<span class="quadrant__item--copy">Unclear if credit reporting allowed</span>`;
          } else if (metric === "DEBT") {
            div.innerHTML = `<span class="quadrant__item--copy">Unclear if selling debt allowed</span>`;
          } else if (metric === "DENIED") {
            div.innerHTML = `<span class="quadrant__item--copy">Unclear if denying care allowed</span>`;
          } else if (metric === "SUED") {
            div.innerHTML = `<span class="quadrant__item--copy">Unclear if legal action allowed</span>`;
          }
        }
        //append a title before the quadrant
        // Append the div to the quadrant
        quadrant.appendChild(div);
      }
      //attach quadrant to radarChart
      const radarChart = document.getElementById("radarChart");
      const title = document.createElement("h3");
      title.classList.add("quadrant__title");
      title.innerHTML = `<span class="modalTitle">HOSPITAL COLLECTION POLICIES:</span>`;
      radarChart.appendChild(title);
      radarChart.appendChild(quadrant);
      return quadrant;
    }
  };

  /*
  ------------------------------
  SECTION: add a tooltip
  ------------------------------

  export const tooltip = d3
      .select("#svganchor")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
      */

  var modal = /*#__PURE__*/Object.freeze({
    __proto__: null,
    modalFunctions: modalFunctions$1
  });

  var url$1 = "https://apps.npr.org/dailygraphics/graphics/fonts/js/lib/webfont.js";
  var script$1 = document.createElement("script");
  script$1.src = url$1;
  document.head.appendChild(script$1);
  script$1.onload = function () {
    WebFont.load({
      google: {
        families: ['Source Sans Pro:400,700']
      },
      timeout: 10000
    });
  };

  var url = "https://apps.npr.org/dailygraphics/graphics/fonts/js/lib/webfont.js";
  var script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);
  script.onload = function () {
    WebFont.load({
      custom: {
        families: ['Gotham SSm:n4,n7', 'Knockout 31 4r:n4'],
        urls: ['https://s.npr.org/templates/css/fonts/GothamSSm.css', 'https://s.npr.org/templates/css/fonts/Knockout.css']
      },
      timeout: 10000
    });
  };

  var pym$1 = pym_1;
  var {
    policies,
    states,
    listOfArrays
  } = object;
  var {
    eventHandlers,
    dropdown,
    policyDropdown,
    stateDropdown
  } = dropdownHandlers;
  var {
    clickHandlers
  } = buttonHandlers;
  var {
    tooltipHandlers,
    tooltip
  } = tooltipHandlers$2;
  var {
    modalFunctions
  } = modal;
  if (document.querySelector("body").classList.contains("npr")) ;
  if (document.querySelector("body").classList.contains("khn")) ;
  pym$1.then(child => {
    /*
    ------------------------------
    VARIABLES: set the size of the canvas, 
    ------------------------------
    */
    const width = 1300; // Chart width
    const height = 800; // Chart height
    const projection = d3.geoAlbers().center([0, 41.83]).rotate([87.65, 0]).parallels([40, 45]).scale(30000).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);
    /*
     
    ------------------------------
    VARIABLES: fetch all of the interactive elements
    ------------------------------
    */
    let currentStateDropdown = document.getElementById("stateDropdownSelector");
    document.getElementById("policyDropdownSelector");
    let showResultsButton = document.getElementById("showResultsButton");

    //create a list of buttons with the button text corresponding to the policies (FAP, COLLECTIONS, REPORTED, DEBT, SUED, DENIED)
    document.querySelectorAll(".button");
    let countedNames = {};
    let listOfCountedNames = [];
    let buttonTextOption = window.BUTTONS;
    buttonTextOption = JSON.parse(buttonTextOption);

    /*
    ------------------------------
    VARIABLES: iterate over listOfArrays (except for State and Hospital Type) and add a button for each policy
    ------------------------------
    */
    //
    let tempArray = listOfArrays.slice(2);
    tempArray.forEach(array => {
      let button = document.createElement("button");
      button.classList.add("button");
      button.id = array[0];
      button.innerText = array[0];

      //for each button, find the corresponding policy in the BUTTONS object and set the button text to that
      let currentButtonText = buttonTextOption.find(entry => entry['Abbreviation'] === array[0]);
      if (currentButtonText != undefined) {
        button.innerText = currentButtonText['Policy'];
      }

      /*
      ------------------------------
      FUNCTION: add an event listener to each button
      1. first, remove the class 'active' from all of the buttons
      2. then, add the class 'active' to the button that was clicked
      3. find the policy that corresponds to the button that was clicked. then, call the policydropdownChange function
      4. then, append the button to the buttonContainer
      ------------------------------
      */
      button.addEventListener("click", function (d) {
        let listofButtons = document.getElementsByClassName("button");
        for (let i = 0; i < listofButtons.length; i++) {
          let currentButton = listofButtons[i];
          let currentClassList = currentButton.classList;
          currentClassList.remove("active");
        }
        //add the class 'active' to the button that was clicked
        button.classList.add("active");

        //find the policy that corresponds to the button that was clicked. then, call the policydropdownChange function
        let policyKey = Object.keys(policies).find(key => policies[key] === button.id);
        eventHandlers.policydropdownChange(listOfCountedNames, policyKey);
        child.sendHeight();
      });
      document.getElementById("buttonContainer").appendChild(button);
    });

    /*
    ------------------------------
    FUNCTION: attach the event listeners to the state dropdown. 
    ------------------------------
    */
    currentStateDropdown.addEventListener("change", function (d) {
      eventHandlers.stateDropdownChange(states[d.target.value], listOfArrays, d);
      //transform listOfCountedNames so it only includes the hospitals in the current state
      //call policyDropdownChange to update the policy dropdown with just the hospitals in the current state

      child.sendHeight();
    });

    /*
    ------------------------------
    FUNCTION: attach the show and hide results button listener
    ------------------------------
    */
    showResultsButton.addEventListener("click", function () {
      //change copy of the button depending on whether the results are showing or not
      if (showResultsButton.innerText == "SHOW RESULTS") {
        showResultsButton.innerText = "HIDE RESULTS";
      } else {
        showResultsButton.innerText = "SHOW RESULTS";
      }
      clickHandlers.buttonClicked();
      child.sendHeight();
    });

    /*
    ------------------------------
    METHOD: create the update method.
    1. create a few variables 
    2. get the data from the window object. for each entry in the data, create a new object where you format the data to fit your needs. put it in countyToFIPSCode
    3. create
    ------------------------------
    */
    let key = d3.select("#keyHTMLContainer");
    key.html(`<div id="keyContainer"><p class="keyDescription">Which hospitals will deny nonemergency medical care to patients with past-due bills?</p><div id="key"><div id="keyWrapper"><div id="keyTextWrapper"><div data-selection="Yes" style="display: inline-flex;"><div style="width: 20px; height: 20px; background-color: rgb(183, 3, 3); float: left; margin-right: 5px; margin-top: 0px;"></div><p>Yes, will deny medical care</p></div><div data-selection="Other" style="display: inline-flex;"><div style="width: 20px; height: 20px; background-color: #8E7B92; float: left; margin-right: 5px; margin-top: 0px;"></div><p>Unclear</p></div><div data-selection="No" style="display: inline-flex;"><div style="width: 20px; height: 20px; background-color: #631D6F; float: left; margin-right: 5px; margin-top: 0px;"></div><p>No, doesn't deny care</p></div></div><div id="keyBarGraph2"><div id="YesBar2" data-selection="Yes" style="height: 20px; width: 17.0455%; margin-bottom: 3px; background-color: rgb(183, 3, 3);"><span style="color: white; font-size: 12px; font-weight: bold; margin-left: 3px;">90</span></div><div id="UnclearBar2" data-selection="Other" style="height: 20px; width: 23.8636%; margin-bottom: 3px; background-color: #8E7B92;"><span style="color: white; font-size: 12px; font-weight: bold; margin-left: 3px;">126</span></div><div id="NoBar2" data-selection="No" style="height: 20px; width: 59.0909%; margin-bottom: 3px; background-color: #631D6F;"><span style="color: white; font-size: 12px; font-weight: bold; margin-left: 3px;">312</span></div></div></div></div></div>`);
    function update(svg, us, radius) {
      d3.geoPath();
      let dataForModal = {};
      let dataForModalCMS = {};
      d3.csv('./hospitalScores.csv').then(function (data) {
        data = window.data;
        //convert newData to a json object
        data = JSON.parse(data);
        let countyToFIPSCode = [];
        data.forEach(function (d) {
          if (d['FIPS'] != undefined) {
            // extract only c_fips and per_capita (or total)
            let currentEntry = {
              fips: d['FIPS'],
              cmsID: d['CMS Facility ID'],
              latitude: d['Latitude'],
              longitude: d['Longitude'],
              CITY: d['City'],
              NAME: d['Name'],
              SYSTEM: d['System'],
              county: d['County'],
              state: d['State'],
              AID: d['Aid for patients with large bills?'],
              HOSPITAL_TYPE: d['Hospital type'],
              BEDS: d['Beds'],
              REPORTED: d['Can patients be reported to credit bureaus?'],
              ASSETS: d['Assets considered?'],
              FAP: d['Financial Assistance Policy available online?'],
              FAP_LINK: d['FAP link'],
              FIN_ASSIST: d['Info on financial assistance available with "financial assistance" search?'],
              LIENS: d['Places liens or garnishes wages?'],
              COLLECTIONS: d['Collection policies available online?'],
              COLLECTIONS_LINK: d['Collections link'],
              REPORTED: d['Can patients be reported to credit bureaus?'],
              DEBT: d["Can patients' debts be sold?"],
              DISCOUNT: d["Qualifying income for discounted care"],
              FREE: d["Qualifying income for free care"],
              SUED: d['Can patients be sued or subject to wage garnishment or property liens?'],
              SCORECARD: d['Scorecard notes'],
              PUBLIC: d['Public university system?'],
              USNEWS: d['US News top 20?'],
              DENIED: d['Can patients with debt be denied nonemergency care?']
            };
            //create all the data in countyToFIPSCode
            //set d[FIPS] to a variable. if it has 4 digits, add a 0 to the front. if it has 5 digits, leave it alone
            let fipsCode = d['FIPS'];
            let cmsID = d['CMS Facility ID'];
            if (fipsCode.toString().length < 5) {
              fipsCode = '0' + fipsCode;
            }
            dataForModal[fipsCode] = currentEntry; // add to the original data
            dataForModalCMS[cmsID] = currentEntry; // add to the original data

            if (countyToFIPSCode.find(d => d['fips'] === fipsCode) === undefined) {
              countyToFIPSCode.push(currentEntry);
            }
          }
        });
        let dataLatLong = data;

        // transform data so its a map of FIPS code => data
        data = data.map(x => Object.values(x));
        data = new Map(data);

        //create a new object where the key is the fips code. use that new object to get the data for each state
        let whatever = countyToFIPSCode;
        whatever.forEach(obj => {
          let key = obj['fips'];
          if (key.toString().length > 4) {
            key = key;
          } else {
            key = '0' + key;
          }
        });

        //transform the countyToFIPSCode to a Map of d[fips] => data. make the key the fips code, and a string
        countyToFIPSCode = countyToFIPSCode.map(x => Object.values(x));
        countyToFIPSCode = new Map(countyToFIPSCode);

        /*
        ------------------------------
        SECTION: draw the map with the circles; attach the appropriate data to each circle
        1. select the g element
        2. select all the circles
        3. for each circle, get the data from the data object. if the data object has the fips code, then get the data. otherwise, return null
        4. join the data to the circles via attributes
        ------------------------------
        */

        // define the projection function

        let key = d3.select("#keyHTMLContainer");
        key.html(`<div id="keyContainer"><p class="keyDescription">Which hospitals will deny nonemergency medical care to patients with past-due bills?</p><div id="key"><div id="keyWrapper"><div id="keyTextWrapper"><div data-selection="Yes" style="display: inline-flex;"><div style="width: 20px; height: 20px; background-color: rgb(183, 3, 3); float: left; margin-right: 5px; margin-top: 0px;"></div><p>Yes, will deny medical care</p></div><div data-selection="Other" style="display: inline-flex;"><div style="width: 20px; height: 20px; background-color: #8E7B92; float: left; margin-right: 5px; margin-top: 0px;"></div><p>Unclear</p></div><div data-selection="No" style="display: inline-flex;"><div style="width: 20px; height: 20px; background-color: #631D6F; float: left; margin-right: 5px; margin-top: 0px;"></div><p>No, doesn't deny care</p></div></div><div id="keyBarGraph2"><div id="YesBar2" data-selection="Yes" style="height: 20px; width: 17.0455%; margin-bottom: 3px; background-color: rgb(183, 3, 3);"><span style="color: white; font-size: 12px; font-weight: bold; margin-left: 3px;">90</span></div><div id="UnclearBar2" data-selection="Other" style="height: 20px; width: 23.8636%; margin-bottom: 3px; background-color: #8E7B92;"><span style="color: white; font-size: 12px; font-weight: bold; margin-left: 3px;">126</span></div><div id="NoBar2" data-selection="No" style="height: 20px; width: 59.0909%; margin-bottom: 3px; background-color: #631D6F;"><span style="color: white; font-size: 12px; font-weight: bold; margin-left: 3px;">312</span></div></div></div></div></div>`);

        // plot the circles using the projection function to convert the latitude/longitude coordinates to x/y coordinates
        svg.select("g").selectAll("circle").data(dataLatLong) // use the latitude/longitude data
        .join("circle").transition().attr('class', function (d) {
          //check to see if d.id's length is 4 or 5. if it's 4, add a 0 to the front of it. otherwise, just return d.id
          return 'hoverable ' + d['CMS Facility ID'];
        }).ease(d3.easeLinear).attr("transform", function (d) {
          return `translate(${projection([d.Longitude, d.Latitude])})`;
        }) // use the projection function to convert the latitude/longitude coordinates to x/y coordinates
        .attr("fill", function (d) {
          let currentAnswer = d['Can patients with debt be denied nonemergency care?'];
          //check if yes is a substring of the current answer. if it is, return red. if not, return blue
          if (currentAnswer.toLowerCase().includes('yes')) {
            return '#b70303';
          } else if (currentAnswer.toLowerCase().includes('no')) {
            return '#631D6F';
          } else {
            return '#8E7B92';
          }
        }).attr("data-fips", function (d) {
          return d.id;
        }).attr("data-state", function (d) {
          return d['State'];
        }).attr("data-cmsID", function (d) {
          return d['CMS Facility ID'];
        }).attr("data-CITY", function (d) {
          return d['City'];
        }).attr("data-hospitalType", function (d) {
          return d['Hospital type'];
        }).attr("data-beds", function (d) {
          return d['Beds'];
        }).attr("data-FAP", function (d) {
          return d['Financial Assistance Policy available online?'];
        }).attr("data-FAPLINK", function (d) {
          return d['FAP link'];
        }).attr("data-COLLECTIONS", function (d) {
          return d['Collection policies available online?'];
        }).attr("data-COLLECTIONS_LINK", function (d) {
          return d['Collection policies available online?'];
        }).attr("data-REPORTED", function (d) {
          return d['Can patients be reported to credit bureaus?'];
        }).attr("data-DEBT", function (d) {
          return d["Can patients' debts be sold?"];
        }).attr("data-SUED", function (d) {
          return d['Can patients be sued or subject to wage garnishment or property liens?'];
        }).attr("data-DENIED", function (d) {
          return d['Can patients with debt be denied nonemergency care?'];
        }).attr("data-FREE", function (d) {
          return d['Qualifying income for free care'];
        }).attr("data-SCORECARD", function (d) {
          return d['Scorecard notes'];
        }).attr("data-FINASSIST", function (d) {
          return d['Info on financial assistance available with "financial assistance" search?'];
        }).attr("data-ASSETS", function (d) {
          return d['Assets considered?'];
        }).attr("data-LIENS", function (d) {
          return d['Places liens or garnishes wages?'];
        }).attr("data-AID", function (d) {
          return d['Aid for patients with large bills?'];
        }).attr("data-NAME", function (d) {
          return d['Name'];
        }).attr("data-SYSTEM", function (d) {
          return d['System'];
        }).attr("data-DISCOUNT", function (d) {
          return d['Qualifying income for discounted care'];
        }).attr("data-PUBLIC", function (d) {
          return d['Public university system?'];
        }).attr("data-USNEWS", function (d) {
          return d['US News top 20?'];
        }).attr("r", d => radius(''));
        //write a sql query that will read in the data where teh year column in 2020

        //for every array in List of Arrays, filter the items to display the count of unique items. use this count to determine the radius of the circle
        listOfArrays.forEach(function (array) {
          countedNames = array.reduce((allAnswers, answer) => {
            const currCount = allAnswers[answer] ?? 0;
            return {
              ...allAnswers,
              [answer]: currCount + 1
            };
          }, {});
          listOfCountedNames.push(countedNames);
        });

        /*
        ------------------------------
        METHOD: attach hover event handlers to the circles to call the tooltip
        ------------------------------
        */
        svg.selectAll(".state").on("mousemove", function (d) {
          tooltipHandlers.mouseEnter(d.pageX, d.pageY, d.srcElement, dataForModal, dataForModalCMS);
        }).on("mouseout", function (d) {
          tooltipHandlers.mouseOut(d.srcElement);
          //change the fill color of the circle back to its original color
        });

        /*
        ------------------------------
        METHOD: build out and populate the side column
        ------------------------------
        */
        let fixedSideColumn = document.getElementById("fixedSideColumn");
        //let fixedSideColumnTop = document.getElementById('fixedSideColumnTop')
        //print size of dataForModal
        svg.select("g").selectAll("circle").attr("data-state", function (d) {
          let currentEntry = dataForModal[d.id];
          if (currentEntry) {
            return currentEntry.state;
          } else return 'none';
        });
        const sortedData = Object.values(dataForModalCMS).sort(function (a, b) {
          if (a['state'] < b['state']) {
            return -1;
          }
          if (a['state'] > b['state']) {
            return 1;
          }
          if (a['state'] == b['state']) {
            if (a['CITY'] < b['CITY']) {
              return -1;
            }
            if (a['CITY'] > b['CITY']) {
              return 1;
            }
            return 0;
          }
        });
        for (const entry in sortedData) {
          let currentEntry = sortedData[entry];
          let sideColumnDiv = document.createElement("div");
          sideColumnDiv.className = "sideColumnHospital";
          sideColumnDiv.setAttribute("data-fips", currentEntry['fips']);
          sideColumnDiv.setAttribute("data-city", currentEntry['CITY']);
          sideColumnDiv.setAttribute("data-state", currentEntry.state);
          sideColumnDiv.setAttribute("data-cmsID", currentEntry['cmsID']);
          sideColumnDiv.setAttribute("data-hospitalType", currentEntry.HOSPITAL_TYPE);
          sideColumnDiv.setAttribute("data-beds", currentEntry.Beds);
          sideColumnDiv.innerHTML = `<div class="hoverableContent ${currentEntry.fips}"><div><b>${currentEntry.NAME}</b> </div><div>${currentEntry.CITY}, ${currentEntry.state}</div><div>${currentEntry.SYSTEM}</div></div>`;
          fixedSideColumn.appendChild(sideColumnDiv);
        }

        //create close button and append it as a child to the modal element
        svg.selectAll("circle").on("click", function (d) {
          modalFunctions.clickCircle(d.srcElement, dataForModal, dataForModalCMS);
        });

        /*
        ------------------------------
        SECTION: hover over each of the sections in the side column. Attach hover and click events to each of the elements that bring up the modal
        ------------------------------
        */
        let hoverableContent1 = document.getElementsByClassName("sideColumnHospital");
        for (let i = 0; i < hoverableContent1.length; i++) {
          hoverableContent1[i].addEventListener("mousemove", function (d) {
            //get the current fips code

            let currentFips = d.target.getAttribute("data-fips");
            let currentCMS = d.target.getAttribute("data-cmsID");
            //if fips has four digits, add a 0 to the front
            if (currentFips.length == 4) {
              currentFips = "0" + currentFips;
            }
            //get the current circle
            let currentCircle = document.querySelector(`circle[data-cmsID="${currentCMS}"]`);
            if (currentCircle) {
              //get position of the circle
              let circlePosition = currentCircle.getBoundingClientRect();
              //get the x position of the circle
              tooltipHandlers.mouseEnter(circlePosition.x, circlePosition.y - 100, currentCircle, dataForModal, dataForModalCMS);
            }
          });
          hoverableContent1[i].addEventListener("mouseout", function (d) {
            let currentFips = d.target.getAttribute("data-fips");
            let currentCMS = d.target.getAttribute("data-cmsID");
            if (currentFips.length == 4) {
              currentFips = "0" + currentFips;
            }
            let currentCircle = document.querySelector(`circle[data-cmsID="${currentCMS}"]`);
            if (currentCircle) {
              tooltipHandlers.mouseOut(currentCircle);
            }
          });
          hoverableContent1[i].addEventListener("click", function (d) {
            let currentFips = d.target.getAttribute("data-fips");
            let currentCMS = d.target.getAttribute("data-cmsID");
            if (currentFips.length == 4) {
              currentFips = "0" + currentFips;
            }
            let currentCircle = document.querySelector(`circle[data-cmsID="${currentCMS}"]`);
            if (currentCircle) {
              modalFunctions.clickCircle(currentCircle, dataForModal, dataForModalCMS);
            }
          });
        }
      });
    }

    /*
    ------------------------------
    METHOD: load in the map
    ------------------------------
    */
    d3.json("https://unpkg.com/us-atlas@3.0.0/counties-10m.json").then(function (us) {
      console.log(us.objects);
      const svg = d3.select("#svganchor").append("svg").attr("viewBox", [-10, 0, 975, 610]);

      // outline us map
      svg.append("path").datum(topojson.feature(us, us.objects.nation)).attr("fill", "#ddd").attr("d", path);

      // outline state border
      svg.append("path").datum(topojson.mesh(us, us.objects.counties, (a, b) => a !== b)).attr("fill", "none").attr("stroke", "white").attr("stroke-linejoin", "round").attr("d", path);

      // for circle
      svg.append("g").attr("class", "state").attr("fill-opacity", 0.6).attr("stroke", "#fff").attr("stroke-width", 1);
      let radius = d3.scaleSqrt([0, 10], [8, 8]);
      const legend = svg.append("g").attr("fill", "#777").attr("transform", "translate(925,608)").attr("text-anchor", "middle").style("font", "10px sans-serif").selectAll("g").data([0.001, 0.005, 0.01]).join("g");
      legend.append("circle").attr("fill", "none").attr("stroke", "#ccc").attr("cy", d => -radius(d)).attr("r", radius);
      legend.append("text").attr("y", d => -2 * radius(d)).attr("dy", "1.3em");
      //  .text(d3.format(".4"));

      update(svg, us, radius);
      //fire the click event for the DENIED button, click, then click again after 3 seconds after the page loads
      let deniedButton = document.getElementById("DENIED");
      //after the page loads, click the denied button
      deniedButton.click();
      window.addEventListener("load", function () {
        setTimeout(function () {
          deniedButton.click();
        }, 500);
      });

      //call the policy dropdown change handler so the circles are changed to the default policy on page load
      child.sendHeight();
      window.addEventListener("resize", () => child.sendHeight());
      deniedButton.click();
    }).catch(function (error) {
      console.log(error);
    });
  });

  return graphic;

}));

//# sourceMappingURL=./graphic.js.map