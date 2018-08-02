
const box = document.getElementById("container");
box.addEventListener("click", (event) => cursorIsOnSheet(event.clientX,event.clientY) );

const cursorIsOnSheet = (x,y) => {
    const sheet = document.getElementById("sheet"),
          sheetStyle = window.getComputedStyle(sheet);    
    console.log(x,y, sheetStyle);
};