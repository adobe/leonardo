/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

function openPanelTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("paneltabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("panel-Tabs-item");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.className += " is-selected";
}

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("main-Tabs-item");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.className += " is-selected";
}

function openDetailTab(evt, tabName, colors) {
  // Declare all variables
  var i, tabcontent, tablinks;
  let thisId = evt.target.id;
  if(!tabName) tabName = thisId.concat('Content')

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabDetailContent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("detail-Tabs-item");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.className += " is-selected";

  if(tabName === 'tabModelContent') {
    // chartData.createData(colors);
    // charts.init3dChart()
  };
}

function openAppTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("AppTab");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("app-Tabs-item");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "grid";
  evt.currentTarget.className += " is-selected";
}

function openSideNavItem(evt, contentName) {
  // Declare all variables
  var i, sidenavcontent, sidenavlinks;

  // Get all elements with class="sideNavContent" and hide them
  sidenavcontent = document.getElementsByClassName("sideNavContent");
  for (let i = 0; i < sidenavcontent.length; i++) {
    sidenavcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-SideNav-item" and remove the class "is-selected"
  sidenavlinks = document.getElementsByClassName("spectrum-SideNav-item");
  for (let i = 0; i < sidenavlinks.length; i++) {
    sidenavlinks[i].className = sidenavlinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(contentName).style.display = "grid";
  evt.currentTarget.parentNode.className += " is-selected";
}

function openColorTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("colorTabsWrapper");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("color-Tabs-item");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.className += " is-selected";
}

window.openPanelTab = openPanelTab;
window.openTab = openTab;
window.openDetailTab = openDetailTab;
window.openAppTab = openAppTab;
window.openSideNavItem = openSideNavItem;
window.openColorTab = openColorTab;

document.getElementById("tabPanelColorScales").click();
document.getElementById("tabOutput").click();
document.getElementById("tabHome").click();
document.getElementById("welcome").click();
document.getElementById("tabColorWheel").click();

module.exports = {
  openPanelTab,
  openTab,
  openDetailTab,
  openAppTab,
  openSideNavItem,
  openColorTab
}