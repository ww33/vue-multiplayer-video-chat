export const detectIsMobile = () => {
  let isMobile = false; //initiate as false
  // device detection
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
    isMobile = true;
  }

  return isMobile
};

// export const setLocalValue = (key: string, value: any) => {
//   localStorage.setItem(key, value)
// };
//
// export const getLocalValue: any = (key: string) => {
//   return localStorage.getItem(key)
// };

// export const savedProfiles: any = () => {
//   try {
//     const profilesStr = getLocalValue('profiles')
//     const profiles = JSON.parse(profilesStr)
//     return profiles || []
//   }catch (e) {
//     return []
//   }
// }

export const uuid4: any =  () => {
  //// return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  let uuid = '', ii;
  for (ii = 0; ii < 32; ii += 1) {
    switch (ii) {
      case 8:
      case 20:
        uuid += '-';
        uuid += (Math.random() * 16 | 0).toString(16);
        break;
      case 12:
        uuid += '-';
        uuid += '4';
        break;
      case 16:
        uuid += '-';
        uuid += (Math.random() * 4 | 8).toString(16);
        break;
      default:
        uuid += (Math.random() * 16 | 0).toString(16);
    }
  }
  return uuid;
};

/*
(function () { // make vuetify dialogs movable
  const d = {};
  document.addEventListener("mousedown", e => {
    const closestDialog = e.target.closest(".v-dialog.v-dialog--active");
    if (e.button === 0 && closestDialog != null && e.target.classList.contains("v-card__title")) { // element which can be used to move element
      d.el = closestDialog; // element which should be moved
      d.mouseStartX = e.clientX;
      d.mouseStartY = e.clientY;
      d.elStartX = d.el.getBoundingClientRect().left;
      d.elStartY = d.el.getBoundingClientRect().top;
      d.el.style.position = "fixed";
      d.el.style.margin = 0;
      d.oldTransition = d.el.style.transition;
      d.el.style.transition = "none"
    }
  });
  document.addEventListener("mousemove", e => {
    if (d.el === undefined) return;
    d.el.style.left = Math.min(
      Math.max(d.elStartX + e.clientX - d.mouseStartX, 0),
      window.innerWidth - d.el.getBoundingClientRect().width
    ) + "px";
    d.el.style.top = Math.min(
      Math.max(d.elStartY + e.clientY - d.mouseStartY, 0),
      window.innerHeight - d.el.getBoundingClientRect().height
    ) + "px";
  });
  document.addEventListener("mouseup", () => {
    if (d.el === undefined) return;
    d.el.style.transition = d.oldTransition;
    d.el = undefined
  });
  setInterval(() => { // prevent out of bounds
    const dialog = document.querySelector(".v-dialog.v-dialog--active");
    if (dialog === null) return;
    dialog.style.left = Math.min(parseInt(dialog.style.left), window.innerWidth - dialog.getBoundingClientRect().width) + "px";
    dialog.style.top = Math.min(parseInt(dialog.style.top), window.innerHeight - dialog.getBoundingClientRect().height) + "px";
  }, 100);
})();
*/
